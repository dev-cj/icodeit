import express from 'express';
import {
  ActivePlaygrounds,
  createAndStartPlayground,
  playgroundType,
  playgroundTypes,
} from '../controllers/Playgrounds';
import { v4 } from 'uuid';
import auth from '../middlewares/auth';
import asyncWrapper from '../utils/asyncWrapper';
import { z } from 'zod';
import { zParse } from '../utils/zParse';
import {
  getPlaygroundById,
  getPlaygroundsByUserId,
  savePlayground,
} from '../services/playground.service';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import logger from '../config/logger';
import { createPutSignedFileUrl, getSignedFileUrl } from '../lib/s3/s3.helpers';
import config, { isDevelopment } from '../config/config';
import { removePlayground } from '../controllers/Playgrounds/base';

const router = express.Router();

const playgroundCreateSchema = z.object({
  body: z.object({
    playgroundTitle: z
      .string({ required_error: 'Playground title is required' })
      .min(5, 'Title should be of minimum 5 characters long.'),
    type: z.string({ required_error: 'Playground type is required' }),
  }),
});

const FILES_BUCKET = config.aws.s3.AWS_CODE_FILES_BUCKET_NAME;

const getFilesKey = (name) => {
  return name + '.tar.gz';
};

const getPlaygroundWebUrl = (name, port) => {
  // url to preview playground output on browser panel
  if (isDevelopment) {
    return `http://localhost:${port}`;
  }
  // in production port of container will be mapped by name of playground
  // 1337
  return `https://${name}.icodeit.app:1337`;
};

router.post(
  '/create',
  auth(),
  asyncWrapper(async (req, res) => {
    const { body } = await zParse(playgroundCreateSchema, req);
    const { type, playgroundTitle } = body;

    if (!playgroundTypes[type as playgroundType]) {
      return res.json({
        error: true,
        message: 'Playground not available.',
      });
    }

    const activePlaygrounds = Object.keys(ActivePlaygrounds);
    if (activePlaygrounds.length > 3) {
      return res.json({
        error: true,
        message: 'Platform usage is currently high. Try again later.',
      });
    }

    const playgroundId = v4();
    const userId = req.user.id;

    const filesKey = playgroundId;
    const fileName = getFilesKey(filesKey);
    const filesPutUrl = await createPutSignedFileUrl(fileName, FILES_BUCKET);

    await savePlayground(playgroundId, playgroundTitle, type, userId, filesKey);

    const { error, message } = await createAndStartPlayground(
      type as playgroundType,
      playgroundId,
      '',
      filesPutUrl
    );
    if (error) {
      return res.json({
        error: true,
        message,
      });
    }

    const playground = ActivePlaygrounds[playgroundId];
    playground.createAccessToken(userId);
    if (!playground.isRunning) {
      return res.json({
        success: false,
        error: true,
        message: 'Playground not running. Try again later.',
      });
    }

    return res.json({
      success: true,
      error: false,
      data: {
        playgroundId,
      },
    });
  })
);

const playgroundStopSchema = z.object({
  body: z.object({
    id: z.string({ required_error: 'Playground id is required' }),
  }),
});

router.post(
  '/stop',
  auth(),
  asyncWrapper(async (req, res) => {
    const { body } = await zParse(playgroundStopSchema, req);
    const { id } = body;

    const playground = ActivePlaygrounds[id];
    if (!playground) {
      return res.json({
        success: false,
        error: true,
        message: "Playground doesn't exist",
      });
    }

    if (!playground.canUserAccess(req.user.id)) {
      return res.json({
        success: false,
        error: true,
        message: 'Unauthorised access.',
      });
    }
    try {
      const { success } = await playground.stopPlayground();
      if (success) {
        removePlayground(id);
        logger.info('Playground stopped and removed');
      }
    } catch (error) {
      logger.error(error);
    }

    return res.json({
      success: true,
      error: false,
      message: 'Playground stopped',
    });
  })
);

router.post(
  '/start',
  auth(),
  asyncWrapper(async (req, res) => {
    const id = req.body.id;

    if (!id) {
      return res.json({
        success: true,
        error: false,
        message: 'Playground id is required.',
      });
    }
    const activePlayground = ActivePlaygrounds[id];
    const userHasAccess = activePlayground && activePlayground.canUserAccess(req.user.id);
    if (userHasAccess) {
      // if playground is already running return id
      return res.json({
        success: true,
        error: false,
        data: {
          playgroundId: id,
        },
      });
    }

    const activePlaygrounds = Object.keys(ActivePlaygrounds);

    if (activePlaygrounds.length > 3) {
      return res.json({
        error: true,
        message: 'Platform usage is currently high. Try again later.',
      });
    }

    const playgroundData = await getPlaygroundById(id, req.user.id);
    if (!playgroundData || !playgroundData.id) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Playground not available.');
    }
    const fileName = getFilesKey(playgroundData.filesKey);
    const getUrl = await getSignedFileUrl(fileName, FILES_BUCKET);
    const filesPutUrl = await createPutSignedFileUrl(fileName, FILES_BUCKET);

    const { error, message } = await createAndStartPlayground(
      playgroundData.type as playgroundType,
      playgroundData.id,
      getUrl,
      filesPutUrl
    );
    if (error) {
      return res.json({
        error: true,
        message,
      });
    }

    const playground = ActivePlaygrounds[playgroundData.id];
    playground.createAccessToken(req.user.id);
    if (!playground.isRunning) {
      return res.json({
        success: false,
        error: true,
        message: 'Playground not running. Try again later.',
      });
    }

    return res.json({
      success: true,
      error: false,
      data: {
        playgroundId: playgroundData.id,
      },
    });
  })
);

router.get(
  '/playgrounds',
  auth(),
  asyncWrapper(async (req, res) => {
    const userId = req.user.id;

    const playgrounds = await getPlaygroundsByUserId(userId, ['id', 'title', 'createdAt']);

    return res.json({
      success: true,
      data: {
        playgrounds: playgrounds,
      },
    });
  })
);

router.get(
  '/:playgroundId',
  auth(),
  asyncWrapper(async (req, res) => {
    const playgroundId = req.params.playgroundId;
    if (!playgroundId) {
      return res.json({
        success: false,
        error: true,
        message: 'Playground is required',
      });
    }
    const userId = req.user.id;

    const playground = ActivePlaygrounds[playgroundId];
    if (!playground) {
      return res.json({
        success: false,
        error: true,
        message: "Playground doesn't exist",
      });
    }

    if (!playground.canUserAccess(userId)) {
      return res.json({
        success: false,
        error: true,
        message: 'Unauthorised access.',
      });
    }

    if (!playground.isRunning) {
      return res.json({
        success: false,
        error: true,
        message: 'Playground not running',
      });
    }
    const accessToken = playground.createAccessToken(userId);
    const activePorts = playground.activePorts;
    const webUrl = getPlaygroundWebUrl(playground.playgroundName, activePorts.webPort);
    return res.json({
      success: true,
      data: {
        accessToken: accessToken,
        webUrl: webUrl,
        playgroundName: playground.playgroundName,
      },
    });
  })
);

export default router;
