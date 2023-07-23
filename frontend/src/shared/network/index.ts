import { NextPageContext } from 'next';
import { getApiUrl } from '../config';
import { getAuthToken } from '../auth/storage';

type PostOptions = {
  ctx?: NextPageContext | null;
  headers?: {
    [x: string]: any;
  } | null;
  useApi?: boolean;
};

type ResponseJson = {
  success?: boolean;
  data?: {
    [x: string]: any;
  };
  error?: boolean;
  message?: string;
};

export const post = <T>(api: string, body = {}, options: PostOptions = {}) => {
  const { ctx = null, headers = null, useApi = false } = options;
  const backendApi = getApiUrl();

  return new Promise<T>((resolve, reject) => {
    let myHeaders = new Headers();
    const token = getAuthToken(ctx);
    if (token) myHeaders.append('authorization', `Bearer ${token}`);
    myHeaders.append('Content-Type', 'application/json');
    if (headers) {
      for (let arr of Object.entries(headers)) {
        myHeaders.append(arr[0], arr[1]);
      }
    }
    let raw = JSON.stringify({ ...body });
    let requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    };
    const fetchApi = useApi ? api : backendApi + api;

    try {
      fetch(fetchApi, requestOptions)
        .then((response) => {
          const r = response.json();
          resolve(r as T);
        })
        .catch((error) => reject(error));
    } catch (error) {
      reject(error);
    }
  });
};

type GetOptions = {
  ctx?: NextPageContext | null;
  useApi?: boolean;
};

export const get = <T>(api: string, options: GetOptions = {}) => {
  const { ctx = null, useApi = false } = options;
  const backendApi = getApiUrl();

  const fn = new Promise<T>((resolve, reject) => {
    let myHeaders = new Headers();
    const token = getAuthToken(ctx);
    if (token) myHeaders.append('authorization', `Bearer ${token}`);
    myHeaders.append('Content-Type', 'application/json');

    let requestOptions = {
      method: 'GET',
      headers: myHeaders,
    };
    const fetchApi = useApi ? api : backendApi + api;
    try {
      fetch(fetchApi, requestOptions)
        .then((response) => {
          const r = response.json();
          return resolve(r as T);
        })
        .catch((error) => reject(error));
    } catch (error) {
      reject(error);
    }
  });

  return fn;
};
