import React, { useState, useEffect } from 'react';

import { HashLink } from 'react-router-hash-link';
import { Button } from './ui/Button.tsx';
import { useUsers } from '../services/index.js';
import { UserType } from './types.ts';
// This provides developers with a list of all users by username, and ability to delete a user.
// View at path: "/admin"
const UserList: React.FC = () => {
  const { allUsers, getUsers, usersById, deleteUserById } = useUsers();
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    getUsers(true);
  }, [getUsers]);

  useEffect(() => {
    setUsers(allUsers);
  }, [allUsers, usersById]);

  return (
    <>
      <h5>For developer admin use</h5>

      <div>
        {users.map(user => (
          <div key={user.id}>
            <div className="user-list">
              <HashLink
                className="user-list__touchable no-underline text-inherit"
                to={`/user/${user.id}`}
              >
                <div className="user-list__name">{user.username}</div>
              </HashLink>
              <div>
                <Button
                  small
                  onClick={() => deleteUserById(user.id)}
                >
                  delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

UserList.displayName = 'UserList';
export default UserList;
