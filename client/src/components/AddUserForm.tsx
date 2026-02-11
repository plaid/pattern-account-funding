import React, { useState, useEffect } from 'react';
import Button from 'plaid-threads/Button';
import TextInput from 'plaid-threads/TextInput';
import Checkbox from 'plaid-threads/Checkbox';

import { useUsers, useCurrentUser } from '../services/index.js';

const PLAID_ENV = process.env.REACT_APP_PLAID_ENV;

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
    <div className="box add-user__form">
      <form onSubmit={handleSubmit}>
        <div>
          <h3 className="heading add-user__heading">Create an account</h3>
          <div className="card">
            <div className="add-user__column-1">
              <Checkbox
                value={shouldVerifyIdentity}
                id="identityCheckBox"
                onChange={() => setShouldVerifyIdentity(!shouldVerifyIdentity)}
              >
                {' '}
                Verify Identity Mode{' '}
              </Checkbox>
            </div>
            <div className="add-user__column-2">
              <TextInput
                id="username"
                name="username"
                required
                autoComplete="off"
                className="input_field"
                value={username}
                label="Username"
                onChange={e => setUsername(e.target.value)}
              />
              {shouldVerifyIdentity && (
                <>
                  <TextInput
                    id="full_name"
                    name="full_name"
                    required
                    autoComplete="off"
                    className="input_field"
                    value={fullname}
                    label="Full Name"
                    onChange={e => setFullname(e.target.value)}
                  />
                  <TextInput
                    id="email"
                    name="email"
                    required
                    autoComplete="off"
                    className="input_field"
                    value={email}
                    label="Email"
                    onChange={e => setEmail(e.target.value)}
                  />
                </>
              )}
            </div>
            <div className="add-user__column-3">
              <Button className="add-user__button" centered small type="submit">
                Add User
              </Button>
              <Button
                className="add-user__button"
                centered
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
