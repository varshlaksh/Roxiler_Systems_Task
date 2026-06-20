
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

export default function Signup() {
  const [form, setForm] = useState({
    fullName: '', email: '', address: '', password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/users/signup', { ...form, role: 'user' });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Signup failed');
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400 }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name (20-60 chars)</label><br />
          <input name="fullName" value={form.fullName} onChange={handleChange} required />
        </div>
        <div>
          <label>Email</label><br />
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Address</label><br />
          <input name="address" value={form.address} onChange={handleChange} required />
        </div>
        <div>
          <label>Password (8-16 chars, 1 uppercase, 1 special)</label><br />
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>Account created, redirecting...</p>}
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
}
