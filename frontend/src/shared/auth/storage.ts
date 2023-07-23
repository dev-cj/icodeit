import { NextPageContext } from 'next';

import { BACKEND_ENV_KEY } from './../config/index';
import { clearCookieByKey, getCookieByKey, setCookieByKey } from './cookie';

export type ctx = NextPageContext | null;

const keyPrefix = (ctx: ctx) => {
  let prefix;
  const backendEnv = getCookieByKey(BACKEND_ENV_KEY, ctx);
  if (backendEnv) {
    prefix = backendEnv;
  }
  return prefix ? prefix.toUpperCase() + '_' : '';
};

const getAuthTokenKey = (ctx: ctx = null) => keyPrefix(ctx) + 'AUTH_TOKEN';

export const setAuthToken = (token: string) =>
  setCookieByKey(getAuthTokenKey(), token);
export const hasAuthToken = (ctx: ctx = null) =>
  getCookieByKey(getAuthTokenKey(ctx), ctx);
export const clearAuthToken = () => clearCookieByKey(getAuthTokenKey());
export const getAuthToken = (ctx: ctx) =>
  getCookieByKey(getAuthTokenKey(ctx), ctx);

export const loginLocal = (authToken: string) => {
  setAuthToken(authToken);
};

export const logoutLocal = () => {
  clearAuthToken();
  setTimeout(() => {
    window.location.replace('/');
  }, 1000);
};
