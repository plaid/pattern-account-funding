import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button.tsx';
import { TextInput } from './ui/TextInput.tsx';
import { Checkbox } from './ui/Checkbox.tsx';

import { useUsers, useCurrentUser } from '../services/index.js';

const PLAID_ENV = import.meta.env.VITE_PLAID_ENV;

interface Props {
  hideForm: () => void;
}
const AddUserForm: React.FC<Props> = (props: Props) => {
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [shouldVerifyIdentity, setShouldVerifyIdentity] = useState(false);

  const environment = PLAID_ENV === 'sandbox' ? 'sandbox' : 'production';

  // Prefill sandbox values when Verify Identity Mode is enabled
  useEffect(() => {
    if (shouldVerifyIdentity && environment === 'sandbox') {
      setFullname('Alberta Charleson');
      setEmail('accountholder0@example.com');
    } else if (!shouldVerifyIdentity) {
      setFullname('');
      setEmail('');
    }
  }, [shouldVerifyIdentity, environment]);

  const { addNewUser, getUsers } = useUsers();
  const { setNewUser } = useCurrentUser();
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await addNewUser(username, fullname, email, shouldVerifyIdentity);
    setNewUser(username);
    props.hideForm();
  };

  useEffect(() => {
    getUsers(true);
  }, [addNewUser, getUsers]);

  return (
    <div className="box mt-6">
      <form onSubmit={handleSubmit}>
        <div>
          <h3 className="heading m-4">Create an account</h3>
          <div className="flex p-5 items-center justify-start">
            <div className="w-1/4 pr-6">
              <Checkbox
                value={shouldVerifyIdentity}
                id="identityCheckBox"
                onChange={() => setShouldVerifyIdentity(!shouldVerifyIdentity)}
              >
                {' '}
                Verify Bank Account Identity Data{' '}
              </Checkbox>
            </div>
            <div className="w-2/5 flex flex-col p-4">
              <TextInput
                id="username"
                name="username"
                required
                autoComplete="off"
                className="mb-4"
                value={username}
                placeholder="username"
                label="Username"
                onChange={e => setUsername(e.currentTarget.value)}
              />
              {shouldVerifyIdentity && (
                <>
                  <TextInput
                    id="full_name"
                    name="full_name"
                    required
                    autoComplete="off"
                    className="mb-4"
                    value={fullname}
                    placeholder="First and last name"
                    label="Full Name"
                    onChange={e => setFullname(e.currentTarget.value)}
                  />
                  <TextInput
                    id="email"
                    name="email"
                    required
                    autoComplete="off"
                    className="mb-4"
                    value={email}
                    placeholder="email@example.com"
                    label="Email"
                    onChange={e => setEmail(e.currentTarget.value)}
                  />
                </>
              )}
            </div>
            <div className="flex flex-row justify-center w-[35%]">
              <Button className="mx-4 min-w-20" small type="submit">
                Add User
              </Button>
              <Button
                className="mx-4 min-w-20"
                small
                secondary
                onClick={props.hideForm}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

AddUserForm.displayName = 'AddUserForm';
export default AddUserForm;
