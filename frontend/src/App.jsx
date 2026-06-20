import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import ChangePassword from './pages/ChangePassword';
import AdminDashboard from './pages/admin/Dashboard';
import UsersList from './pages/admin/UsersList';
import StoresList from './pages/admin/StoresList';
import StoreDirectory from './pages/user/StoreDirectory';
import OwnerDashboard from './pages/owner/OwnerDashboard';

function Nav() {
  const { token, role, logout } = useAuth();
  if (!token) return null;
  return (
    <nav style={{ padding: 10, borderBottom: '1px solid #ccc' }}>
      {role === 'admin' && (
        <>
          <Link to="/admin">Dashboard</Link> | <Link to="/admin/users">Users</Link> | <Link to="/admin/stores">Stores</Link> |{' '}
        </>
      )}
      {role === 'user' && <Link to="/stores">Stores</Link>}
      {role === 'store_owner' && <Link to="/owner">My Store</Link>}
      {' | '}<Link to="/password">Change Password</Link>
      {' | '}<button onClick={logout}>Logout</button>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Nav />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersList /></ProtectedRoute>} />
          <Route path="/admin/stores" element={<ProtectedRoute allowedRoles={['admin']}><StoresList /></ProtectedRoute>} />

          <Route path="/stores" element={<ProtectedRoute allowedRoles={['user']}><StoreDirectory /></ProtectedRoute>} />

          <Route path="/owner" element={<ProtectedRoute allowedRoles={['store_owner']}><OwnerDashboard /></ProtectedRoute>} />

          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
