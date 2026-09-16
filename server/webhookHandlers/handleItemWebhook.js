/**
 * @file Defines the handler for Item webhooks.
 * https://plaid.com/docs/#item-webhooks
 */

const {
  updateItemStatus,
  retrieveItemByPlaidItemId,
} = require('../db/queries');

/**
 * Handles Item errors received from item webhooks. When an error is received
 * different operations are needed to update an item based on the the error_code
 * that is encountered.
 *
 * @param {Object} item the stored item the webhook refers to.
 * @param {Object} error the error received from the webhook.
 */
const itemErrorHandler = async (item, error) => {
  const { error_code: errorCode } = error;
  switch (errorCode) {
    case 'ITEM_LOGIN_REQUIRED':
      await updateItemStatus(item.id, 'bad');
      break;
    default:
      console.log(
        `WEBHOOK: ITEMS: Plaid item id ${item.plaid_item_id}: unhandled ITEM error`
      );
  }
};

/**
 * Handles all Item webhook events.
 *
 * @param {Object} requestBody the request body of an incoming webhook event.
 * @param {Object} io a socket.io server instance.
 */
const itemsHandler = async (requestBody, io) => {
  const {
    webhook_code: webhookCode,
    item_id: plaidItemId,
    error,
  } = requestBody;

  const serverLogAndEmitSocket = (additionalInfo, itemId, errorCode) => {
    console.log(
      `WEBHOOK: ITEMS: ${webhookCode}: Plaid item id ${plaidItemId}: ${additionalInfo}`
    );
    // use websocket to notify the client that a webhook has been received and handled
    if (webhookCode) io.emit(webhookCode, { itemId, errorCode });
  };

  // Deliberately logs without emitting: the client's listeners feed itemId
  // straight into getItemById, so emitting a null id would make every
  // connected client request /items/null and surface an error toast.
  const logMissingItem = () => {
    console.log(
      `WEBHOOK: ITEMS: ${webhookCode}: Plaid item id ${plaidItemId}: no matching item, ignoring`
    );
  };

  switch (webhookCode) {
    case 'WEBHOOK_UPDATE_ACKNOWLEDGED':
      serverLogAndEmitSocket('is updated', plaidItemId, error);
      break;
    case 'ERROR': {
      const item = await retrieveItemByPlaidItemId(plaidItemId);
      if (item == null) {
        logMissingItem();
        break;
      }
      await itemErrorHandler(item, error);
      serverLogAndEmitSocket(
        `ERROR: ${error.error_code}: ${error.error_message}`,
        item.id,
        error.error_code
      );
      break;
    }
    case 'PENDING_DISCONNECT':
    case 'PENDING_EXPIRATION': {
      const item = await retrieveItemByPlaidItemId(plaidItemId);
      if (item == null) {
        logMissingItem();
        break;
      }
      await updateItemStatus(item.id, 'bad');
      serverLogAndEmitSocket(
        `user needs to re-enter login credentials`,
        item.id,
        error
      );
      break;
    }
    default:
      serverLogAndEmitSocket(
        'unhandled webhook type received.',
        plaidItemId,
        error
      );
  }
};

module.exports = itemsHandler;
