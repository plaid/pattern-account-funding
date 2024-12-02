import React, { useEffect } from 'react';
import Button from 'plaid-threads/Button';
import { useHistory } from 'react-router-dom';

import useCurrentUser from '../services/currentUser.tsx';
import Login from './Login.tsx';
import Banner from './Banner.tsx';
import AddUserForm from './AddUserForm.tsx';

import useBoolean from '../hooks/useBoolean.ts';

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

          <div className="btns-container">
            <Login />
            <Button
              className="btn-with-margin"
              onClick={toggleForm}
              centered
              inline
            >
              Create Account
            </Button>
            {userState.currentUser.username != null && (
              <Button
                className="btn-with-margin"
                centered
                inline
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
