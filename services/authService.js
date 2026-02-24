const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail, findUserById } = require('../repositories/userRepository');

const SALT_ROUNDS = 12;

const registerUser = async (name, email, password) => {
  // Check if email already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    error.code = 'EMAIL_EXISTS';
    throw error;
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user in database
  const userId = await createUser(name, email, passwordHash);

  // Sign JWT token
  const token = jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: { id: userId, name, email }
  };
};

const loginUser = async (email, password) => {
  // Find user by email
  const user = await findUserByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  // Compare password against stored hash
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  // Sign JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email }
  };
};

const getMe = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }
  return user;
};

module.exports = { registerUser, loginUser, getMe };