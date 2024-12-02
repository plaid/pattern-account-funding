import axios from 'axios';
import React from 'react';
import { toast } from 'react-toastify';
import { PlaidLinkOnSuccessMetadata } from 'react-plaid-link';

const baseURL = '/';

const api = axios.create({
  baseURL,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: 0,
  },
});

export default api;
// currentUser
export const getLoginUser = (username: string) =>
  api.post('/sessions', { username });

// users
export const getUsers = () => api.get('/users');
export const getUserById = (userId: number) => api.get(`/users/${userId}`);
export const addNewUser = (
  username: string,
  fullname: string,
  email: string,
  shouldVerifyIdentity: boolean
) => api.post('/users', { username, fullname, email, shouldVerifyIdentity });
export const updateIdentityCheckById = (
  userId: number,
  identityCheck: boolean
) => api.put(`/users/${userId}/identity_check`, { identityCheck });
export const updateUserInfo = (
  userId: number,
  fullname: string,
  email: string
) => api.put(`/users/${userId}/confirmation`, { fullname, email });
export const deleteUserById = (userId: number) =>
  api.delete(`/users/${userId}`);

// app Funds
export const getAppFundsByUser = (userId: number) =>
  api.get(`/appFunds/${userId}`);
export const updateAppFundsBalance = (
  userId: number,
  transferAmount: number,
  accountId: string
) =>
  api.put(`/appFunds/${userId}/bank_transfer`, { transferAmount, accountId });

// items
export const getItemById = (id: number) => api.get(`/items/${id}`);
export const getItemsByUser = (userId: number) =>
  api.get(`/users/${userId}/items`);
export const deleteItemById = (id: number) => api.delete(`/items/${id}`);
export const setItemState = (itemId: number, status: string) =>
  api.put(`items/${itemId}`, { status });
// This endpoint is only availble in the sandbox enviornment
export const setItemToBadState: (itemId: number) => Promise<any> = (itemId) =>
  api.post('/items/sandbox/item/reset_login', { itemId });

export const getLinkToken = (
  userId: number,
  itemId: number,
  isIdentity: boolean
) =>
  api.post(`/link-token`, {
    userId,
    itemId,
    isIdentity,
  });
export const makeTransfer = (
  fundingSourceUrl: string,
  amount: number,
  itemId: number
) => api.post(`/items/makeTransfer`, { fundingSourceUrl, amount, itemId });

// accounts
export const getBalanceByItem = (itemId: number, accountId: string) =>
  api.put(`/items/${itemId}/balance`, { accountId });
export const getAccountsByItem = (itemId: number) =>
  api.get(`/items/${itemId}/accounts`);
export const getAccountsByUser = (userId: number) =>
  api.get(`/users/${userId}/accounts`);

// institutions
export const getInstitutionById = (instId: string) =>
  api.get(`/institutions/${instId}`);

// misc
export const postLinkEvent = (event: any) => api.post(`/link-event`, event);

export const exchangeToken = async (
  publicToken: string,
  institution: any,
  accounts: PlaidLinkOnSuccessMetadata['accounts'],
  userId: number,
  isProcessor: boolean,
  isIdentity: boolean
) => {
  try {
    const { data } = await api.post('/items', {
      publicToken,
      institutionId: institution.institution_id,
      userId,
      accounts,
      isProcessor,
      isIdentity,
    });
    return data;
  } catch (err) {
    toast.error(`Error linking ${institution.name}`);
  }
};
