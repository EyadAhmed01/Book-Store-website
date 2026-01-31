const bcrypt = require('bcrypt');
const userStorage = require('../services/userStorage');
const { generateToken } = require('../utils/jwt');

// Sign up new customer
const signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, address } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await userStorage.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      address,
      userType: 'CUSTOMER'
    });

    const token = generateToken({ userId: newUser.user_id, email, userType: 'CUSTOMER' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        userId: newUser.user_id,
        email,
        userType: 'CUSTOMER'
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.message === 'Email already exists') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = userStorage.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ userId: user.user_id, email: user.email, userType: user.user_type });

    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.user_id,
        email: user.email,
        userType: user.user_type
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { firstName, lastName, email, phone, address, password } = req.body;

    const updates = {};

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updatedUser = userStorage.updateUser(userId, updates);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const user = userStorage.findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

module.exports = {
  signup,
  login,
  updateProfile,
  getProfile
};
