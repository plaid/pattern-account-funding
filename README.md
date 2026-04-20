# Plaid Pattern - Account Funding

![Plaid Pattern client][client-img]

This is a sample Account Funding application demonstrating an end-to-end [Plaid][plaid] integration, focused on using the auth (or working with a Plaid partner using processor tokens), identity and balance endpoints to safely transfer funds.

The full Plaid collection of related sample apps includes:

[Plaid Pattern Account Funding App](https://github.com/plaid/pattern-account-funding) - (you are here) Demonstrates the Plaid Auth, Balance / Signal, and Identity APIs

[Plaid Auth tutorial app](https://github.com/plaid/tutorial-resources/tree/main) - Demonstrates the Auth API in more depth (including micro-deposit-based verification) but does NOT include Balance / Signal or Identity APIs. Has an accompanying [video tutorial](https://www.youtube.com/watch?v=FlZ5nzlIq74).

[Plaid Transfer Quickstart app](https://github.com/plaid/transfer-quickstart) - Demonstrates the Transfer API

[Plaid Pattern Personal Finance Manager](https://github.com/plaid/pattern/) - Demonstrates the Plaid Transactions API, with a focus on webhooks and transaction reconciliation

Plaid sample apps are provided for illustrative purposes and are not meant to be run as production applications.

## Requirements

-   [Node.js](https://nodejs.org/) v20 or higher
-   [PostgreSQL](https://www.postgresql.org/) v16 or higher
-   [Plaid API keys][plaid-keys] - [sign up][plaid-signup] for a free Sandbox account if you don't already have one
-   [ngrok](https://ngrok.com/) for webhook testing - [sign up for free](https://dashboard.ngrok.com/signup) if you don't already have an account

### Installing prerequisites

**macOS (Homebrew):**
```shell
brew install node@20 postgresql@16 ngrok
brew services start postgresql@16
```

**Windows:**

We recommend using [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) (Windows Subsystem for Linux) and following the Linux instructions below.

**Linux (Ubuntu/Debian):**
```shell
# Node.js v20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql

# ngrok: see https://ngrok.com/download
```

## Getting Started

1. Clone the repo.
    ```shell
    git clone https://github.com/plaid/pattern-account-funding.git
    cd pattern-account-funding
    ```

1. Create the `.env` file.
    ```shell
    cp .env.template .env
    ```

1. Update the `.env` file with your [Plaid API keys][plaid-keys] and, optionally, your OAuth redirect URI (in sandbox this is `http://localhost:3002/oauth-link`).

1. **Configure Ruleset** (Required): This app uses Signal Rules to evaluate transfer risk. You must create a ruleset in the [Plaid Dashboard](https://dashboard.plaid.com/signal/risk-profiles/default?environment=sandbox) and add the `RULESET_KEY` to your `.env` file. Without this, balance checks and transfers will fail. You can use either a Balance-only Ruleset or a Signal Transaction Scores-powered ruleset.

1. Install dependencies.
    ```shell
    npm run install:all
    ```

1. Set up the database.
    ```shell
    npm run db:create
    ```

1. Configure ngrok for webhooks.
    ```shell
    ngrok config add-authtoken <your-authtoken>
    ```
    Get your authtoken at https://dashboard.ngrok.com/get-started/your-authtoken.

1. (Optional, only required if using an OAuth redirect URI) You will also need to configure an allowed redirect URI for your client ID through the [Plaid developer dashboard](https://dashboard.plaid.com/team/api).

1. Start the application. You'll need three separate terminal windows:

    **Terminal 1 - Server:**
    ```shell
    npm run server
    ```

    **Terminal 2 - Client:**
    ```shell
    npm run client
    ```

    **Terminal 3 - ngrok (for webhooks):**
    ```shell
    make ngrok
    ```

1. Open http://localhost:3002 in a web browser.

## Additional Commands

All available commands can be seen by calling `make help`.

| Command | Description |
|---------|-------------|
| `make install` | Install client and server dependencies |
| `make server` | Start the server |
| `make client` | Start the client |
| `make ngrok` | Start ngrok tunnel for webhooks |
| `make db-create` | Initialize the database tables |
| `make db-reset` | Drop and recreate the database |
| `make sql` | Open an interactive psql session |

## Development Workflow

### Making Code Changes

- **Server code changes** (`server/` directory): Restart the server process to see changes.
- **Client code changes** (`client/src/` directory): Vite HMR automatically recompiles and refreshes the browser.

### Changing Environment Variables

1. **Server environment variables**: Restart the server process.
2. **Client environment variables** (prefixed with `VITE_`): These are baked into the client bundle at build time. Restart the client process, then perform a **hard refresh** in your browser (Cmd+Shift+R / Ctrl+Shift+R) to clear cached JavaScript.

## Architecture

As a modern full-stack application, Pattern consists of multiple services handling different segments of the stack:

-   **Client**: A [React]-based single-page web frontend (port 3002)
-   **Server**: A [Node.js][nodejs] + [Express][expressjs] application back-end (port 5001)
-   **Database**: A [PostgreSQL][postgres] database (port 5432)
-   **ngrok**: Exposes the local server to the Internet for receiving webhooks (port 4040 dashboard)

# Plaid Pattern - Client

The Pattern web client is written in JavaScript using [React]. It presents a basic [Link][plaid-link] workflow to the user, including an implementation of [OAuth][plaid-oauth] as well as a demonstration of [Link update mode][plaid-link-update-mode]. The sample app allows you to choose to use identification mode, where an enduser must input the name and email associated with their financial institution. The app runs on port 3002 by default.

## Key concepts

### Communicating with the server

Aside from websocket listeners (see below), all HTTP calls to the Pattern server are defined in `src/services/api.js`.

### Rendering Link

This app uses the classic mode of rendering Link. If you are building a Pay-by-bank app rather than an account funding app, the [Embedded Institution Search](https://plaid.com/docs/link/embedded-institution-search/) feature is strongly recommended instead, to increase uptake of pay-by-bank. See the [Plaid Transfer Quickstart](https://github.com/plaid/transfer-quickstart) for an example of this in action.

### Webhooks and Websockets

The Pattern server is configured to send a message over a websocket whenever it receives a webhook from Plaid. On the client side have websocket listeners defined in `src/components/Sockets.jsx` that wait for these messages and update data in real time accordingly.

The `PENDING_DISCONNECT`, `PENDING_EXPIRATION`, and `ITEM_LOGIN_REQUIRED` Item webhooks demonstrated in this sample app in the [items webhook handler][items-handler].

### Admin

A view of all users is provided to developers on `http://localhost:3002/admin`. Developers have the ability to remove a user here.

# Plaid Pattern - Server

The application server is written in JavaScript using [Node.js][nodejs] and [Express][expressjs]. It interacts with the Plaid API via the [Plaid Node SDK][plaid-node], and with the [database][database-readme] using [`node-postgres`][node-pg]. While we've used Node for the reference implementation, the concepts shown here will apply no matter what language your backend is written in.

## Key Concepts

### Associating users with Plaid items and access tokens

Plaid does not have a user data object for tying multiple items together, so it is up to application developers to define that relationship. For an example of this, see the [root items route][items-routes] (used to store new items) and the [users routes][users-routes].

### Using webhook to test update mode in Link.

Plaid uses [webhooks][error-webhooks] to notify you whenever an item enters an error state. If a user needs to update their login information at their financial institution, an item will display an ITEM_LOGIN_REQUIRED error. This sample app demonstrates the use of the sandboxItemResetLogin endpoint to test this webhook. For an example of this, see the [items webhook handler][items-handler].

For webhooks to work, the server must be publicly accessible on the internet. For development purposes, this application uses [ngrok](https://ngrok.com/) to accomplish that. Therefore, if the server is re-started, any items created in this sample app previous to the current session will have a different webhook address attached to it. As a result, webhooks are only valid during the session in which an item is created; for previously created items no webhook will be received from the call to sandboxItemResetLogin.

### Testing OAuth

The `linkTokenCreate` call includes a `redirect_uri` parameter, which the server applications reads from the `PLAID_SANDBOX_REDIRECT_URI` entry in the .env file (This value should be `http://localhost:3002/oauth-link`). This is the page that the user will be redirected to upon completion of the OAuth flow at their OAuth institution. When running in Production, you will need to use an `https://` redirect URI, but a `http://` URI will work for Sandbox.

You will also need to add `http://localhost:3002/oauth-link` as an allowed redirect URI for your client ID in API section of the [Plaid developer dashboard](https://dashboard.plaid.com/team/api).

To test the OAuth flow, choose 'Playtypus OAuth Bank' from the list of financial instutions in Plaid Link.

### Working with Plaid Partners

This sample app can also demonstrate the creation of a processor token for use with Plaid partners. While still initializing Link with the Auth product, instead of of using Plaid Auth endpoints, an example of the creation of a processor token and integration with a plaid partner is included in the [root items route][items-routes].

#### Using Dwolla sandbox as a test case

This sample app uses Dwolla sandbox to demonstrate the transferring of funds with a Plaid partner. Dwolla is just one of the many [payment providers](https://plaid.com/docs/auth/partnerships/) who have partnered with Plaid. To test out the Dwolla sandbox flow, follow these steps:

1. Go to your [Plaid developer dashboard Integrations page](https://dashboard.plaid.com/team/integrations). Scroll down to Dwolla and click on the "enable" button.

2. Head to the [Dwolla site](https://developers.dwolla.com/guides/sandbox) and create a sandbox account by clicking the `Get API Keys` button and following the sign up instructions.

3. After logging in, create a temporary access token by clicking on the "Create Token" button on Dwolla's dashboard [Applications Page](https://dashboard-sandbox.dwolla.com/applications-legacy). Copy this token and add it to the .env file as `DWOLLA_ACCESS_TOKEN`. This is a temporary access token issued by Dwolla which is good for one hour.
4. Go to your Dwolla [Master Account Funding Source](https://dashboard-sandbox.dwolla.com/account/funding-sources) on the dashboard and obtain your id from your Superhero Savings Bank. This is the very last number in the smaller white box on the bottom left corner of the page. Enter this id in the .env file as the `DWOLLA_MASTER_ACCOUNT_ID`.
5. Finally, make sure that `IS_PROCESSOR` is set to `true` in the .env file.

### Verifying and transferring funds

This sample app uses Signal Rulesets to evaluate transfer risk before allowing funds to be transferred. These Rulesets can be powered by either Balance or Signal Transaction Scores. To learn more, see the [Ruleset docs](https://plaid.com/docs/signal/signal-rules/).

The app calls the `/signal/evaluate` endpoint with a configured ruleset to assess the risk of each transfer. Only transfers that receive an "accept" outcome from the ruleset evaluation are allowed to proceed.

The app also displays account details including account and routing numbers, as well as the available balance.

Note: This app does not actually make real transfers of funds. The balance in the linked Sandbox account will not decrement when a transfer is made in this app.

## Debugging

To debug the server, start it with the Node.js inspector:

```shell
cd server
node --inspect index.js
```

Then open `chrome://inspect` in Chrome and click "inspect" next to the Node.js target.

If you are using Visual Studio Code, you can use the `Attach to Server` launch configuration to interactively debug the server while it's running. See the [VS Code docs][vscode-debugging] for more information.

# Plaid Pattern - Database

The database is a [PostgreSQL][postgres] instance running locally.

Port 5432 is exposed by default. Username and password can be found in `.env` (defaults: `postgres` / `password`).

## Key Concepts

### Plaid API & Link Identifiers

API and Link Identifiers are crucial for maintaining a scalable and stable integration.
Occasionally, an Institution error may occur due to a bank issue, or a live product pull may fail on request.
To resolve these types of issues, Plaid Identifiers are required to [open a Support ticket in the Dashboard][plaid-new-support-ticket].

`access_tokens` and `item_ids` are the core identifiers that map end-users to their financial institutions.
As such, we are storing them in the database associated with our application users.
**These identifiers should never be exposed client-side.**

Plaid returns a unique `request_id` in all server-side responses and Link callbacks.
A `link_session_id` is also returned in Link callbacks.
These values can be used for identifying the specific network request or Link session for a user, and associating that request or session with other events in your application.
We store these identifiers in database tables used for logging Plaid API requests, as they can be useful for troubleshooting.

For more information, see the docs page on [storing Plaid API identifiers][plaid-docs-api-identifiers].

## Tables

The `*.sql` scripts in the `init` directory are used to initialize the database (on first run via `npm run db:create`, or after resetting the db via `npm run db:reset`).

See the [create.sql][create-script] initialization script to see some brief notes for and the schemas of the tables used in this application.
While most of them are fairly self-explanitory, we've added some additional notes for some of the tables below.

### link_events_table

This table stores responses from the Plaid API for client requests to the Plaid Link client.

User flows that this table captures (based on the client implementation, which hooks into the `onExit` and `onSuccess` Link callbacks):

-   User opens Link, closes without trying to connect an account.
    This will have type `exit` but no request_id, error_type, or error_code.
-   User tries to connect an account, fails, and closes link.
    This will have type `exit` and will have a request_id, error_type, and error_code.
-   User successfully connects an account.
    This will have type `success` but no request_id, error_type, or error_code.

### plaid_api_events_table

This table stores responses from the Plaid API for server requests to the Plaid client.
The server stores the responses for all of the requests it makes to the Plaid API.
Where applicable, it also maps the response to an item and user.
If the request returned an error, the error_type and error_code columns will be populated.

## Learn More

-   [PostgreSQL documentation][postgres-docs]

## Troubleshooting

If you're experiencing oddities in the app, here are some common problems and their possible solutions.

### Common Issues

### My 'reset login' button does not work

For webhooks to work, the server must be publicly accessible on the internet. For development purposes, this application uses [ngrok](https://ngrok.com/) to accomplish that. Therefore, if the server is re-started, any items created in this sample app previous to the current session will have a different webhook address attached to it. As a result, webhooks are only valid during the session in which an item is created; for previously created items, no webhook will be received from the call to sandboxItemResetLogin. In addition, ngrok webhook addresses are only valid for 2 hours. If you are not receiving webhooks in this sample application, restart your server to reset the ngrok webhook address.

### Changes to `.env` file not taking effect

**Server environment variables**: Restart the server process.

**Client environment variables** (prefixed with `VITE_`): Restart the client process, then perform a hard refresh in your browser (Cmd+Shift+R on Mac / Ctrl+Shift+R on Windows/Linux) to clear cached JavaScript.

### Still need help?

Please head to the [Help Center][plaid-help] or [get in touch][plaid-support-ticket] with Support.

## Additional Resources

-   For an overview of the Plaid platform and products, refer to this [Quickstart guide][plaid-quickstart].
-   Check out this high-level [introduction to Plaid Link](https://blog.plaid.com/plaid-link/).
-   Find comprehensive information on Plaid API endpoints in the [API documentation][plaid-docs].
-   Questions? Please head to the [Help Center][plaid-help] or [open a Support ticket][plaid-support-ticket].

## License

Plaid Pattern is a demo app that is intended to be used only for the purpose of demonstrating how you can integrate with Plaid. You are solely responsible for ensuring the correctness, legality, security, privacy, and compliance of your own app and Plaid integration. The Pattern code is licensed under the [MIT License](LICENSE) and is provided as-is and without warranty of any kind. Plaid Pattern is provided for demonstration purposes only and is not intended for use in production environments.

[create-script]: database/init/create.sql
[plaid-docs-api-identifiers]: https://plaid.com/docs/#storing-plaid-api-identifiers
[plaid-new-support-ticket]: https://dashboard.plaid.com/support/new
[postgres]: https://www.postgresql.org/
[postgres-docs]: https://www.postgresql.org/docs/
[plaid-link]: https://plaid.com/docs/#integrating-with-link
[plaid-oauth]: https://plaid.com/docs/link/oauth/#introduction-to-oauth
[plaid-link-update-mode]: https://plaid.com/docs/link/update-mode/
[react]: https://reactjs.org/
[database-readme]: #plaid-pattern---database
[expressjs]: http://expressjs.com/
[items-routes]: server/routes/items.js
[node-pg]: https://github.com/brianc/node-postgres
[nodejs]: https://nodejs.org/en/
[plaid-node]: https://github.com/plaid/plaid-node
[items-handler]: /server/webhookHandlers/handleItemWebhook.js
[error-webhooks]: https://plaid.com/docs/api/webhooks/#item-error
[users-routes]: /server/routes/users.js
[vscode-debugging]: https://code.visualstudio.com/docs/editor/debugging
[client-img]: docs/account_funding_screenshot.jpg
[express]: https://expressjs.com/
[plaid]: https://plaid.com
[plaid-dashboard]: https://dashboard.plaid.com/team/api
[plaid-docs]: https://plaid.com/docs/
[plaid-help]: https://support.plaid.com/hc/en-us
[plaid-keys]: https://dashboard.plaid.com/developers/keys
[plaid-quickstart]: https://plaid.com/docs/quickstart/
[plaid-signup]: https://dashboard.plaid.com/signup
[plaid-support-ticket]: https://dashboard.plaid.com/support/new
[plaid-redirect-uri]: https://plaid.com/docs/link/oauth/#redirect-uri-configuration
