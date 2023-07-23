import { post, get } from '@/shared/network';

interface Result {
  success?: boolean;
  data?: {
    [x: string]: any;
  };
  error?: boolean;
  message?: string;
}

export const login = async (email: string, password: string) => {
  return await post<Result>(`/auth/login`, {
    email,
    password,
  })
    .then(({ success, data, error, message }) => {
      if (success) {
        return { data, success } as Result;
      } else return { error: true, success: false, message } as Result;
    })
    .catch(() => {
      return { error: true, success: false } as Result;
    });
};

export const userProfile = async () => {
  return await get<Result>(`/user/profile`)
    .then(({ success, data, error, message }) => {
      if (success) {
        return { data, success } as Result;
      } else return { error: true, success: false, message } as Result;
    })
    .catch(() => {
      return { error: true, success: false } as Result;
    });
};
