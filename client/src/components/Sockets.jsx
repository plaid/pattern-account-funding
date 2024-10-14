import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

import { useAccounts, useItems } from '../services';
const io = require('socket.io-client');
const { REACT_APP_SERVER_PORT } = process.env;

const Sockets = () => {
  const socket = useRef();
  const { getAccountsByItem } = useAccounts();
  const { getItemById } = useItems();

  useEffect(() => {
    socket.current = io(`http://localhost:${REACT_APP_SERVER_PORT}`);

    socket.current.on('ERROR', ({ itemId, errorCode } = {}) => {
      const msg = `Item ${itemId}: Item Error ${errorCode}`;
      console.error(msg);
      toast.error(msg);
      getItemById(itemId, true);
    });

    socket.current.on('PENDING_DISCONNECT', ({ itemId } = {}) => {
      const msg = `Item ${itemId}: will be disconnected in 7 days. To prevent this, user should re-enter login credentials via update mode.`;
      console.log(msg);
      toast(msg);
      getItemById(itemId, true);
    });

    socket.current.on('PENDING_EXPIRATION', ({ itemId } = {}) => {
      const msg = `Item ${itemId}: will be disconnected in 7 days. To prevent this, user should re-enter login credentials via update mode.`;
      console.log(msg);
      toast(msg);
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
