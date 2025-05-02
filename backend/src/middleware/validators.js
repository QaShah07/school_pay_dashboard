import { body, validationResult } from 'express-validator';

// Middleware to handle validation errors
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for user registration
export const validateRegistration = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  validateRequest
];

// Validation rules for user login
export const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
];

// Validation rules for payment creation
export const validatePaymentCreation = [
  body('school_id').notEmpty().withMessage('School ID is required'),
  body('trustee_id').notEmpty().withMessage('Trustee ID is required'),
  body('student_info.name').notEmpty().withMessage('Student name is required'),
  body('student_info.id').notEmpty().withMessage('Student ID is required'),
  body('student_info.email').isEmail().withMessage('Valid student email is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('gateway_name').notEmpty().withMessage('Gateway name is required'),
  validateRequest
];