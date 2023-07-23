import cookies from 'nookies';
import { ctx } from './storage';

const IS_BROWSER = typeof window !== 'undefined';
const DEFAULT_DTL = 30;
const LETSCODE_USER_KEY = 'LETSCODE_USER';

const getExpiry = (daysToLive: number) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + daysToLive);
  return expiryDate;
};

export const cookieDomain = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost') {
    return hostname;
  } else if (hostname === 'www.letscode.xyz') {
    return `.letscode.xyz`;
  } else {
    return `.${hostname}`;
  }
};

export const getCookieByKey = (key: string, ctx: ctx = null) => {
  return cookies.get(ctx)[key];
};

export const setCookieByKey = (
  key: string,
  value: string,
  daysToLive = DEFAULT_DTL
) => {
  if (!IS_BROWSER) return;

  cookies.set(null, key, value, {
    path: '/',
    expires: getExpiry(daysToLive),
  });
};

export const setCookieByDomain = (
  key: string,
  value: string,
  daysToLive = DEFAULT_DTL
) => {
  if (!IS_BROWSER) return;

  cookies.set(null, key, value, {
    path: '/',
    expires: getExpiry(daysToLive),
    domain: cookieDomain(),
  });
};

export const clearCookieByKey = (key: string, options = { path: '/' }) => {
  if (!IS_BROWSER) return;
  const { path } = options;

  cookies.destroy(null, key, {
    path: path,
    expires: getExpiry(-1),
    domain: cookieDomain(),
  });

  cookies.destroy(null, key, {
    path: path,
    expires: getExpiry(-1),
  });
};

export const clearCookieByDomain = (key: string) => {
  if (!IS_BROWSER) return;

  cookies.destroy(null, key, {
    path: '/',
    expires: getExpiry(-1),
    domain: cookieDomain(),
  });
};

export const clearUserCookie = () => {
  clearCookieByKey(LETSCODE_USER_KEY);
};
