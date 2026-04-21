import React, { useEffect } from 'react';
import { Button } from './ui/Button.tsx';
import { useHistory } from 'react-router-dom';

import { useCurrentUser } from '../services/index.js';
import Login from './Login.tsx';
import Banner from './Banner.tsx';
import AddUserForm from './AddUserForm.tsx';
import { useBoolean } from '../hooks/index.ts';

const Landing: React.FC = () => {
  const { userState, setCurrentUser } = useCurrentUser();
  const [isAdding, hideForm, toggleForm] = useBoolean(false);
  const history = useHistory();

  useEffect(() => {
    if (userState.newUser != null) {
      setCurrentUser(userState.newUser);
    }
  }, [setCurrentUser, userState.newUser]);

  const returnToCurrentUser = () => {
    history.push(`/user/${userState.currentUser.id}`);
  };
  return (
    <div>
      <Banner initialSubheading />
      {!isAdding && (
        <>
          <div>
            {' '}
            If you don't have an account, please click "Create Account".
          </div>

          <div className="flex my-4">
            <Login />
            <Button
              className="ml-4"
              onClick={toggleForm}
            >
              Create Account
            </Button>
            {userState.currentUser.username != null && (
              <Button
                className="ml-4"
                onClick={returnToCurrentUser}
              >
                Return to Current User
              </Button>
            )}
          </div>
        </>
      )}
      {isAdding && <AddUserForm hideForm={hideForm} />}
    </div>
  );
};

Landing.displayName = 'Landing';
export default Landing;
