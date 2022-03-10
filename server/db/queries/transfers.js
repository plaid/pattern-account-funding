/**
 * @file Defines the queries for the transfers table/view.
 */

const db = require('../');

/**
 * Creates a single item.
 *
 * @param {string} destination_transactions_id the processor destination transactions id.
 * @param {string} source_transactions_id the processor source transactions id.
 * @param {string} itemId the item Id.
 * @param {number} amount the amount being transferred.
 * @returns {Object} the new transfer.
 */
const createTransfer = async (itemId, amount, transferUrl) => {
  // this method only gets called on successfully making a transfer through a processor.
  const query = {
    // RETURNING is a Postgres-specific clause that returns a list of the inserted transfers.
    text: `
       INSERT INTO transfers_table
         (item_id, amount, transfer_url)
       VALUES
         ($1, $2, $3)
       RETURNING
         *;
     `,
    values: [itemId, amount, transferUrl],
  };
  const { rows } = await db.query(query);
  return rows[0];
};

module.exports = {
  createTransfer,
};
