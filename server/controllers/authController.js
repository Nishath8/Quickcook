const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verify the Google JWT token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture: avatar } = payload;

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
