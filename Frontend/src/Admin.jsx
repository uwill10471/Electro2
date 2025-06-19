// Admin.jsx
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const Admin = () => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    title: '',
    date: '',
    description: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registrations, setRegistrations] = useState({});

  const fetchEvents = async () => {
    try {
      const res = await fetch('https://electro2-c4h6.onrender.com/api/events');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError('Failed to fetch events');
    }
  };

  const fetchRegistrations = async (eventId) => {
    try {
      const res = await fetch(`https://electro2-c4h6.onrender.com/api/events/${eventId}/registrations`);
      const data = await res.json();
      setRegistrations((prev) => ({ ...prev, [eventId]: data }));
    } catch (err) {
      // handle error if needed
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    events.forEach((event) => {
      fetchRegistrations(event._id);
    });
  }, [events]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('https://electro2-c4h6.onrender.com/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create event');
      }
      setSuccess('Event created!');
      setForm({ title: '', date: '', description: '', location: '' });
      fetchEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Export all registrations for all events as Excel
  const handleExportExcel = async () => {
    // Fetch all events and their registrations
    const eventData = await Promise.all(events.map(async (event) => {
      const regs = registrations[event._id] || [];
      return regs.map((reg) => ({
        Event: event.title,
        Date: new Date(event.date).toLocaleDateString(),
        Location: event.location,
        Name: reg.name,
        Items: reg.items,
      }));
    }));
    const flatData = eventData.flat();
    if (flatData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(flatData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
    XLSX.writeFile(wb, 'event_registrations.xlsx');
  };

  return (
    <div className="min-h-screen w-full p-0 m-0 bg-gradient-to-br from-blue-100 via-cyan-100 to-purple-200">
      <header className="w-full py-6 px-8 bg-white/80 shadow-md backdrop-blur sticky top-0 z-10 flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 drop-shadow">Create your event</h1>
        <a href="/" className="text-blue-600 font-semibold hover:underline">Home</a>
      </header>
      <main className="flex flex-col items-center justify-center w-full px-2 py-8">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white/80 rounded-2xl shadow-2xl border border-purple-200 p-8 flex flex-col gap-4 backdrop-blur-lg hover:shadow-purple-200 transition col-span-1">
            <h2 className="text-2xl font-bold text-purple-700 mb-2">Create New Event</h2>
            {error && <div className="mb-2 text-red-600">{error}</div>}
            {success && <div className="mb-2 text-green-600">{success}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="title"
                placeholder="Event Title"
                value={form.title}
                onChange={handleChange}
                className="w-full border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 p-2 rounded-lg bg-white/70"
                required
              />
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 p-2 rounded-lg bg-white/70"
                required
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={form.location}
                onChange={handleChange}
                className="w-full border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 p-2 rounded-lg bg-white/70"
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                className="w-full border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 p-2 rounded-lg bg-white/70"
                rows="3"
                required
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 via-pink-400 to-blue-500 text-white font-bold py-2 rounded-xl shadow-lg hover:from-purple-600 hover:to-blue-600 hover:scale-105 transition-all duration-200"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </form>
          </div>
          <div className="bg-white/80 rounded-2xl shadow-2xl border border-purple-200 p-8 flex flex-col gap-4 backdrop-blur-lg hover:shadow-purple-200 transition col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-purple-700">All Events</h2>
              <button
                onClick={handleExportExcel}
                className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-lg shadow hover:from-green-500 hover:to-blue-600 font-semibold"
              >
                Export to Excel
              </button>
            </div>
            <ul className="space-y-6">
              {events.length === 0 && <li className="text-center text-gray-400">No events yet.</li>}
              {events.map((event) => (
                <li key={event._id} className="border p-4 rounded-2xl bg-white/90 shadow-lg border border-purple-100 w-full hover:shadow-purple-200 transition">
                  <div className="font-extrabold text-xl text-purple-700 mb-1">{event.title}</div>
                  <div className="text-gray-700 text-sm mb-1 flex items-center gap-2">
                    <span className="inline-block bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{new Date(event.date).toLocaleDateString()}</span>
                    <span className="inline-block bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-medium">{event.location}</span>
                  </div>
                  <div className="text-gray-600 mt-1 italic">{event.description}</div>
                  <div className="mt-4">
                    <div className="font-semibold text-purple-700 mb-2">Registrations:</div>
                    {registrations[event._id] && registrations[event._id].length > 0 ? (
                      <ul className="space-y-1">
                        {registrations[event._id].map((reg) => (
                          <li key={reg._id} className="text-gray-700 text-sm bg-purple-50 rounded px-2 py-1">
                            <span className="font-bold">{reg.name}</span>: {reg.items}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-400 text-sm">No registrations yet.</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
