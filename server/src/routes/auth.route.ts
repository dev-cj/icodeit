import express from 'express';
import { zParse } from '../utils/zParse';
import { z } from 'zod';
import asyncWrapper from '../utils/asyncWrapper';
import { createUser, generateToken, getUserByEmail } from '../services/user.service';
import httpStatus from 'http-status';
import { exclude } from '../utils';
import { isPasswordMatch } from '../utils/encryption';
import ApiError from '../utils/ApiError';

const router = express.Router();

const signupSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Email is not valid'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password should be of minimum 6 characters long.'),
  }),
});

router.post(
  '/login',
  asyncWrapper(async (req, res) => {
    const { body } = await zParse(signupSchema, req);
    const { email, password } = body;

    const userExist = await getUserByEmail(email);

    if (!userExist) {
      const createdUser = await createUser(email.toLowerCase(), password);
      const user = exclude(createdUser, ['password', 'createdAt']);

      const token = generateToken(user.id);

      return res.status(httpStatus.CREATED).json({
        success: true,
        message: 'Signup successfull',
        data: {
          token: token,
        },
      });
    } else {
      const passwordMatch = await isPasswordMatch(password, userExist.password);
      if (!passwordMatch) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect details');
      }
      const user = exclude(userExist, ['password', 'createdAt']);

      const token = generateToken(user.id);

      return res.status(httpStatus.CREATED).json({
        success: true,
        message: 'Login successfull',
        data: {
          token: token,
        },
      });
    }
  })
);

export default router;
