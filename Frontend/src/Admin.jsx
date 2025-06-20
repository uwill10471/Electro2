// Admin.jsx
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { API_BASE } from './api';

const Admin = () => {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', password: '' });
  const [loginMsg, setLoginMsg] = useState('');
  const [registerMsg, setRegisterMsg] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState({ date: '', location: '', description: '' });
  const [eventMsg, setEventMsg] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [dropoffs, setDropoffs] = useState([]);
  const [users, setUsers] = useState([]);

  // Admin login
  const handleLoginChange = e => setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  const handleAdminLogin = async e => {
    e.preventDefault();
    setLoginMsg('');
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      const data = await res.json();
      setAdminToken(data.token);
      setIsAdmin(true);
      localStorage.setItem('adminToken', data.token);
    } catch (err) {
      setLoginMsg(err.message || 'Login failed');
    }
  };
  const handleAdminLogout = () => {
    setAdminToken('');
    setIsAdmin(false);
    localStorage.removeItem('adminToken');
  };

  // Admin register
  const handleRegisterChange = e => setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  const handleAdminRegister = async e => {
    e.preventDefault();
    setRegisterMsg('');
    try {
      const res = await fetch(`${API_BASE}/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setRegisterMsg('Admin registered! Please login.');
      setShowRegister(false);
    } catch (err) {
      setRegisterMsg(err.message || 'Registration failed');
    }
  };

  // Fetch events
  useEffect(() => {
    if (!adminToken) return;
    fetch(`${API_BASE}/events`)
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        if (data.length > 0) setSelectedEvent(data[0]._id);
      });
  }, [adminToken]);

  // Fetch drop-offs for selected event
  useEffect(() => {
    if (!adminToken || !selectedEvent) return;
    fetch(`${API_BASE}/events/${selectedEvent}/dropoffs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
      .then(res => res.json())
      .then(data => setDropoffs(data));
  }, [adminToken, selectedEvent]);

  // Fetch users (admin only)
  useEffect(() => {
    if (!adminToken) return;
    fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
      .then(res => res.json())
      .then(data => setUsers(data));
  }, [adminToken]);

  // Event handlers
  const handleEventFormChange = e => setEventForm({ ...eventForm, [e.target.name]: e.target.value });
  const handleCreateEvent = async e => {
    e.preventDefault();
    setEventMsg('');
    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(eventForm),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setEventMsg('Event created!');
      const eventsRes = await fetch(`${API_BASE}/events`);
      setEvents(await eventsRes.json());
    } catch (err) {
      setEventMsg(err.message || 'Error');
    }
  };
  const handleDeleteEvent = async id => {
    if (!window.confirm('Delete this event?')) return;
    await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const eventsRes = await fetch(`${API_BASE}/events`);
    setEvents(await eventsRes.json());
    setEventMsg('Event deleted.');
  };

  // Export users to Excel
  const handleExportUsers = () => {
    const ws = XLSX.utils.json_to_sheet(users.map(u => ({
      Email: u.email,
      Rewards: u.rewards,
      Admin: u.isAdmin ? 'Yes' : 'No',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'users.xlsx');
  };

  // Export drop-offs to Excel
  const handleExportDropoffs = () => {
    const ws = XLSX.utils.json_to_sheet(dropoffs.map(d => ({
      User: d.userId?.email || 'User',
      Electronics: d.electronics.join(', '),
      Items: d.items,
      Rewards: d.rewards,
      Date: d.createdAt ? new Date(d.createdAt).toLocaleString() : '',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DropOffs');
    XLSX.writeFile(wb, 'dropoffs.xlsx');
  };

  if (!adminToken || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-cyan-100 to-purple-200">
        <div className="bg-white/90 p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">{showRegister ? 'Admin Register' : 'Admin Login'}</h2>
          {showRegister ? (
            <form onSubmit={handleAdminRegister} className="flex flex-col gap-4">
              <input name="email" value={registerForm.email} onChange={handleRegisterChange} placeholder="Admin Email" required className="border border-cyan-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70" />
              <input name="password" type="password" value={registerForm.password} onChange={handleRegisterChange} placeholder="Password" required className="border border-cyan-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70" />
              <button type="submit" className="bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 text-white font-bold py-2 rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-600 hover:scale-105 transition-all duration-200">Register as Admin</button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
              <input name="email" value={loginForm.email} onChange={handleLoginChange} placeholder="Admin Email" required className="border border-cyan-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70" />
              <input name="password" type="password" value={loginForm.password} onChange={handleLoginChange} placeholder="Password" required className="border border-cyan-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70" />
              <button type="submit" className="bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 text-white font-bold py-2 rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-600 hover:scale-105 transition-all duration-200">Login as Admin</button>
            </form>
          )}
          <div className="mt-4 text-center">
            <button onClick={() => { setShowRegister(r => !r); setRegisterMsg(''); setLoginMsg(''); }} className="text-blue-600 hover:underline bg-none border-none cursor-pointer">
              {showRegister ? 'Already have an account? Login' : 'No admin account? Register'}
            </button>
          </div>
          {loginMsg && !showRegister && <div className="mt-4 text-center text-red-600">{loginMsg}</div>}
          {registerMsg && showRegister && <div className="mt-4 text-center text-green-600">{registerMsg}</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Admin Dashboard</h2>
        <button onClick={handleAdminLogout} className="bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 text-white font-bold py-2 px-6 rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-600 hover:scale-105 transition-all duration-200">Logout</button>
      </div>
      <hr />
      <h3>Registered Users</h3>
      <button onClick={handleExportUsers} style={{ marginBottom: 8 }}>Export Users to Excel</button>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Rewards</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Admin</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{u.email}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{u.rewards}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{u.isAdmin ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3>Events</h3>
      <ul>
        {events.map(ev => (
          <li key={ev._id} style={{ marginBottom: 8 }}>
            <b>{new Date(ev.date).toLocaleString()}</b> at <b>{ev.location}</b> - {ev.description}
            <button style={{ marginLeft: 12 }} onClick={() => setSelectedEvent(ev._id)}>Select</button>
            <button style={{ marginLeft: 8, color: 'red' }} onClick={() => handleDeleteEvent(ev._id)}>Delete</button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleCreateEvent} style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <input name="date" type="datetime-local" value={eventForm.date} onChange={handleEventFormChange} required />
        <input name="location" value={eventForm.location} onChange={handleEventFormChange} placeholder="Location" required />
        <input name="description" value={eventForm.description} onChange={handleEventFormChange} placeholder="Description" />
        <button type="submit">Create Event</button>
      </form>
      {eventMsg && <p style={{ color: 'green' }}>{eventMsg}</p>}
      <hr />
      <h3>Drop-Offs for Selected Event</h3>
      <button onClick={handleExportDropoffs} style={{ marginBottom: 8 }}>Export Drop-Offs to Excel</button>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>User</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Electronics</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Items</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Rewards</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {dropoffs.map(d => (
              <tr key={d._id}>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{d.userId?.email || 'User'}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{d.electronics.join(', ')}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{d.items}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{d.rewards}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{d.createdAt ? new Date(d.createdAt).toLocaleString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
