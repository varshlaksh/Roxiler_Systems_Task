import { useEffect, useState } from 'react';
import apiClient from '../../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiClient.get('/admin/stats').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>
      <ul>
        <li>Total Users: {stats.totalUsers}</li>
        <li>Total Stores: {stats.totalStores}</li>
        <li>Total Ratings: {stats.totalRatings}</li>
      </ul>
      <p>
        <a href="/admin/users">Manage Users</a> | <a href="/admin/stores">Manage Stores</a>
      </p>
    </div>
  );
}
