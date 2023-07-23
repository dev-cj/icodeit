import { Playground } from '@prisma/client';
import prisma from '../client';

export const savePlayground = async (
  id: string,
  title: string,
  type: string,
  userId: string,
  filesKey: string
): Promise<Playground> => {
  return await prisma.playground.create({
    data: {
      id: id,
      created: true,
      filesKey: filesKey,
      title: title,
      type: type,
      creatorId: userId,
    },
  });
};

export const getPlaygroundsByUserId = async <Key extends keyof Playground>(
  userId: string,
  keys: Key[] = ['id', 'filesKey', 'type', 'creatorId', 'title', 'created', 'createdAt'] as Key[]
): Promise<Pick<Playground, Key>[]> => {
  return (await prisma.playground.findMany({
    where: { creatorId: userId },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    orderBy: {
      createdAt: 'desc',
    },
  })) as Pick<Playground, Key>[];
};

export const getPlaygroundById = async (
  id: string,
  userId: string
): Promise<Playground | undefined> => {
  return await prisma.playground.findFirst({
    where: { id: id, creatorId: userId },
  });
};
