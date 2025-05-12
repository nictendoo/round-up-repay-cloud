const express = require('express');
const cors = require('cors');
const { admin } = require('./config/firebase');

// Initialize express app
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Verify Firebase token middleware
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// Public routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Protected routes (require authentication)
app.get('/api/user/profile', authenticateUser, async (req, res) => {
  try {
    const user = req.user;
    
    // Get additional user data from Firestore if needed
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    
    res.json({
      id: user.uid,
      email: user.email,
      name: user.name || userData.name,
      ...userData
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`MicroRepay API server running on port ${port}`);
}); 