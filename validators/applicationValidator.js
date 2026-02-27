const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req,res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

const VALID_STATUSES = ['Applied', 'OA', 'Interview', 'Offer', 'Rejected'];

// CREATE VALIDATION
const validateCreateApplication = [
  body('company_name')
    .trim()
    .notEmpty().withMessage('Company name is required')
    .isLength({ max: 150 }).withMessage('Company name must be under 150 characters'),

  body('role_title')
    .trim()
    .notEmpty().withMessage('Role title is required')
    .isLength({ max: 150 }).withMessage('Role title must be under 150 characters'),

  body('applied_date')
    .notEmpty().withMessage('Applied date is required')
    .isDate().withMessage('Applied date must be a valid date (YYYY-MM-DD)'),

  body('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  body('source')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Source must be under 100 characters'),

  body('salary_lpa')
    .optional()
    .isFloat({ min: 0 }).withMessage('Salary must be a positive number'),

  body('notes')
    .optional()
    .trim(),

  handleValidationErrors
];

// UPDATE VALIDATION
const validateUpdateApplication = [
  body('company_name')
    .optional()
    .trim()
    .notEmpty().withMessage('Company name cannot be empty')
    .isLength({ max: 150 }).withMessage('Company name must be under 150 characters'),

  body('role_title')
    .optional()
    .trim()
    .notEmpty().withMessage('Role title cannot be empty')
    .isLength({ max: 150 }).withMessage('Role title must be under 150 characters'),

  body('applied_date')
    .optional()
    .isDate().withMessage('Applied date must be a valid date (YYYY-MM-DD)'),

  body('source')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Source must be under 100 characters'),

  body('salary_lpa')
    .optional()
    .isFloat({ min: 0 }).withMessage('Salary must be a positive number'),

  body('notes')
    .optional()
    .trim(),

  handleValidationErrors
];

// STATUS VALIDATION
const validateStatusUpdate = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  handleValidationErrors
];

module.exports = {
  validateCreateApplication,
  validateUpdateApplication,
  validateStatusUpdate
};