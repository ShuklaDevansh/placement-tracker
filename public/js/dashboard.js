 // ── Auth Check ────────────────────────────────────────────────
if (!localStorage.getItem('token')) {
  window.location.href = '/login.html';
}

// ── Element References ────────────────────────────────────────
const errorMsg    = document.getElementById('errorMsg');
const navUser     = document.getElementById('navUser');

// ── Show username in navbar ───────────────────────────────────
const user = JSON.parse(localStorage.getItem('user') || '{}');
if (user.name) navUser.textContent = user.name;

// ── Load Summary ──────────────────────────────────────────────
const loadSummary = async () => {
  try {
    const res  = await api.get('/dashboard/summary');
    const data = res.data;

    document.getElementById('statTotal').textContent        = data.total;
    document.getElementById('statApplied').textContent      = data.byStatus.Applied;
    document.getElementById('statOA').textContent           = data.byStatus.OA;
    document.getElementById('statInterview').textContent    = data.byStatus.Interview;
    document.getElementById('statOffer').textContent        = data.byStatus.Offer;
    document.getElementById('statRejected').textContent     = data.byStatus.Rejected;
    document.getElementById('statOfferRate').textContent    = data.offerRate;
    document.getElementById('statRejectionRate').textContent = data.rejectionRate;

  } catch (err) {
    errorMsg.textContent = err.message || 'Failed to load summary.';
    errorMsg.classList.remove('hidden');
  }
};

// ── Load Monthly Chart ────────────────────────────────────────
const loadChart = async () => {
  try {
    const res    = await api.get('/dashboard/monthly');
    const data   = res.data;

    document.getElementById('chartLoading').classList.add('hidden');
    const canvas = document.getElementById('monthlyChart');
    document.getElementById('chartWrapper').classList.remove('hidden');

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels:   data.map(d => d.month),
        datasets: [{
          label:           'Applications',
          data:            data.map(d => d.count),
          backgroundColor: '#4f46e5',
          borderRadius:    4,
          barThickness:    40
        }]
      },
      options: {
        animation:   false,
        responsive:  true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: { color: '#9ca3af' },
            grid:  { color: '#1f2937' }
          },
          y: {
            ticks: { color: '#9ca3af', stepSize: 1 },
            grid:  { color: '#1f2937' },
            beginAtZero: true
          }
        }
      }
    });

  } catch (err) {
    document.getElementById('chartLoading').textContent = 'Failed to load chart.';
  }
};

// ── Logout ────────────────────────────────────────────────────
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
});

// ── Init ──────────────────────────────────────────────────────
loadSummary();
loadChart();
