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
  const [eventForm, setEventForm] = useState({ 
    title: '', 
    date: '', 
    time: '',
    location: '', 
    description: '', 
    eventType: 'E-Waste Collection',
    capacity: 100
  });
  const [eventMsg, setEventMsg] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [dropoffs, setDropoffs] = useState([]);
  const [users, setUsers] = useState([]);
  const [focusedField, setFocusedField] = useState('');

  const eventTypes = [
    { 
      value: 'E-Waste Collection', 
      label: 'E-Waste Collection', 
      icon: '♻️',
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    { 
      value: 'Electronics Repair', 
      label: 'Electronics Repair', 
      icon: '🔧',
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      value: 'Awareness Workshop', 
      label: 'Awareness Workshop', 
      icon: '📚',
      color: 'from-purple-400 to-violet-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    { 
      value: 'Recycling Drive', 
      label: 'Recycling Drive', 
      icon: '🌱',
      color: 'from-emerald-400 to-teal-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    { 
      value: 'Community Cleanup', 
      label: 'Community Cleanup', 
      icon: '🧹',
      color: 'from-orange-400 to-amber-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
  ];

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
      const eventData = {
        ...eventForm,
        date: `${eventForm.date}T${eventForm.time}`,
      };
      delete eventData.time;

      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(eventData),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setEventMsg('Event created successfully! 🎉');
      setEventForm({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        eventType: 'E-Waste Collection',
        capacity: 100
      });
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

  const selectedEventType = eventTypes.find(t => t.value === eventForm.eventType);

  if (!adminToken || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-cyan-100 to-purple-200">
        <div className="bg-white/90 p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">{showRegister ? 'Admin Register' : 'Admin Login'}</h2>
          {showRegister ? (
            <form onSubmit={handleAdminRegister} className="flex flex-col gap-4">
              <input name="email" value={registerForm.email} onChange={handleRegisterChange} placeholder="Admin Email" required className="border border-cyan-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 text-gray-900 placeholder-gray-500" />
              <input name="password" type="password" value={registerForm.password} onChange={handleRegisterChange} placeholder="Password" required className="border border-cyan-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 text-gray-900 placeholder-gray-500" />
              <button type="submit" className="bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 text-white font-bold py-2 rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-600 hover:scale-105 transition-all duration-200">Register as Admin</button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
              <input name="email" value={loginForm.email} onChange={handleLoginChange} placeholder="Admin Email" required className="border border-cyan-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 text-gray-900 placeholder-gray-500" />
              <input name="password" type="password" value={loginForm.password} onChange={handleLoginChange} placeholder="Password" required className="border border-cyan-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 text-gray-900 placeholder-gray-500" />
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <span className="text-2xl">👑</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Manage events, users, and community initiatives</p>
            </div>
          </div>
          <button 
            onClick={handleAdminLogout} 
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-all duration-200"
          >
            Logout
          </button>
        </div>

        {/* Create Event Section */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
              <span className="text-2xl">✨</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Create New Event</h2>
          </div>
          
          {eventMsg && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center ${
              eventMsg.includes('success') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <span className="text-xl mr-3">{eventMsg.includes('success') ? '✅' : '❌'}</span>
              <span>{eventMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateEvent} className="space-y-8">
            {/* Title and Event Type Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="text-xl mr-2">📝</span>
                  Event Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter a catchy event title"
                    value={eventForm.title}
                    onChange={handleEventFormChange}
                    onFocus={() => setFocusedField('title')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full border-2 rounded-2xl p-4 text-lg transition-all duration-300 ${
                      focusedField === 'title' 
                        ? 'border-purple-400 shadow-lg shadow-purple-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    } text-gray-900 placeholder-gray-400 bg-white/50 backdrop-blur-sm`}
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="text-xl mr-2">🏷️</span>
                  Event Type
                </label>
                <div className="relative">
                  <select
                    name="eventType"
                    value={eventForm.eventType}
                    onChange={handleEventFormChange}
                    onFocus={() => setFocusedField('eventType')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full border-2 rounded-2xl p-4 text-lg transition-all duration-300 appearance-none ${
                      focusedField === 'eventType' 
                        ? 'border-purple-400 shadow-lg shadow-purple-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    } text-gray-900 bg-white/50 backdrop-blur-sm`}
                    required
                  >
                    {eventTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Type Preview */}
            {selectedEventType && (
              <div className={`p-6 rounded-2xl border-2 ${selectedEventType.borderColor} ${selectedEventType.bgColor} transition-all duration-300`}>
                <div className="flex items-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${selectedEventType.color} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}>
                    <span className="text-3xl">{selectedEventType.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedEventType.label}</h3>
                    <p className="text-gray-600">Perfect for organizing impactful {selectedEventType.label.toLowerCase()} initiatives</p>
                  </div>
                </div>
              </div>
            )}

            {/* Date, Time, and Capacity Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="text-xl mr-2">📅</span>
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="date"
                    value={eventForm.date}
                    onChange={handleEventFormChange}
                    onFocus={() => setFocusedField('date')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full border-2 rounded-2xl p-4 text-lg transition-all duration-300 ${
                      focusedField === 'date' 
                        ? 'border-purple-400 shadow-lg shadow-purple-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    } text-gray-900 bg-white/50 backdrop-blur-sm`}
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="text-xl mr-2">⏰</span>
                  Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    name="time"
                    value={eventForm.time}
                    onChange={handleEventFormChange}
                    onFocus={() => setFocusedField('time')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full border-2 rounded-2xl p-4 text-lg transition-all duration-300 ${
                      focusedField === 'time' 
                        ? 'border-purple-400 shadow-lg shadow-purple-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    } text-gray-900 bg-white/50 backdrop-blur-sm`}
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="text-xl mr-2">👥</span>
                  Capacity
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="capacity"
                    placeholder="100"
                    value={eventForm.capacity}
                    onChange={handleEventFormChange}
                    onFocus={() => setFocusedField('capacity')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full border-2 rounded-2xl p-4 text-lg transition-all duration-300 ${
                      focusedField === 'capacity' 
                        ? 'border-purple-400 shadow-lg shadow-purple-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    } text-gray-900 placeholder-gray-400 bg-white/50 backdrop-blur-sm`}
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="text-xl mr-2">📍</span>
                Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  placeholder="Enter the event venue or address"
                  value={eventForm.location}
                  onChange={handleEventFormChange}
                  onFocus={() => setFocusedField('location')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full border-2 rounded-2xl p-4 text-lg transition-all duration-300 ${
                    focusedField === 'location' 
                      ? 'border-purple-400 shadow-lg shadow-purple-100' 
                      : 'border-gray-200 hover:border-gray-300'
                  } text-gray-900 placeholder-gray-400 bg-white/50 backdrop-blur-sm`}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="text-xl mr-2">📝</span>
                Description
              </label>
              <div className="relative">
                <textarea
                  name="description"
                  placeholder="Describe your event details, what participants can expect, special instructions, and why they should attend..."
                  value={eventForm.description}
                  onChange={handleEventFormChange}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full border-2 rounded-2xl p-4 text-lg transition-all duration-300 resize-none ${
                    focusedField === 'description' 
                      ? 'border-purple-400 shadow-lg shadow-purple-100' 
                      : 'border-gray-200 hover:border-gray-300'
                  } text-gray-900 placeholder-gray-400 bg-white/50 backdrop-blur-sm`}
                  rows="4"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="group relative inline-flex items-center justify-center px-12 py-4 text-xl font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center">
                  <span className="text-2xl mr-3">🎉</span>
                  Create Amazing Event
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Section */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-lg">👥</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Registered Users</h3>
              </div>
              <button 
                onClick={handleExportUsers} 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
              >
                Export Excel
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Rewards</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 text-gray-800">{u.email}</td>
                      <td className="py-3 px-2 text-gray-600">{u.rewards}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {u.isAdmin ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Events Section */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                <span className="text-lg">📅</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Events</h3>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {events.map(ev => {
                const eventType = eventTypes.find(t => t.value === ev.eventType);
                return (
                  <div key={ev._id} className="bg-white/50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{ev.title || 'E-Waste Collection Event'}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${eventType?.bgColor} ${eventType?.borderColor} border`}>
                            {eventType?.icon} {eventType?.label || ev.eventType}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(ev.date).toLocaleDateString()} at {new Date(ev.date).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{ev.location}</p>
                        {ev.capacity && <p className="text-xs text-gray-500 mt-1">Capacity: {ev.capacity} people</p>}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button 
                          onClick={() => setSelectedEvent(ev._id)}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Select
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(ev._id)}
                          className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drop-offs Section */}
        {selectedEvent && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-lg">📦</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Drop-Offs for Selected Event</h3>
              </div>
              <button 
                onClick={handleExportDropoffs} 
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200"
              >
                Export Excel
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">User</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Electronics</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Items</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Rewards</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dropoffs.map(d => (
                    <tr key={d._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 text-gray-800">{d.userId?.email || 'User'}</td>
                      <td className="py-3 px-2 text-gray-600">{d.electronics.join(', ')}</td>
                      <td className="py-3 px-2 text-gray-600">{d.items}</td>
                      <td className="py-3 px-2 text-gray-600">{d.rewards}</td>
                      <td className="py-3 px-2 text-gray-600">{d.createdAt ? new Date(d.createdAt).toLocaleString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
