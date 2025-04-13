import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
     const user = await User.create({ email, password });
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const initTestUser = async () => {
  const testEmail = 'intern@dacoid.com';
  const testUser = await User.findOne({ email: testEmail });
  
  if (!testUser) {
    await User.create({
      email: testEmail,
      password: await bcrypt.hash('Test123', 10)
    });
    console.log('Test user created');
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Call this during server startup
initTestUser();