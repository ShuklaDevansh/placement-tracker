 // Auth Check
if (!localStorage.getItem('token')) {
  window.location.href = '/login.html';
}

//  State 
let currentPage = 1;
let currentFilters = { status: '', company: '', sort: 'date_desc' };

// Element References 
const applicationsBody = document.getElementById('applicationsBody');
const tableContainer   = document.getElementById('tableContainer');
const emptyState       = document.getElementById('emptyState');
const loadingMsg       = document.getElementById('loadingMsg');
const errorMsg         = document.getElementById('errorMsg');
const paginationDiv    = document.getElementById('pagination');
const paginationInfo   = document.getElementById('paginationInfo');
const prevBtn          = document.getElementById('prevBtn');
const nextBtn          = document.getElementById('nextBtn');
const navUser          = document.getElementById('navUser');

// Show username in navbar 
const user = JSON.parse(localStorage.getItem('user') || '{}');
if (user.name) navUser.textContent = user.name;

//Status Badge Helper
const badgeClass = {
  Applied:   'bg-blue-900 text-blue-300',
  OA:        'bg-yellow-900 text-yellow-300',
  Interview: 'bg-purple-900 text-purple-300',
  Offer:     'bg-green-900 text-green-300',
  Rejected:  'bg-red-900 text-red-300'
};

const statusBadge = (status) =>
  `<span class="px-2 py-1 rounded text-xs font-medium ${badgeClass[status] || 'bg-gray-700 text-gray-300'}">${status}</span>`;

// Format Date
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

// Fetch and Render Applications 
const loadApplications = async () => {
  loadingMsg.classList.remove('hidden');
  tableContainer.classList.add('hidden');
  emptyState.classList.add('hidden');
  paginationDiv.classList.add('hidden');
  errorMsg.classList.add('hidden');

  try {
    const params = new URLSearchParams({
      page:  currentPage,
      limit: 20,
      sort:  currentFilters.sort,
      ...(currentFilters.status  && { status:  currentFilters.status }),
      ...(currentFilters.company && { company: currentFilters.company })
    });

    const res = await api.get(`/applications?${params}`);
    const { applications, total, totalPages } = res.data;

    loadingMsg.classList.add('hidden');

    if (applications.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    // Render rows
    applicationsBody.innerHTML = applications.map(app => `
      <tr class="border-b border-gray-800 hover:bg-gray-900">
        <td class="py-3 pr-4 font-medium text-gray-100">${app.company_name}</td>
        <td class="py-3 pr-4 text-gray-300">${app.role_title}</td>
        <td class="py-3 pr-4">${statusBadge(app.status)}</td>
        <td class="py-3 pr-4 text-gray-400">${formatDate(app.applied_date)}</td>
        <td class="py-3 pr-4 text-gray-400">${app.source || '—'}</td>
        <td class="py-3 pr-4">
          <div class="flex gap-3">
            <a href="/form.html?id=${app.id}"
              class="text-indigo-400 hover:text-indigo-300 text-xs">Edit</a>
            <button onclick="deleteApplication(${app.id})"
              class="text-red-400 hover:text-red-300 text-xs">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    tableContainer.classList.remove('hidden');

    // Pagination
    if (totalPages > 1) {
      paginationInfo.textContent = `Page ${currentPage} of ${totalPages} — ${total} total`;
      prevBtn.disabled = currentPage === 1;
      nextBtn.disabled = currentPage === totalPages;
      paginationDiv.classList.remove('hidden');
    }

  } catch (err) {
    loadingMsg.classList.add('hidden');
    errorMsg.textContent = err.message || 'Failed to load applications.';
    errorMsg.classList.remove('hidden');
  }
};

// Delete Application
const deleteApplication = async (id) => {
  const confirmed = window.confirm('Delete this application?');
  if (!confirmed) return;

  try {
    await api.delete(`/applications/${id}`);
    loadApplications();
  } catch (err) {
    errorMsg.textContent = err.message || 'Failed to delete.';
    errorMsg.classList.remove('hidden');
  }
};

// Filters
document.getElementById('applyFilters').addEventListener('click', () => {
  currentFilters.status  = document.getElementById('filterStatus').value;
  currentFilters.company = document.getElementById('filterCompany').value.trim();
  currentFilters.sort    = document.getElementById('filterSort').value;
  currentPage = 1;
  loadApplications();
});

// Pagination
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) { currentPage--; loadApplications(); }
});

nextBtn.addEventListener('click', () => {
  currentPage++;
  loadApplications();
});

//Export CSV
document.getElementById('exportCsvBtn').addEventListener('click', async () => {
  try {
    const token = localStorage.getItem('token');
    const res   = await fetch(`${BASE_URL}/applications/export/csv`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob  = await res.blob();
    const url   = window.URL.createObjectURL(blob);
    const a     = document.createElement('a');
    a.href      = url;
    a.download  = 'applications.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    errorMsg.textContent = 'Failed to export CSV.';
    errorMsg.classList.remove('hidden');
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
});

// Initial Load 
loadApplications();
