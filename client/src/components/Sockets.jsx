import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

import { useAccounts, useItems } from '../services/index.js';
const io = require('socket.io-client');

const { REACT_APP_SERVER_PORT } = process.env;

// Helper function to create webhook toast with ngrok inspector link
const showWebhookToast = (msg, type = 'default') => {
  const content = (
    <div>
      <div>{msg}</div>
      <div style={{ marginTop: '8px', fontSize: '0.9em', opacity: 0.8 }}>
        💡 View webhook details at{' '}
        <a
          href="http://localhost:4040"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit', textDecoration: 'underline' }}
        >
          localhost:4040
        </a>
      </div>
    </div>
  );

  if (type === 'error') {
    toast.error(content);
  } else {
    toast(content);
  }
};

const Sockets = () => {
  const socket = useRef();
  const { getAccountsByItem } = useAccounts();
  const { getItemById } = useItems();

  useEffect(() => {
    socket.current = io(`http://localhost:${REACT_APP_SERVER_PORT}`);

    socket.current.on('ERROR', ({ itemId, errorCode } = {}) => {
      const msg = `New Webhook Event: Item ${itemId}: Item Error ${errorCode}`;
      console.error(msg);
      showWebhookToast(msg, 'error');
      getItemById(itemId, true);
    });

    socket.current.on('PENDING_DISCONNECT', ({ itemId } = {}) => {
      const msg = `New Webhook Event: Item ${itemId}: Item will be disconnected in 7 days. To prevent this, user should re-enter login credentials via update mode.`;
      console.log(msg);
      showWebhookToast(msg);
      getItemById(itemId, true);
    });

    socket.current.on('PENDING_EXPIRATION', ({ itemId } = {}) => {
      const msg = `New Webhook Event: Item ${itemId}: Access consent is expiring in 7 days. To prevent this, user should re-enter login credentials via update mode.`;
      console.log(msg);
      showWebhookToast(msg);
      getItemById(itemId, true);
    });

    return () => {
      socket.current.removeAllListeners();
      socket.current.close();
    };
  }, [getAccountsByItem, getItemById]);

  return <div />;
};

Sockets.displayName = 'Sockets';
export default Sockets;
