/**
 * @file The application root. Defines the Express server configuration.
 */

const express = require('express');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const { errorHandler } = require('./middleware');

const {
  usersRouter,
  sessionsRouter,
  itemsRouter,
  accountsRouter,
  institutionsRouter,
  serviceRouter,
  linkEventsRouter,
  linkTokensRouter,
  unhandledRouter,
  appFundsRouter,
} = require('./routes');

const app = express();

const { PORT, PLAID_CLIENT_ID, PLAID_SECRET_SANDBOX, PLAID_SECRET_PRODUCTION } = process.env;

const hasApiKeys = PLAID_CLIENT_ID && (PLAID_SECRET_SANDBOX || PLAID_SECRET_PRODUCTION);

if (!hasApiKeys) {
  console.warn('\n⚠️  WARNING: Plaid API keys are not configured!');
  console.warn('Please add PLAID_CLIENT_ID and PLAID_SECRET_SANDBOX to your .env file');
  console.warn('See .env.template for instructions\n');
}

const server = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
  if (!hasApiKeys) {
    console.warn('⚠️  Server running but Plaid API keys are missing - Link will not work');
  }
});

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3002",
    methods: ["*"],
    allowedHeaders: ["*"],
    credentials: true,
  },
  allowEIO3: true
});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// middleware to pass socket to each request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Set socket.io listeners.
io.on('connection', socket => {
  console.log('SOCKET CONNECTED');

  socket.on('disconnect', () => {
    console.log('SOCKET DISCONNECTED');
  });
});

app.get('/test', (req, res) => {
  res.send('test response');
});

app.use('/users', usersRouter);
app.use('/sessions', sessionsRouter);
app.use('/items', itemsRouter);
app.use('/accounts', accountsRouter);
app.use('/institutions', institutionsRouter);
app.use('/services', serviceRouter);
app.use('/link-event', linkEventsRouter);
app.use('/link-token', linkTokensRouter);
app.use('/appFunds', appFundsRouter);
app.use('*', unhandledRouter);

// Error handling has to sit at the bottom of the stack.
// https://github.com/expressjs/express/issues/2718
app.use(errorHandler);
