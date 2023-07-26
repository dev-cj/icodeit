export const BACKEND_ENV_KEY = 'BACKEND_ENV';

export const BackendEnvs = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
};
export const defaultBackendEnv = () => process.env.NODE_ENV;

export const isDevelopment = defaultBackendEnv() === 'development';

export const DEV_BACKEND_URL = 'http://localhost:8000';

export const PROD_BACKEND_URL = 'https://backend.icodeit.xyz';

export const getApiUrl = () => {
  const environment = defaultBackendEnv();
  let apiHost = '';
  if (environment === BackendEnvs.DEVELOPMENT) {
    apiHost = DEV_BACKEND_URL;
  } else if (environment === BackendEnvs.PRODUCTION) {
    apiHost = PROD_BACKEND_URL;
  }
  return `${apiHost}/v1/api`;
};
