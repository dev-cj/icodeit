import { ViteReact } from './ViteReact';

export const playgroundTypes = {
  viteReact: 'viteReact' as const,
};
export type playgroundType = keyof typeof playgroundTypes;

const playgroundMap = {
  [playgroundTypes.viteReact]: ViteReact,
};

interface ActivePlaygrounds {
  [id: string]: ViteReact;
}

export const ActivePlaygrounds: ActivePlaygrounds = {};

export const createAndStartPlayground = async (
  type: playgroundType,
  playgroundId: string,
  filesGetUrl: string,
  filesPutUrl: string
) => {
  const playgroundClass = playgroundMap[type];
  const playground = new playgroundClass(playgroundId, filesGetUrl, filesPutUrl);

  if (type === 'viteReact') {
    const { success } = await (playground as ViteReact).startPlayground();
    if (success) {
      ActivePlaygrounds[playgroundId] = playground;
      return { success: true, message: 'Playground started' };
    } else {
      return { error: true, message: 'Error creating playground' };
    }
  }
  return { error: true, message: 'Playground not found' };
};
