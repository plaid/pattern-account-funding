import React, { useState, useEffect } from 'react';
import { Callout } from 'plaid-threads/Callout';
import { IconButton } from 'plaid-threads/IconButton';
import { CloseS2 } from 'plaid-threads/Icons/CloseS2';

import useErrors from '../services/errors.tsx';

// link errors that require a prompt for the enduser

const ErrorMessage: React.FC = () => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const { error, resetError } = useErrors();

  useEffect(() => {
    // Show error if we have an error code
    if (error.code != null) {
      setShow(true);
      setMessage(error.message || 'An unexpected error occurred');
    } else {
      setShow(false);
    }
  }, [error.code, error.message]);

  return (
    <>
      {show && (
        <Callout className="error-msg__callout">
          <IconButton
            className="close-error__button"
            accessibilityLabel="close"
            onClick={() => {
              setShow(false);
              resetError();
            }}
            icon={<CloseS2 />}
          />
          Error: {error.code} <br />
          {message}
        </Callout>
      )}
    </>
  );
};

ErrorMessage.displayName = 'ErrorMessage';
export default ErrorMessage;
