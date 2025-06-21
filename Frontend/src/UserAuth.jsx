import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from './api';

const UserAuth = ({ mode }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      if (mode === 'login') {
        localStorage.setItem('userToken', data.token);
        setMsg('Login successful! Redirecting...');
        setTimeout(() => navigate('/'), 1000);
      } else {
        setMsg('Registration successful! You can now log in.');
        setTimeout(() => navigate('/login'), 1000);
      }
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-cyan-100 to-purple-200">
      <div className="bg-white/90 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">{mode === 'login' ? 'User Login' : 'User Register'}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="border border-cyan-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 text-gray-900 placeholder-gray-500"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="border border-cyan-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 text-gray-900 placeholder-gray-500"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 text-white font-bold py-2 rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-600 hover:scale-105 transition-all duration-200"
            disabled={loading}
          >
            {loading ? (mode === 'login' ? 'Logging in...' : 'Registering...') : (mode === 'login' ? 'Login' : 'Register')}
          </button>
        </form>
        <div className="mt-4 text-center">
          {mode === 'login' ? (
            <>
              <span>Don't have an account? </span>
              <a href="/register" className="text-blue-600 hover:underline">Register</a>
            </>
          ) : (
            <>
              <span>Already have an account? </span>
              <a href="/login" className="text-blue-600 hover:underline">Login</a>
            </>
          )}
        </div>
        {msg && <div className={`mt-4 text-center ${msg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{msg}</div>}
      </div>
    </div>
  );
};

export default UserAuth; 