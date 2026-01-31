const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
const dataDir = path.dirname(USERS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load users from file
const loadUsers = () => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  return [];
};

// Save users to file
const saveUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// Get all users
const getUsers = () => {
  return loadUsers();
};

// Find user by email
const findUserByEmail = (email) => {
  const users = loadUsers();
  return users.find(user => user.email === email);
};

// Find user by ID
const findUserById = (userId) => {
  const users = loadUsers();
  return users.find(user => user.user_id === userId);
};

// Create new user
const createUser = async (userData) => {
  const users = loadUsers();
  
  // Check if email already exists
  if (findUserByEmail(userData.email)) {
    throw new Error('Email already exists');
  }

  // Generate new user ID
  const maxId = users.length > 0 ? Math.max(...users.map(u => u.user_id)) : 0;
  const newUserId = maxId + 1;

  const newUser = {
    user_id: newUserId,
    email: userData.email,
    password: userData.password, // Already hashed
    first_name: userData.firstName,
    last_name: userData.lastName,
    phone: userData.phone,
    address: userData.address,
    user_type: userData.userType || 'CUSTOMER',
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  return newUser;
};

// Update user
const updateUser = (userId, updates) => {
  const users = loadUsers();
  const userIndex = users.findIndex(user => user.user_id === userId);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Update user fields
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      // Map frontend field names to database field names
      const dbKey = key === 'firstName' ? 'first_name' :
                     key === 'lastName' ? 'last_name' :
                     key;
      users[userIndex][dbKey] = updates[key];
    }
  });

  saveUsers(users);
  return users[userIndex];
};

module.exports = {
  getUsers,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser
};
