const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/auth');
const {
  validateCreateApplication,
  validateUpdateApplication,
  validateStatusUpdate
} = require('../validators/applicationValidator');
const {
  listApplications,
  getApplication,
  addApplication,
  editApplication,
  removeApplication,
  changeStatus,
  listStatusHistory
} = require('../services/applicationService');

// Apply JWT auth to ALL routes in this file
router.use(authenticate);

// GET ALL /api/applications 
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      status:  req.query.status,
      company: req.query.company,
      sort:    req.query.sort,
      page:    req.query.page,
      limit:   req.query.limit
    };
    const result = await listApplications(req.user.id, filters);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

//POST /api/applications 
router.post('/', validateCreateApplication, async (req, res, next) => {
  try {
    const application = await addApplication(req.user.id, req.body);
    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
});

// GET ONE /api/applications/:id 
router.get('/:id', async (req, res, next) => {
  try {
    const application = await getApplication(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
});

// PUT /api/applications/:id 
router.put('/:id', validateUpdateApplication, async (req, res, next) => {
  try {
    const application = await editApplication(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/applications/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await removeApplication(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: { message: 'Application deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

//PATCH /api/applications/:id/status 
router.patch('/:id/status', validateStatusUpdate, async (req, res, next) => {
  try {
    const application = await changeStatus(req.params.id, req.user.id, req.body.status);
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
});

// GET /api/applications/:id/history 
router.get('/:id/history', async (req, res, next) => {
  try {
    const history = await listStatusHistory(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
