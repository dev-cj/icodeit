import httpStatus from 'http-status';
import { getUserById, verifyToken } from '../services/user.service';
import ApiError from '../utils/ApiError';
import { NextFunction, Request } from 'express';
import asyncWrapper from '../utils/asyncWrapper';
import { User } from '@prisma/client';

const auth = <Key extends keyof User>(keys: Key[] = []) =>
  asyncWrapper(async (req: Request, _: any, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Sign in to continue.');
    }

    const payload = verifyToken(token);
    if (!payload) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Sign in again.');
    }

    const user = await getUserById(payload.userId, [...keys, 'id']);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Account not found.');
    }
    req.user = user;
    next();
  });

export default auth;
