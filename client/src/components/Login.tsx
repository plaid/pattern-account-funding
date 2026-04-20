import React, { useState } from 'react';
import { Modal } from './ui/Modal.tsx';
import { ModalBody } from './ui/ModalBody.tsx';
import { Button } from './ui/Button.tsx';
import { TextInput } from './ui/TextInput.tsx';

import { useCurrentUser } from '../services/index.js';

const Login: React.FC = () => {
  const { login } = useCurrentUser();
  const [show, setShow] = useState(false);
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    setShow(false);
    login(value);
    setValue('');
  };

  return (
    <div>
      <Button onClick={() => setShow(!show)}>
        Login
      </Button>
      <Modal
        isOpen={show}
        onRequestClose={() => {
          setShow(false);
          setValue('');
        }}
      >
        <ModalBody
            onClickCancel={() => {
              setShow(false);
              setValue('');
            }}
            header="User Login"
            isLoading={false}
            onClickConfirm={handleSubmit}
            confirmText="Submit"
          >
            <TextInput
              label=""
              id="username"
              placeholder="Enter User Name"
              value={value}
              onChange={e => setValue(e.currentTarget.value)}
            />
        </ModalBody>
      </Modal>
    </div>
  );
};

Login.displayName = 'Login';
export default Login;
