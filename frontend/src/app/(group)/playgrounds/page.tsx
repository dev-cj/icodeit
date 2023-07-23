import Sidebar from '@/components/MainNavSidebar';
import TopNav from '@/components/TopNav';
import PlaygroundsPage from '@/modules/playgrounds/pages/PlaygroundsPage';

const Playgrounds = () => {
  return (
    <div className='flex flex-1'>
      <Sidebar />
      <div className='flex w-full flex-col flex-1'>
        <TopNav />
        <PlaygroundsPage />
      </div>
    </div>
  );
};

export default Playgrounds;
