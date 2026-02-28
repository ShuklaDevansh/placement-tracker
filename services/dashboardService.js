const {
  getDashboardSummary,
  getMonthlyApplications
} = require('../repositories/applicationRepository');

// SUMMARY
const getSummary = async (userId) => {
  const data = await getDashboardSummary(userId);

  const total    = parseInt(data.total)     || 0;
  const offer    = parseInt(data.offer)     || 0;
  const rejected = parseInt(data.rejected)  || 0;

  const offerRate     = total > 0 ? ((offer / total) * 100).toFixed(1) : '0.0';
  const rejectionRate = total > 0 ? ((rejected / total) * 100).toFixed(1) : '0.0';

  return {
    total,
    byStatus: {
      Applied:  parseInt(data.applied)   || 0,
      OA:       parseInt(data.oa)        || 0,
      Interview:parseInt(data.interview) || 0,
      Offer:    offer,
      Rejected: rejected
    },
    offerRate:     `${offerRate}%`,
    rejectionRate: `${rejectionRate}%`
  };
};

// MONTHLY
const getMonthly = async (userId) => {
  const rows = await getMonthlyApplications(userId);
  return rows.map(row => ({
    month: row.month,
    count: parseInt(row.count)
  }));
};

module.exports = { getSummary, getMonthly };