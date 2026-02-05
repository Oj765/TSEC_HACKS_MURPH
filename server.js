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
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:3000', 'http://127.0.0.1:3000',
      'http://localhost:3001', 'http://127.0.0.1:3001',
      'http://localhost:5173', 'http://127.0.0.1:5173'
    ],
    credentials: true,
  })
);

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

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
      // userId in Transaction is Type String (to support custom IDs). 
      // Do NOT convert to ObjectId, even if it looks like one.
      const matchUserId = id;

      // Aggregate Earnings from SESSIONS (Historical Data)
      // This ensures the chart matches the "Past Sessions" table.
      // Aggregate Earnings from SESSIONS (Historical Data)
      // This ensures the chart matches the "Past Sessions" table.

      earningsData = await Session.aggregate([
        {
          $match: {
            teacherId: matchUserId,
            status: 'completed',
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
            amount: { $sum: '$totalCost' },
          },
        },
        {
          $project: {
            _id: 0,
            name: '$_id',
            amount: 1,
          },
        },
        { $sort: { name: 1 } } // Sort by date ascending
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
// --- FINTERNET PAYMENT GATEWAY ---
const FINTERNET_API_KEY = process.env.FINTERNET_API_KEY;
const FINTERNET_API_URL = 'https://api.fmm.finternetlab.io/api/v1/payment-intents';

app.post('/api/wallet/topup', async (req, res) => {
  try {
    const { userId, userModel = 'Student', amount } = req.body;

    if (!userId || !amount || isNaN(amount)) {
      return res.status(400).json({ message: 'Invalid userId or amount' });
    }

    console.log(`[Wallet] Top-up Intent → User: ${userId}, Amount: ${amount}`);
    console.log(`[Finternet] Key Status: ${FINTERNET_API_KEY ? 'Loaded' : 'MISSING'}`);

    // 1. Create Finternet Payment Intent
    const payload = {
      amount: parseFloat(amount).toFixed(2),
      currency: 'USD',                          // Changed to USD to match Fiat Postman collection
      type: 'DELIVERY_VS_PAYMENT',              // Changed to match Postman
      settlementMethod: 'OFF_RAMP_MOCK',
      settlementDestination: 'bank_account_123',
      description: `Topup for ${userId}`
    };

    console.log('[Finternet] Endpoint:', FINTERNET_API_URL);
    console.log('[Finternet] Payload:', payload);

    let paymentUrl, intentId;

    try {
      const paymentRes = await fetch(FINTERNET_API_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': FINTERNET_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const rawText = await paymentRes.text();
      // console.log('[Finternet] Response:', rawText);

      if (!paymentRes.ok) {
        throw new Error(`Gateway Error ${paymentRes.status}: ${rawText}`);
      }

      const gatewayData = JSON.parse(rawText);
      intentId = gatewayData.id;
      // Construct payment URL if not in response data
      paymentUrl = gatewayData.data?.paymentUrl || `https://pay.fmm.finternetlab.io/?intent=${intentId}`;

      console.log('[Finternet] Intent Created:', intentId);
      console.log('[Finternet] Status:', gatewayData.status);

    } catch (gatewayErr) {
      console.error(`[Finternet] Gateway Failed: ${gatewayErr.message}`);
      return res.status(502).json({
        message: `Finternet Gateway Error: ${gatewayErr.message}`
      });
    }

    // 2. Respond
    res.json({
      success: true,
      action: 'redirect',
      paymentUrl,
      intentId,
      originalAmount: parseFloat(amount)
    });

  } catch (err) {
    console.error('[Wallet] Top-up Error:', err);
    res.status(500).json({ message: 'Payment initiation failed' });
  }
});

// --- CONFIRMATION ENDPOINT (Called after user pays) ---
app.post('/api/wallet/confirm', async (req, res) => {
  try {
    const { userId, userModel = 'Student', intentId, amount } = req.body;

    console.log(`[Wallet] Confirming Payment: ${intentId} for $${amount}`);

    // Verify Finternet Status (unless Mock)
    let isConfirmed = false;

    if (intentId && intentId.startsWith('intent_mock_')) {
      console.log("[Wallet] Mock Payment Confirmed instantly.");
      isConfirmed = true;
    } else {
      try {
        const checkRes = await fetch(`${FINTERNET_API_URL}/${intentId}`, {
          method: 'GET',
          headers: { 'X-API-Key': FINTERNET_API_KEY }
        });

        if (!checkRes.ok) {
          throw new Error(`Status check failed: ${checkRes.status}`);
        }

        const checkData = await checkRes.json();
        console.log(`[Finternet] Status for ${intentId}: ${checkData.status}`);

        // Create a broad list of "Success" states based on user feedback
        // For Hackathon/Demo: We accept processing/initiated if the user manually confirms
        // to prevent getting stuck if the gateway callback is slow.
        const validStatuses = [
          'SUCCEEDED', 'SETTLED', 'COMPLETED',
          'DELIVERED', 'AWAITING_SETTLEMENT',
          'INITIATED', 'PROCESSING', 'PENDING'
        ];

        if (validStatuses.includes(checkData.status)) {
          isConfirmed = true;
        } else {
          // If strict check fails, check if we are in expected "delivery" state for DvP, 
          // but for off-ramp mock, it usually goes to SUCCEEDED.
          // Fallback: If status is INITIATED but user claims success, we might need manual check.
          return res.status(400).json({ message: `Payment not completed. Status: ${checkData.status}`, status: checkData.status });
        }

      } catch (checkErr) {
        console.warn(`[Finternet] Verification failed: ${checkErr.message}.`);
        // Fallback for Hackathon: If API is blocked/down, we might auto-confirm if user insists
        // But for "Gateway Logic", we should return error.
        return res.status(502).json({ message: 'Could not verify payment status with gateway.' });
      }
    }

    if (!isConfirmed) return res.status(400).json({ message: 'Payment verification failed' });

    // 1. Load User
    const user = userModel === 'Teacher'
      ? await Teacher.findById(userId)
      : await Student.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Credit Wallet
    // Prevent double crediting: Check if transaction exists
    const existingTx = await Transaction.findOne({ referenceId: intentId });
    if (existingTx) {
      return res.json({ success: true, message: 'Already credited', walletBalance: user.walletBalance });
    }

    user.walletBalance += parseFloat(amount);
    await user.save();

    // 3. Record Transaction
    await Transaction.create({
      userId,
      userModel: userModel,
      amount: parseFloat(amount),
      type: 'credit',
      status: 'completed',
      gateway: 'FINTERNET',
      referenceId: intentId,
      description: `Wallet top-up (Confirmed)`,
    });

    console.log(`[Wallet] Credited $${amount} to ${userId}`);

    res.json({
      success: true,
      walletBalance: user.walletBalance
    });

  } catch (err) {
    console.error('[Wallet] Confirmation Error:', err);
    res.status(500).json({ message: 'Confirmation failed' });
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

      // Record Earning Transaction for Analytics
      await Transaction.create({
        userId: liveSession.teacherId,
        userModel: 'Teacher',
        amount: totalCost,
        type: 'credit',
        status: 'completed',
        sessionId: sessionId,
        description: `Session earning: ${liveSession.topic}`
      });
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

    // 0. Smart Keyword Extraction (handle "suggest history courses" -> "History")
    let searchKey = query;
    try {
      const extractionResult = await model.generateContent({
        contents: [{
          role: "user", parts: [{
            text:
              `Extract the main subject or topic from this user query for a database search. 
            Query: "${query}"
            Return ONLY the raw keyword (e.g., "History", "Physics", "React"). Do not add quotes or extra text.
            If the query is greeting or vague (e.g., "Hi", "help"), return "General".`
          }]
        }]
      });
      searchKey = extractionResult.response.text().trim();
      // Fallback if AI gives a sentence
      if (searchKey.length > 20) searchKey = query;
      console.log(`[AI Chat] Extracted key: "${searchKey}" from "${query}"`);
    } catch (err) {
      console.warn("[AI Chat] Keyword extraction failed, using raw query.");
    }

    // Skip DB search for purely conversational input
    const isConversational = ["General", "Hi", "Hello", "Hey"].includes(searchKey);

    // 1. Search DBs in Parallel ONLY if we have a valid topic
    let sessions = [], videoCourses = [];

    if (!isConversational) {
      [sessions, videoCourses] = await Promise.all([
        LiveSession.find({
          $or: [
            { topic: { $regex: searchKey, $options: 'i' } },
            { description: { $regex: searchKey, $options: 'i' } }
          ],
          status: { $in: ['scheduled', 'live'] }
        })
          .populate('teacherId', 'name subjects')
          .sort({ startTime: 1 })
          .limit(3),

        VideoUrl.find({
          $or: [
            { title: { $regex: searchKey, $options: 'i' } },
            { category: { $regex: searchKey, $options: 'i' } }
          ]
        }).limit(3)
      ]);
    }

    // 2. Prepare Context for Gemini
    const sessionContext = sessions.map(s => {
      const teacherName = s.teacherId?.name || 'Unknown Teacher';
      const time = new Date(s.startTime).toLocaleString();
      return `- [LIVE] "${s.topic}" with ${teacherName} ($${s.ratePerMinute}/min) at ${time}`;
    }).join('\n');

    const videoContext = videoCourses.map(v => {
      return `- [VIDEO] "${v.title}" (${v.category})`;
    }).join('\n');

    const fullContext = `
    LIVE SESSIONS:
    ${sessionContext || "(None)"}

    VIDEO COURSES:
    ${videoContext || "(None)"}
    `;

    const prompt = `
        You are Murph AI, a friendly and knowledgeable educational concierge.
        
        User Query: "${query}"

        Here are the relevant learning resources we found:
        ${fullContext}

        Instructions:
        1. Answer the user's question directly.
        2. Recommend SPECIFIC resources found above. 
           - If it's a LIVE session, emphasize the teacher and time.
           - If it's a VIDEO course, mention it's available anytime.
        3. If NO matches found in either, apologize and suggest general advice.
        4. Keep the tone encouraging and concise.
        5. You MUST output your response in JSON format with a single key "answer".
        `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    let aiResponse;
    try {
      const jsonResponse = JSON.parse(result.response.text());
      aiResponse = jsonResponse.answer;
    } catch (parseError) {
      console.warn("Failed to parse JSON from Gemini, using raw text", parseError);
      aiResponse = result.response.text();
    }

    // Merge for Frontend Card Display
    const formattedSessions = sessions.map(s => ({
      _id: s._id,
      title: "[LIVE] " + s.topic,
      category: s.teacherId?.name ? `with ${s.teacherId.name}` : 'Live Session',
      isLive: true
    }));

    const formattedVideos = videoCourses.map(v => ({
      _id: v._id,
      title: "[VIDEO] " + v.title,
      category: v.category,
      isLive: false,
      thumbnail: v.thumbnail,
      videoUrl: v.lectures?.[0]?.videoUrl // Send first lecture for quick play
    }));

    res.json({
      text: aiResponse,
      courses: [...formattedSessions, ...formattedVideos]
    });



  } catch (e) {
    console.error("AI Error:", e);
    res.status(500).json({ message: "My brain is a bit foggy. Try again?" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

