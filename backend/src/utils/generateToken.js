import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for authentication
 * @param {String} id User ID to encode in the token
 * @returns {String} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '7d'
  });
};

export default generateToken;