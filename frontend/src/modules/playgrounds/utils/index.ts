import { get, post } from '@/shared/network';
import { TbBrandNextjs as NextJs } from 'react-icons/tb';
import { AiFillHtml5 as Html } from 'react-icons/ai';
import {
  FaReact as React,
  FaVuejs as Vue3,
  FaPython as Python,
  FaJava as Java,
} from 'react-icons/fa';
import { SiSolidity as Solidity } from 'react-icons/si';

const Icons = { NextJs, Html, React, Vue3, Python, Java, Solidity };

export { Icons };

interface Result {
  success?: boolean;
  data?: {
    [x: string]: any;
  };
  error?: boolean;
  message?: string;
}
export const createPlayground = async (
  type: string,
  playgroundTitle: string
) => {
  return await post<Result>(`/playground/create`, {
    type,
    playgroundTitle,
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

export const getPlayground = async (playgroundId: string) => {
  return get<Result>(`/playground/${playgroundId}`)
    .then(({ success, data, error, message }) => {
      if (success) {
        return { data, success };
      } else return { error: true, success: false, message } as Result;
    })
    .catch(() => {
      return { error: true, success: false } as Result;
    });
};

export const stopPlayground = async (playgroundId: string) => {
  return await post<Result>(`/playground/stop`, {
    id: playgroundId,
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

export const getPlaygrounds = async () => {
  return get<Result>(`/playground/playgrounds`)
    .then(({ success, data, error, message }) => {
      if (success) {
        return { data, success };
      } else return { error: true, success: false, message } as Result;
    })
    .catch(() => {
      return { error: true, success: false } as Result;
    });
};

export const startPlayground = async (id: string) => {
  return await post<Result>(`/playground/start`, {
    id: id,
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
