import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MarqueeHeader from '../real-time/MarqueeHeader';

export default function Layout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <MarqueeHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
