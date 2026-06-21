import { useEffect, useState } from 'react';
import apiClient from '../../api/client';

export default function StoreDirectory() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ name: '', address: '' });
  const [ratingsMap, setRatingsMap] = useState({});

  const fetchStores = async () => {
    const res = await apiClient.get('/stores', { params: search });
    setStores(res.data);

    const map = {};
    await Promise.all(
      res.data.map(async (store) => {
        const avgRes = await apiClient.get(`/ratings/store/${store.id}`);
        let mine = null;
        try {
          const mineRes = await apiClient.get(`/ratings/store/${store.id}/mine`);
          mine = mineRes.data;
        } catch (e) { /* no rating yet */ }
        map[store.id] = { avg: avgRes.data, mine };
      }),
    );
    setRatingsMap(map);
  };

  useEffect(() => { fetchStores(); }, []);

  const submitRating = async (storeId, value) => {
    try {
      await apiClient.post('/ratings', { storeId, value: Number(value) });
      fetchStores();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  const updateRating = async (ratingId, storeId, value) => {
    try {
      await apiClient.patch(`/ratings/${ratingId}`, { value: Number(value) });
      fetchStores();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update rating');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Store Directory</h2>

      <form onSubmit={(e) => { e.preventDefault(); fetchStores(); }}>
        <input placeholder="Search by name" value={search.name} onChange={(e) => setSearch({ ...search, name: e.target.value })} />
        <input placeholder="Search by address" value={search.address} onChange={(e) => setSearch({ ...search, address: e.target.value })} />
        <button type="submit">Search</button>
      </form>

      <table border="1" cellPadding="6" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Store Name</th>
            <th>Address</th>
            <th>Overall Rating</th>
            <th>Your Rating</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => {
            const data = ratingsMap[s.id] || {};
            const currentValue = data.mine?.value ? String(data.mine.value) : '';
            return (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.address}</td>
                <td>{data.avg?.averageRating ?? 'No ratings yet'}</td>
                <td>{data.mine?.value ?? 'Not rated'}</td>
                <td>
                  <select
                    value={currentValue}
                    onChange={(e) => {
                      if (!e.target.value) return;
                      if (data.mine) updateRating(data.mine.id, s.id, e.target.value);
                      else submitRating(s.id, e.target.value);
                    }}
                  >
                    <option value="" disabled>{data.mine ? 'Update rating' : 'Rate this store'}</option>
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
