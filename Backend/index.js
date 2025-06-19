const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const { fileURLToPath } = require('url');

const { dirname, join, resolve } = path;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());





// MongoDB connection
const mongoURI = process.env.MONGODB_URI ;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Mongoose Schema
const RegistrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  items: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  createdAt: { type: Date, default: Date.now },
});

const Registration = mongoose.model('Registration', RegistrationSchema);

// Event Schema
const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Event = mongoose.model('Event', EventSchema);

// API endpoint
app.post('/api/register', async (req, res) => {
  const { name, items, eventId } = req.body;
  if (!name || !items || !eventId) {
    return res.status(400).json({ error: 'Name, items, and eventId are required.' });
  }
  try {
    const registration = new Registration({ name, items, eventId });
    await registration.save();
    res.status(201).json({ message: 'Registration successful!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Create Event
app.post('/api/events', async (req, res) => {
  const { title, date, description, location } = req.body;
  if (!title || !date || !description || !location) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    const event = new Event({ title, date, description, location });
    await event.save();
    res.status(201).json({ message: 'Event created!', event });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get All Events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get registrations for a specific event
app.get('/api/events/:id/registrations', async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.id });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.use(express.static(path.resolve(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
});
app.get('/', (req, res) => {
  res.send('E-Waste Drop Initiative API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
