import React, { useState, useEffect } from 'react';
import { Callout } from './ui/Callout.tsx';
import { IconButton } from './ui/IconButton.tsx';
import { CloseIcon } from './ui/icons.tsx';

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
        <Callout className="relative mb-6">
          <IconButton
            className="absolute right-0 top-0"
            accessibilityLabel="close"
            onClick={() => {
              setShow(false);
              resetError();
            }}
            icon={<CloseIcon />}
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
