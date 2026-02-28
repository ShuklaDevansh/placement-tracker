const express    = require('express');
const router     = express.Router();
const authenticate = require('../middleware/auth');
const { getSummary, getMonthly } = require('../services/dashboardService');

router.use(authenticate);

// GET /api/dashboard/summary
router.get('/summary', async (req, res, next) => {
  try {
    const data = await getSummary(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/monthly
router.get('/monthly', async (req, res, next) => {
  try {
    const data = await getMonthly(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;