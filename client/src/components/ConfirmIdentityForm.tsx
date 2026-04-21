import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button.tsx';
import { TextInput } from './ui/TextInput.tsx';
import useUsers from '../services/users.tsx';
import { UserType } from './types.ts';
import { updateUserInfo } from '../services/api.tsx';

const PLAID_ENV = import.meta.env.VITE_PLAID_ENV;

interface Props {
  userId: number;
  setUser: (user: UserType) => void;
}
const ConfirmIdentityForm: React.FC<Props> = (props: Props) => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');

  const { getUsers } = useUsers();
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { data: users } = await updateUserInfo(props.userId, fullname, email);
    props.setUser(users[0]);
    setFullname('');
    setEmail('');
  };

  const environment = PLAID_ENV === 'sandbox' ? 'sandbox' : 'production';

  const messages = {
    sandbox: {
      message: 'Re-enter sandbox name and email address in the input fields.',
      namePlaceholder: "sandbox: 'Alberta Charleson'",
      emailPlaceholder: "sandbox: 'accountholder0@example.com'",
    },
    production: {
      message:
        'Re-enter your full name and email as they are listed at your financial institution.',
      namePlaceholder: 'full name used at financial institution',
      emailPlaceholder: 'email used at financial institution',
    },
  };

  useEffect(() => {
    getUsers(true);
  }, [getUsers]);

  return (
    <div className="box">
      <form onSubmit={handleSubmit}>
        <div className="flex p-5 items-center justify-start">
          <div className="w-1/4 pr-6">
            <h3 className="heading m-4">Confirm your identity</h3>
            <p className="text-ellipsis overflow-x-hidden text-sm">
              {messages[environment].message}
            </p>
          </div>
          <div className="w-2/5 flex flex-col p-4">
            <TextInput
              id="fullname"
              name="fullname"
              required
              autoComplete="off"
              className="mb-4"
              value={fullname}
              placeholder={messages[environment].namePlaceholder}
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
              placeholder={messages[environment].emailPlaceholder}
              label="Email"
              onChange={e => setEmail(e.currentTarget.value)}
            />
          </div>
          <div className="flex flex-row justify-center w-[35%]">
            <Button
              className="mx-4 min-w-20"
              small
              type="submit"
            >
              Confirm Identity
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

ConfirmIdentityForm.displayName = 'ConfirmIdentityForm';
export default ConfirmIdentityForm;
