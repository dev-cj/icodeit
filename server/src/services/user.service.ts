import jwt from 'jsonwebtoken';
import { Role, User } from '@prisma/client';
import prisma from '../client';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { v4 } from 'uuid';
import { encryptPassword } from '../utils/encryption';
import config from '../config/config';

const createUser = async (
  email: string,
  password: string,
  role: Role = Role.USER
): Promise<User> => {
  if (await getUserByEmail(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const id = v4();
  return prisma.user.create({
    data: {
      email,
      role,
      password: await encryptPassword(password),
      id: id,
    },
  });
};

const getUserByEmail = async <Key extends keyof User>(
  email: string,
  keys: Key[] = ['id', 'email', 'password', 'role', 'createdAt'] as Key[]
): Promise<Pick<User, Key> | null> => {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {} as any),
  }) as Promise<Pick<User, Key> | null>;
};

const getUserById = async <Key extends keyof User>(
  id: string,
  keys: Key[] = ['id', 'email', 'password', 'role', 'createdAt'] as Key[]
): Promise<Pick<User, Key> | null> => {
  return prisma.user.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {} as any),
  }) as Promise<Pick<User, Key> | null>;
};

type tokenPayload = {
  userId: string;
};

const generateToken = (userId: string): string => {
  const payload = {
    userId,
  };
  return jwt.sign(payload, config.jwt.secret, { expiresIn: '2d' });
};

const verifyToken = (token: string): tokenPayload | false => {
  try {
    const verified: any = jwt.verify(token, config.jwt.secret);
    return verified;
  } catch (error) {
    return false;
  }
};

export { createUser, getUserByEmail, generateToken, verifyToken, getUserById };
