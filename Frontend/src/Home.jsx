// Home.jsx
import React, { useState, useEffect } from 'react';
import { API_BASE } from './api';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({}); // { [eventId]: { name, items } }
  const [thankYou, setThankYou] = useState({}); // { [eventId]: true/false }
  const [error, setError] = useState({}); // { [eventId]: errorMsg }
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userToken'));

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('userToken'));
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE}/events`);
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        // handle error if needed
      }
    };
    fetchEvents();
  }, []);

  const handleChange = (eventId, field, value) => {
    setForm((prev) => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e, eventId) => {
    e.preventDefault();
    setError((prev) => ({ ...prev, [eventId]: '' }));
    setThankYou((prev) => ({ ...prev, [eventId]: false }));
    const { electronics = '', items = '' } = form[eventId] || {};
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('You must be logged in to register for an event.');
      const response = await fetch(`${API_BASE}/dropoff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          electronics: electronics.split(',').map(item => item.trim()),
          items,
          eventId,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Submission failed');
      }
      setThankYou((prev) => ({ ...prev, [eventId]: true }));
      setForm((prev) => ({ ...prev, [eventId]: { electronics: '', items: '' } }));
    } catch (err) {
      setError((prev) => ({ ...prev, [eventId]: err.message }));
    }
  };

  return (
    <div className="min-h-screen w-full p-0 m-0 bg-gradient-to-br from-blue-100 via-cyan-100 to-purple-200">
      <header className="w-full py-6 px-8 bg-white/80 shadow-md backdrop-blur sticky top-0 z-10 flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 drop-shadow">♻️ E-Waste Drop Initiative</h1>
        <div>
          {isLoggedIn ? (
            <button onClick={() => { localStorage.removeItem('userToken'); setIsLoggedIn(false); window.location.reload(); }} className="text-blue-600 font-semibold hover:underline">Logout</button>
          ) : (
            <>
              <a href="/login" className="text-blue-600 font-semibold hover:underline mr-4">Login</a>
              <a href="/register" className="text-blue-600 font-semibold hover:underline">Register</a>
            </>
          )}
        </div>
      </header>
      <main className="flex flex-col items-center justify-center w-full px-2 py-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800">Join us in making Lucknow cleaner</h2>
          <p className="mt-2 text-gray-600 text-lg">
            Drop off your old electronics <span className="font-semibold text-blue-600">last Sunday of every month</span>.
          </p>
        </div>
        {!isLoggedIn ? (
          <div className="w-full max-w-md mx-auto bg-white/80 rounded-2xl shadow-xl p-8 text-center">
            <p className="mb-4 text-lg text-gray-700">Please <a href='/login' className='text-blue-600 hover:underline'>login</a> or <a href='/register' className='text-blue-600 hover:underline'>register</a> to register for events and earn rewards!</p>
            <a href="/login" className="bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 text-white font-bold py-2 px-6 rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-600 hover:scale-105 transition-all duration-200">Login</a>
          </div>
        ) : (
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.length === 0 && <div className="col-span-2 text-center text-gray-400">No events yet.</div>}
            {events.map((event) => (
              <div key={event._id} className="bg-white/80 rounded-2xl shadow-2xl border border-blue-200 p-8 flex flex-col gap-4 backdrop-blur-lg hover:shadow-blue-200 transition">
                <div>
                  <div className="font-extrabold text-2xl text-blue-700 mb-1">{event.title}</div>
                  <div className="text-gray-700 text-sm mb-1 flex items-center gap-2">
                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{new Date(event.date).toLocaleDateString()}</span>
                    <span className="inline-block bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-medium">{event.location}</span>
                  </div>
                  <div className="text-gray-600 mt-1 italic">{event.description}</div>
                </div>
                <div className="mt-2">
                  <h3 className="text-lg font-semibold text-cyan-700 mb-2">Register for this event</h3>
                  {thankYou[event._id] && (
                    <div className="mb-2 p-2 bg-green-100 text-green-700 rounded">Thanks! We'll see you on drop-off day.</div>
                  )}
                  {error[event._id] && (
                    <div className="mb-2 p-2 bg-red-100 text-red-700 rounded">{error[event._id]}</div>
                  )}
                  <form onSubmit={(e) => handleSubmit(e, event._id)} className="space-y-2">
                    <textarea
                      placeholder="Electronics you'll drop, comma-separated (e.g., Phone, Charger, TV)"
                      value={form[event._id]?.electronics || ''}
                      onChange={(e) => handleChange(event._id, 'electronics', e.target.value)}
                      className="w-full border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-blue-400 p-2 rounded-lg bg-white/70"
                      rows="2"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Other items (optional)"
                      value={form[event._id]?.items || ''}
                      onChange={(e) => handleChange(event._id, 'items', e.target.value)}
                      className="w-full border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-blue-400 p-2 rounded-lg bg-white/70"
                    />
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 text-white font-bold py-2 rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-600 hover:scale-105 transition-all duration-200"
                    >
                      Confirm Participation
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
