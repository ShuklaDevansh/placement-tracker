// Auth Check 
if (!localStorage.getItem('token')) {
  window.location.href = '/login.html';
}

// Detect Mode (add vs edit) 
const params = new URLSearchParams(window.location.search);
const editId = params.get('id');
const isEdit = !!editId;

//  Element References 
const formTitle  = document.getElementById('formTitle');
const submitBtn  = document.getElementById('submitBtn');
const errorMsg   = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');

//  Update UI for edit mode 
if (isEdit) {
  formTitle.textContent = 'Edit Application';
  submitBtn.textContent = 'Save Changes';
}

// Helper Functions
const showError = (msg) => {
  errorMsg.textContent = msg;
  errorMsg.classList.remove('hidden');
  successMsg.classList.add('hidden');
};

const showSuccess = (msg) => {
  successMsg.textContent = msg;
  successMsg.classList.remove('hidden');
  errorMsg.classList.add('hidden');
};

// Prefill form for edit mode
const prefillForm = async () => {
  try {
    const res = await api.get(`/applications/${editId}`);
    const app = res.data;

    document.getElementById('company_name').value = app.company_name || '';
    document.getElementById('role_title').value   = app.role_title   || '';
    document.getElementById('applied_date').value = app.applied_date
      ? app.applied_date.split('T')[0] : '';
    const statusEl = document.getElementById('status');
    statusEl.value = app.status || 'Applied';
    statusEl.dataset.original = app.status || 'Applied';
    document.getElementById('source').value     = app.source     || '';
    document.getElementById('salary_lpa').value = app.salary_lpa || '';
    document.getElementById('notes').value      = app.notes      || '';
  } catch (err) {
    showError('Failed to load application data.');
  }
};

if (isEdit) prefillForm();

// Form Submit
document.getElementById('applicationForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const body = {
    company_name: document.getElementById('company_name').value.trim(),
    role_title:   document.getElementById('role_title').value.trim(),
    applied_date: document.getElementById('applied_date').value,
    status:       document.getElementById('status').value,
    source:       document.getElementById('source').value.trim() || null,
    salary_lpa:   document.getElementById('salary_lpa').value
                    ? parseFloat(document.getElementById('salary_lpa').value) : null,
    notes:        document.getElementById('notes').value.trim() || null
  };

  if (!body.company_name || !body.role_title || !body.applied_date) {
    showError('Company name, role title and applied date are required.');
    return;
  }

  try {
    if (isEdit) {
      const originalStatus = document.getElementById('status').dataset.original;
      const newStatus      = body.status;

      if (originalStatus && originalStatus !== newStatus) {
        await api.patch(`/applications/${editId}/status`, { status: newStatus });
      }

      delete body.status;
      await api.put(`/applications/${editId}`, body);
      showSuccess('Application updated successfully.');
    } else {
      await api.post('/applications', body);
      showSuccess('Application added successfully.');
      document.getElementById('applicationForm').reset();
    }

    setTimeout(() => {
      window.location.href = '/applications.html';
    }, 800);

  } catch (err) {
    if (err.details && err.details.length > 0) {
      showError(err.details.map(d => d.message).join(', '));
    } else {
      showError(err.message || 'Something went wrong.');
    }
  }
});

//  Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
});