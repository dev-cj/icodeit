'use client';
import PlaygroundPage from '@/modules/playground/pages/PlaygroundPage';

type Props = {
  params: { id: string };
};

const Playground = (props: Props) => {
  const playgroundId = props.params.id;
  return <PlaygroundPage playgroundId={playgroundId} />;
};

export default Playground;
