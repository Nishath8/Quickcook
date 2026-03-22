const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    
// Verify the Google JWT token or Access Token
    let googleId, email, name, avatar;

    if (req.body.credential) {
      const ticket = await client.verifyIdToken({
        idToken: req.body.credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      avatar = payload.picture;
    } else if (req.body.access_token) {
      const axios = require('axios');
      const resp = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${req.body.access_token}` }
      });
      googleId = resp.data.sub;
      email = resp.data.email;
      name = resp.data.name;
      avatar = resp.data.picture;
    } else {
      return res.status(400).json({ message: 'No Google token provided.' });
    }

    // Find or create the user
    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ googleId, email, name, avatar });
      await user.save();
    }

    // Generate our own session JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        contactedCooks: user.contactedCooks
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Authentication failed. Invalid Google token.' });
  }
};

module.exports = {
  googleLogin
};
