import { useEffect, useState } from 'react';
import apiClient from '../../api/client';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('ASC');

  const [newUser, setNewUser] = useState({
    fullName: '', email: '', address: '', password: '', role: 'user',
  });
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    const params = { ...filters, sortBy, order };
    const res = await apiClient.get('/users', { params });
    setUsers(res.data);
  };

  useEffect(() => { fetchUsers(); }, [sortBy, order]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const toggleSort = (column) => {
    if (sortBy === column) setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(column); setOrder('ASC'); }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/users', newUser);
      setNewUser({ fullName: '', email: '', address: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to add user');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Users</h2>

      <form onSubmit={handleFilterSubmit} style={{ marginBottom: 20 }}>
        <input placeholder="Filter by name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <input placeholder="Filter by email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        <input placeholder="Filter by address" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="store_owner">Store Owner</option>
        </select>
        <button type="submit">Filter</button>
      </form>

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th onClick={() => toggleSort('fullName')} style={{ cursor: 'pointer' }}>Name {sortBy === 'fullName' && (order === 'ASC' ? '↑' : '↓')}</th>
            <th onClick={() => toggleSort('email')} style={{ cursor: 'pointer' }}>Email {sortBy === 'email' && (order === 'ASC' ? '↑' : '↓')}</th>
            <th onClick={() => toggleSort('address')} style={{ cursor: 'pointer' }}>Address {sortBy === 'address' && (order === 'ASC' ? '↑' : '↓')}</th>
            <th onClick={() => toggleSort('role')} style={{ cursor: 'pointer' }}>Role {sortBy === 'role' && (order === 'ASC' ? '↑' : '↓')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.address}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: 30 }}>Add New User</h3>
      <form onSubmit={handleAddUser}>
        <input placeholder="Full name (20-60 chars)" value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} required /><br />
        <input placeholder="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required /><br />
        <input placeholder="Address" value={newUser.address} onChange={(e) => setNewUser({ ...newUser, address: e.target.value })} required /><br />
        <input placeholder="Password" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required /><br />
        <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
          <option value="user">Normal User</option>
          <option value="admin">Admin</option>
          <option value="store_owner">Store Owner</option>
        </select><br />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Add User</button>
      </form>
    </div>
  );
}
