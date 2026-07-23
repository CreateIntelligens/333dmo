import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MarqueeHeader from '../real-time/MarqueeHeader';

export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-primary">
      <MarqueeHeader />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
