import { Routes, Route } from 'react-router-dom';
import Layout from './components/layouts/Layout';
import Dashboard from './pages/Dashboard';
import ActivityLog from './pages/ActivityLog';
import FeatureUsage from './pages/FeatureUsage';
import UserActivity from './pages/UserActivity';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="activity" element={<ActivityLog />} />
        <Route path="features" element={<FeatureUsage />} />
        <Route path="users" element={<UserActivity />} />
      </Route>
    </Routes>
  );
}
