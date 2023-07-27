import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const EnvVars = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_CODE_FILES_BUCKET_NAME: process.env.AWS_CODE_FILES_BUCKET_NAME,
};
export default {
  env: EnvVars.NODE_ENV,
  port: EnvVars.PORT,
  jwt: {
    secret: EnvVars.JWT_SECRET,
  },
  aws: {
    s3: {
      AWS_ACCESS_KEY_ID: EnvVars.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: EnvVars.AWS_SECRET_ACCESS_KEY,
      AWS_CODE_FILES_BUCKET_NAME: EnvVars.AWS_CODE_FILES_BUCKET_NAME,
    },
  },
};

export const isDevelopment = EnvVars.NODE_ENV === 'development';
export const isProduction = !isDevelopment;

export const backendHost = isDevelopment
  ? `http://localhost:${EnvVars.PORT}`
  : `https://backend.icodeit.xyz`;
