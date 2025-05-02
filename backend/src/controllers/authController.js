import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, school_id } = req.body;
  
  // Check if user already exists
  const userExists = await User.findOne({ email });
  
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  
  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'trustee',
    school_id: role === 'school_admin' ? school_id : undefined
  });
  
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      school_id: user.school_id,
      token: generateToken(user._id)
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * Authenticate user & get token
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Find user by email
  const user = await User.findOne({ email });
  
  // Check if user exists and password is correct
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      school_id: user.school_id,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/**
 * Get user profile
 * @route GET /api/auth/profile
 * @access Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      school_id: user.school_id
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});