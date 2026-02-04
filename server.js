// server.js
// Minimal Express server for your AI-Powered EdTech app

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
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
const VideoUrl = require('./models/VideoUrl');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI("AIzaSyCWCqh9Ls7OUFmHz0tvxdqbmT6fxD1xoNs");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

// --- FINTERNET PAYMENT GATEWAY ---
const FINTERNET_API_KEY = 'sk_hackathon_7c4bd4b69a82287aa021a3c6f3770307';
// Updated to probable endpoint based on documentation
const FINTERNET_API_URL = 'https://api.fmm.finternetlab.io/v1/payment_intents';

app.post('/api/wallet/topup', async (req, res) => {
  try {
    const { userId, userModel, amount, paymentDetails } = req.body; // userModel: 'Student' or 'Teacher'

    if (!userId || !amount) {
      return res.status(400).json({ message: 'Missing userId or amount' });
    }

    // Mask card for logging
    const maskedCard = paymentDetails?.cardNumber ? `**** **** **** ${paymentDetails.cardNumber.slice(-4)}` : 'Unknown';
    console.log(`Processing Finternet payment for ${userId}, Amount: ${amount}, Card: ${maskedCard}`);

    // 1. Call External Finternet API (Simulated)
    // In a real scenario, you would perform a fetch to their API here.
    /*
    const paymentRes = await fetch(FINTERNET_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${FINTERNET_API_KEY}`, // or X-API-Key based on docs
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            amount: amount * 100, // Cents
            currency: 'USD', 
            payment_method_data: {
                type: 'card',
                card: { number: paymentDetails.cardNumber, ... }
            }
        })    });
    if (!paymentRes.ok) throw new Error('Payment Gateway Failed');
    */

    // SIMULATION: We assume payment success for Hackathon demo
    const transactionId = 'fint_' + crypto.randomBytes(8).toString('hex');

    // 2. Update User Wallet
    let user;
    if (userModel === 'Teacher') {
      user = await Teacher.findById(userId);
    } else {
      user = await Student.findById(userId);
    }

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.walletBalance += parseFloat(amount);
    await user.save();

    // 3. Record Transaction
    await Transaction.create({
      userId,
      userModel: userModel || 'Student',
      amount: parseFloat(amount),
      type: 'credit',
      status: 'completed',
      description: `Wallet top-up via Finternet (${transactionId})`
    });

    res.json({
      success: true,
      message: 'Top-up successful',
      walletBalance: user.walletBalance,
      transactionId
    });

  } catch (err) {
    console.error('Payment Error:', err);
    res.status(500).json({ message: 'Payment processing failed' });
  }
});

// Get Single Session
app.get('/api/sessions/:id', async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id).populate('teacherId', 'name');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching session' });
  }
});

// Lock Funds for Session
app.post('/api/sessions/lock', async (req, res) => {
  try {
    const { userId, sessionId } = req.body;

    // 1. Get Session Details for Lock Amount
    const session = await LiveSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Calculate 70% of Total Estimated Cost
    // Total = duration * ratePerMinute
    const totalEstCost = session.durationMinutes * session.ratePerMinute;
    const lockAmount = totalEstCost * 0.70;

    // 2. Check Balance
    const student = await Student.findById(userId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (student.walletBalance < totalEstCost) {
      return res.status(400).json({
        message: 'Insufficient balance (Full session cost required)',
        currentBalance: student.walletBalance,
        required: totalEstCost
      });
    }

    // 3. Soft Lock Check Only (No Deduction)
    // We verified eligibility above. We do NOT deduct funds.

    res.json({ success: true, newBalance: student.walletBalance, lockedAmount: lockAmount });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Locking funds failed' });
  }
});

// Settle Session Funds
app.post('/api/sessions/complete', async (req, res) => {
  try {
    const { userId, lockedAmount: _ignored, actualCost, sessionId } = req.body; // Remove lockedAmount reliance

    // Find the original Lock Transaction
    // We look for the MOST RECENT lock for this session/user, just in case.
    const lockTx = await Transaction.findOne({
      userId,
      sessionId,
      type: 'lock'
    }).sort({ timestamp: -1 });

    const lockedAmount = lockTx ? Math.abs(lockTx.amount) : 0;

    const student = await Student.findById(userId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Logic: Deduct ONLY actual cost. No refund needed as no lock was taken.
    student.walletBalance -= actualCost;
    await student.save();

    await Transaction.create({
      userId,
      userModel: 'Student',
      amount: -actualCost,
      type: 'debit',
      status: 'completed',
      description: `Session cost`
    });

    res.json({ success: true, newBalance: student.walletBalance });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Settlement failed' });
  }
});

// Submit Review & Finalize (Archive) Session
app.post('/api/sessions/review', async (req, res) => {
  try {
    const { sessionId, userId, rating, feedback, duration, totalCost } = req.body;

    const liveSession = await LiveSession.findById(sessionId);
    if (!liveSession) return res.status(404).json({ message: 'Session not found or already archived' });

    // 1. Create History Record
    await Session.create({
      _id: liveSession._id,
      studentId: userId,
      teacherId: liveSession.teacherId,
      topic: liveSession.topic,
      startTime: liveSession.startTime,
      endTime: new Date(),
      durationMinutes: duration,
      ratePerMinute: liveSession.ratePerMinute,
      totalCost: totalCost,
      status: 'completed',
      interactionCount: Math.floor(duration * 4),
      completionPercentage: 100
    });

    // 2. Update Teacher Stats
    const teacher = await Teacher.findById(liveSession.teacherId);
    if (teacher) {
      teacher.totalSessions += 1;
      teacher.earnings += totalCost;

      const prevTotal = teacher.totalSessions - 1;
      const currentAvg = teacher.ratingAvg || 5;
      const newAvg = ((currentAvg * prevTotal) + rating) / teacher.totalSessions;
      teacher.ratingAvg = parseFloat(newAvg.toFixed(2));

      await teacher.save();
    }

    // 3. Remove from Live/Upcoming
    await LiveSession.findByIdAndDelete(sessionId);

    res.json({ success: true, message: "Session archived and review submitted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Review processing failed' });
  }
});



// --- Video Discovery API ---
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await VideoUrl.distinct('category');
    res.json(categories);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/videos/category/:category', async (req, res) => {
  try {
    const decoded = decodeURIComponent(req.params.category);
    const videos = await VideoUrl.find({ category: decoded });
    res.json(videos);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);
    const videos = await VideoUrl.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }).limit(5);
    res.json(videos);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// --- Smart AI Chat Endpoint ---
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: "Query required" });

    // 1. Search DB for Context (Basic RAG)
    const courses = await VideoUrl.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }).limit(5);

    // 2. Generate Response with Gemini
    const contextList = courses.map(c => `- ${c.title} (${c.category})`).join('\n');
    const prompt = `
        You are Murph AI, a friendly and knowledgeable educational concierge.
        
        User Query: "${query}"

        Here are the relevant video courses available in our database:
        ${contextList}

        Instructions:
        1. Answer the user's question directly.
        2. If the courses listed above are relevant, recommend them specifically.
        3. If no courses match, suggest a general learning path but mention we don't have a specific video for it yet.
        4. Keep the tone encouraging and concise.
        `;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    res.json({
      text: aiResponse,
      courses: courses // Send these back so frontend can render cards
    });

  } catch (e) {
    console.error("AI Error:", e);
    res.status(500).json({ message: "My brain is a bit foggy. Try again?" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

