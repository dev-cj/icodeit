import express from 'express';
import auth from '../middlewares/auth';
import asyncWrapper from '../utils/asyncWrapper';
import { getUserById } from '../services/user.service';

const router = express.Router();

router.get(
  '/profile',
  auth(),
  asyncWrapper(async (req, res) => {
    const userId = req.user.id;

    const user = await getUserById(userId);
    res.json({
      success: true,
      data: {
        user: {
          email: user.email,
        },
      },
    });
  })
);

export default router;
