// server.js
// Minimal Express server for your AI-Powered EdTech app

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./db');
const bcrypt = require('bcryptjs');

// Models
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Session = require('./models/Session');
const LiveSession = require('./models/LiveSession');
const Review = require('./models/Review');
const Transaction = require('./models/Transaction');
const AuthUser = require('./models/AuthUser');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000', // Vite dev URL (configured in vite.config.ts)
    credentials: true,
  })
);

// Simple health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running and MongoDB is connected (check server logs).' });
});

// --- Auth APIs ---

// Signup for student/teacher/admin
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role, subjects, pricePerMinute } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await AuthUser.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let profile = null;
    let profileModel = null;

    if (role === 'student') {
      profile = await Student.create({
        name,
        email,
        walletBalance: 0,
        completedSessions: 0,
        avgSessionDuration: 0,
        reviewConsistencyScore: 0,
        totalReviewsGiven: 0,
      });
      profileModel = 'Student';
    } else if (role === 'teacher') {
      profile = await Teacher.create({
        name,
        email,
        subjects: subjects || [],
        pricePerMinute: pricePerMinute || 1.0,
        ratingAvg: 0,
        totalSessions: 0,
        credibleReviewRatio: 0,
        earnings: 0,
      });
      profileModel = 'Teacher';
    } else if (role === 'admin') {
      // Admins do not have a Student/Teacher profile
      profile = null;
      profileModel = null;
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const authUser = await AuthUser.create({
      email,
      passwordHash,
      role,
      profileId: profile ? profile._id : null,
      profileModel,
    });

    res.status(201).json({
      userId: authUser._id,
      role: authUser.role,
      profileId: authUser.profileId,
      profileModel: authUser.profileModel,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const authUser = await AuthUser.findOne({ email, role });
    if (!authUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, authUser.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      userId: authUser._id,
      role: authUser.role,
      profileId: authUser.profileId,
      profileModel: authUser.profileModel,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Dashboard APIs ---

// Student dashboard summary
app.get('/api/students/:id/dashboard', async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id).lean();
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const recentTransactions = await Transaction.find({
      userId: id,
      userModel: 'Student',
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    const sessions = await Session.find({ studentId: id }).lean();

    res.json({
      student,
      stats: {
        walletBalance: student.walletBalance,
        completedSessions: student.completedSessions,
        avgSessionDuration: student.avgSessionDuration,
      },
      sessions,
      recentTransactions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Teacher dashboard summary
app.get('/api/teachers/:id/dashboard', async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findById(id).lean();
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const historicalSessions = await Session.find({ teacherId: id }).lean();
    const liveSessions = await LiveSession.find({ teacherId: id }).lean();

    // Merge both types of sessions
    const sessions = [...historicalSessions, ...liveSessions];

    // Handle both MongoDB ObjectIds and custom string IDs
    let earningsData = [];
    try {
      const matchUserId = mongoose.Types.ObjectId.isValid(id) && id.length === 24
        ? new mongoose.Types.ObjectId(id)
        : id;

      earningsData = await Transaction.aggregate([
        {
          $match: {
            userId: matchUserId,
            userModel: 'Teacher',
            type: 'credit',
            status: 'completed',
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            amount: { $sum: '$amount' },
          },
        },
        {
          $project: {
            _id: 0,
            name: '$_id',
            amount: 1,
          },
        },
      ]);
    } catch (aggErr) {
      console.warn('Earnings aggregation failed:', aggErr.message);
      // Continue without earnings data
    }

    const totalStudents = await Session.distinct('studentId', { teacherId: id });

    res.json({
      teacher,
      stats: {
        earnings: teacher.earnings,
        totalStudents: totalStudents.length,
        totalSessions: teacher.totalSessions,
        credibleReviewRatio: teacher.credibleReviewRatio,
      },
      earningsData,
      sessions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Transactions for a user (wallet view)
app.get('/api/users/:id/transactions', async (req, res) => {
  try {
    const { id } = req.params;
    const { model = 'Student' } = req.query;

    const txs = await Transaction.find({
      userId: id,
      userModel: model,
    })
      .sort({ timestamp: -1 })
      .lean();

    res.json(txs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all scheduled sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await LiveSession.find({ status: { $in: ['scheduled', 'live'] } })
      .populate('teacherId', 'name subjects ratingAvg')
      .sort({ startTime: 1 })
      .limit(20)
      .lean();
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching sessions' });
  }
});

// Create a new session (scheduled by teacher) - saved to LiveSession collection
app.post('/api/sessions', async (req, res) => {
  try {
    const { teacherId, topic, date, time, duration, ratePerMinute, description, languages } = req.body;

    if (!teacherId || !topic || !date || !time || !duration || !ratePerMinute) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Combine date and time to ISO string
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    const session = await LiveSession.create({
      teacherId,
      studentId: null, // No student yet
      topic,
      startTime: startDateTime,
      endTime: endDateTime,
      durationMinutes: parseInt(duration),
      ratePerMinute: parseFloat(ratePerMinute),
      status: 'scheduled',
      description,
      languages
    });

    res.status(201).json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating session' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});


