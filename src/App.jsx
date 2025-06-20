import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { api } from './api';
import Admin from './Admin';
import Event from './Event';
import Home from './Home';

// Use relative URLs for API calls (works locally and in production)
const API = '/api';

function NavBar() {
  return (
    <nav style={{ display: 'flex', gap: 24, padding: 16, background: '#f3f4f6', borderBottom: '1px solid #e5e7eb', marginBottom: 24 }}>
      <Link to="/">Home</Link>
      <Link to="/events">Events</Link>
      <Link to="/admin">Admin</Link>
    </nav>
  );
}

function App() {
  // Auth state
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [authMode, setAuthMode] = useState('login');
  const [authMsg, setAuthMsg] = useState('');

  // Events
  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState({ date: '', location: '', description: '' });
  const [selectedEvent, setSelectedEvent] = useState('');
  const [eventMsg, setEventMsg] = useState('');

  // Drop-off
  const [dropForm, setDropForm] = useState({ electronics: [], items: '' });
  const [dropMsg, setDropMsg] = useState('');
  const [dropoffs, setDropoffs] = useState([]);

  // Rewards
  const [rewards, setRewards] = useState(0);

  // Electronics options
  const ELECTRONICS_OPTIONS = ['TV', 'Mobile Phone', 'Laptop', 'Tablet', 'Charger', 'Mixer', 'Printer', 'Other'];
  const [otherItem, setOtherItem] = useState('');

  // Fetch user info
  useEffect(() => {
    if (token) {
      api.get('/users/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setUser(res.data);
          setRewards(res.data.rewards);
        })
        .catch(() => { setUser(null); setToken(''); localStorage.removeItem('token'); });
    }
  }, [token]);

  // Fetch events
  useEffect(() => {
    api.get('/events').then(res => {
      setEvents(res.data);
      if (res.data.length > 0) setSelectedEvent(res.data[0]._id);
    });
  }, []);

  // Fetch drop-offs for selected event
  useEffect(() => {
    if (token && selectedEvent) {
      api.get(`/events/${selectedEvent}/dropoffs`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setDropoffs(res.data));
    }
  }, [token, selectedEvent]);

  // Auth handlers
  const handleAuthChange = e => setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  const handleAuth = async e => {
    e.preventDefault();
    setAuthMsg('');
    try {
      const url = authMode === 'login' ? '/users/login' : '/users/register';
      const res = await api.post(url, authForm);
      if (authMode === 'login') {
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        setRewards(res.data.rewards);
      } else {
        setAuthMsg('Registration successful! Please log in.');
        setAuthMode('login');
      }
    } catch (err) {
      setAuthMsg(err.response?.data?.message || 'Error');
    }
  };
  const handleLogout = () => { setToken(''); setUser(null); localStorage.removeItem('token'); };

  // Event handlers
  const handleEventFormChange = e => setEventForm({ ...eventForm, [e.target.name]: e.target.value });
  const handleCreateEvent = async e => {
    e.preventDefault();
    setEventMsg('');
    try {
      await api.post('/events', eventForm, { headers: { Authorization: `Bearer ${token}` } });
      setEventMsg('Event created!');
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      setEventMsg(err.response?.data?.message || 'Error');
    }
  };
  const handleDeleteEvent = async id => {
    if (!window.confirm('Delete this event?')) return;
    await api.delete(`/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    const res = await api.get('/events');
    setEvents(res.data);
    setEventMsg('Event deleted.');
  };

  // Drop-off handlers
  const handleDropChange = e => setDropForm({ ...dropForm, [e.target.name]: e.target.value });
  const handleElectronicsChange = e => {
    const { value, checked } = e.target;
    if (checked) {
      setDropForm(f => ({ ...f, electronics: [...f.electronics, value] }));
    } else {
      setDropForm(f => ({ ...f, electronics: f.electronics.filter(item => item !== value) }));
    }
  };
  const handleDropoff = async e => {
    e.preventDefault();
    setDropMsg('');
    let electronics = dropForm.electronics;
    let items = dropForm.items;
    if (electronics.includes('Other')) {
      electronics = electronics.filter(item => item !== 'Other');
      if (otherItem) electronics.push(otherItem);
      items = otherItem;
    }
    try {
      const res = await api.post('/dropoff', { eventId: selectedEvent, electronics, items }, { headers: { Authorization: `Bearer ${token}` } });
      setDropMsg('Drop-off registered!');
      setRewards(res.data.rewards);
    } catch (err) {
      setDropMsg(err.response?.data?.message || 'Error');
    }
  };

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Event />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App; 