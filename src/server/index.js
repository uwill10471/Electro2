const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rewards: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

const eventSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  location: { type: String, required: true },
  description: String
});
const Event = mongoose.model('Event', eventSchema);

const dropOffSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  electronics: [String],
  items: String,
  rewards: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now }
});
const DropOff = mongoose.model('DropOff', dropOffSchema);

app.use(cors());
app.use(express.json());

// --- Auth Middleware ---
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// --- Admin Auth Middleware ---
function adminAuth(req, res, next) {
  auth(req, res, () => {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
    next();
  });
}

// --- User Routes ---
app.post('/api/users/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already registered' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash });
  res.status(201).json({ message: 'User registered' });
});

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, rewards: user.rewards, isAdmin: user.isAdmin });
});

app.get('/api/users/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ email: user.email, rewards: user.rewards, isAdmin: user.isAdmin });
});

// --- Admin Registration/Login ---
app.post('/api/admin/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already registered' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash, isAdmin: true });
  res.status(201).json({ message: 'Admin registered' });
});

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, isAdmin: true });
  if (!user) return res.status(401).json({ message: 'Invalid admin credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid admin credentials' });
  const token = jwt.sign({ id: user._id, email: user.email, isAdmin: true }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, isAdmin: true });
});

// --- Event Routes ---
app.get('/api/events', async (req, res) => {
  const events = await Event.find().sort('date');
  res.json(events);
});

app.post('/api/events', adminAuth, async (req, res) => {
  const { date, location, description } = req.body;
  const event = await Event.create({ date, location, description });
  res.status(201).json(event);
});

app.delete('/api/events/:id', adminAuth, async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  await DropOff.deleteMany({ eventId: req.params.id });
  res.json({ message: 'Event and related drop-offs deleted' });
});

// --- Drop-Off Routes ---
app.post('/api/dropoff', auth, async (req, res) => {
  const { eventId, electronics, items } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: 'User not found' });
  const dropoff = await DropOff.create({
    userId: user._id,
    eventId,
    electronics,
    items,
    rewards: 10
  });
  user.rewards += 10;
  await user.save();
  res.status(201).json({ message: 'Drop-off registered', rewards: user.rewards });
});

app.get('/api/events/:id/dropoffs', adminAuth, async (req, res) => {
  const dropoffs = await DropOff.find({ eventId: req.params.id }).populate('userId', 'email');
  res.json(dropoffs);
});

// --- Serve React build in production ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 