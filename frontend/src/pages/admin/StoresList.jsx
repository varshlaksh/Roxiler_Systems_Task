import { useEffect, useState } from 'react';
import apiClient from '../../api/client';

export default function StoresList() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('ASC');

  const [storeOwners, setStoreOwners] = useState([]);
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [error, setError] = useState('');

  const fetchStores = async () => {
    const params = { ...filters, sortBy, order };
    const res = await apiClient.get('/stores', { params });
    setStores(res.data);
  };

  const fetchStoreOwners = async () => {
    const res = await apiClient.get('/users/store-owners/list');
    setStoreOwners(res.data);
  };

  useEffect(() => { fetchStores(); fetchStoreOwners(); }, [sortBy, order]);

  const toggleSort = (column) => {
    if (sortBy === column) setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(column); setOrder('ASC'); }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...newStore };
      if (!payload.ownerId) delete payload.ownerId;
      await apiClient.post('/stores', payload);
      setNewStore({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to add store');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Stores</h2>

      <form onSubmit={(e) => { e.preventDefault(); fetchStores(); }} style={{ marginBottom: 20 }}>
        <input placeholder="Filter by name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <input placeholder="Filter by address" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
        <button type="submit">Filter</button>
      </form>

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>Name {sortBy === 'name' && (order === 'ASC' ? '↑' : '↓')}</th>
            <th onClick={() => toggleSort('email')} style={{ cursor: 'pointer' }}>Email</th>
            <th onClick={() => toggleSort('address')} style={{ cursor: 'pointer' }}>Address</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.address}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: 30 }}>Add New Store</h3>
      <form onSubmit={handleAddStore}>
        <input placeholder="Store name (20-60 chars)" value={newStore.name} onChange={(e) => setNewStore({ ...newStore, name: e.target.value })} required /><br />
        <input placeholder="Email" type="email" value={newStore.email} onChange={(e) => setNewStore({ ...newStore, email: e.target.value })} required /><br />
        <input placeholder="Address" value={newStore.address} onChange={(e) => setNewStore({ ...newStore, address: e.target.value })} required /><br />
        <select value={newStore.ownerId} onChange={(e) => setNewStore({ ...newStore, ownerId: e.target.value })}>
          <option value="">No owner assigned yet</option>
          {storeOwners.map((o) => (
            <option key={o.id} value={o.id}>{o.fullName} ({o.email})</option>
          ))}
        </select><br />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Add Store</button>
      </form>
    </div>
  );
}
