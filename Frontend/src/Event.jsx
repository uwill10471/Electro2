import React, { useState, useEffect } from 'react';
import { API_BASE } from './api';

const Event = () => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    location: '',
    eventType: 'E-Waste Collection',
    capacity: 100,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/events`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError('Failed to fetch events');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const eventData = {
        ...form,
        date: `${form.date}T${form.time}`,
      };
      delete eventData.time;

      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create event');
      }
      setSuccess('Event created successfully! 🎉');
      setForm({
        title: '',
        date: '',
        time: '',
        description: '',
        location: '',
        eventType: 'E-Waste Collection',
        capacity: 100,
      });
      fetchEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedEventType = eventTypes.find(t => t.value === form.eventType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 mb-4">
            Create Amazing Events
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Organize impactful e-waste initiatives that inspire and engage our community
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-12">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
              <span className="text-2xl">✨</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Event Details</h2>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center">
              <span className="text-xl mr-3">❌</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 flex items-center">
              <span className="text-xl mr-3">✅</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
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
                    value={form.title}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('title')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full border-2 rounded-2xl p-4 text-lg transition-all duration-300 ${
                      focusedField === 'title' 
                        ? 'border-purple-400 shadow-lg shadow-purple-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    } text-gray-900 placeholder-gray-400 bg-white/50 backdrop-blur-sm`}
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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
                    value={form.eventType}
                    onChange={handleChange}
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
                    value={form.date}
                    onChange={handleChange}
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
                    value={form.time}
                    onChange={handleChange}
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
                    value={form.capacity}
                    onChange={handleChange}
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
                  value={form.location}
                  onChange={handleChange}
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
                  value={form.description}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full border-2 rounded-2xl p-4 text-lg transition-all duration-300 resize-none ${
                    focusedField === 'description' 
                      ? 'border-purple-400 shadow-lg shadow-purple-100' 
                      : 'border-gray-200 hover:border-gray-300'
                  } text-gray-900 placeholder-gray-400 bg-white/50 backdrop-blur-sm`}
                  rows="5"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className="group relative inline-flex items-center justify-center px-12 py-4 text-xl font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <span className="text-2xl mr-3">🎉</span>
                      Create Amazing Event
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Events List */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">Your Events</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📭</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-600 mb-2">No events yet</h4>
                <p className="text-gray-500">Create your first amazing event above!</p>
              </div>
            ) : (
              events.map((event) => {
                const eventType = eventTypes.find(t => t.value === event.eventType);
                return (
                  <div key={event._id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-4 py-2 rounded-full text-sm font-semibold ${eventType?.bgColor} ${eventType?.borderColor} border`}>
                        <span className="mr-2">{eventType?.icon}</span>
                        {eventType?.label || event.eventType}
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {new Date(event.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-xl text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">
                      {event.title || 'E-Waste Collection Event'}
                    </h4>
                    
                    <div className="space-y-3 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs">📅</span>
                        </span>
                        {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs">📍</span>
                        </span>
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs">👥</span>
                        </span>
                        Capacity: {event.capacity || 100} people
                      </div>
                    </div>
                    
                    {event.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">{event.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {event.isActive ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                      <div className="text-xs text-gray-400">
                        Created {new Date(event.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event; 