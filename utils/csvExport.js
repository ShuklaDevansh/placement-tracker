const generateCSV = (applications) => {
  if (applications.length === 0) return '';

  const headers = [
    'ID', 'Company', 'Role', 'Status',
    'Applied Date', 'Source', 'Salary LPA', 'Notes', 'Created At'
  ];

  const rows = applications.map(app => [
    app.id,
    `"${(app.company_name || '').replace(/"/g, '""')}"`,
    `"${(app.role_title   || '').replace(/"/g, '""')}"`,
    app.status,
    app.applied_date ? app.applied_date.toISOString().split('T')[0] : '',
    `"${(app.source || '').replace(/"/g, '""')}"`,
    app.salary_lpa || '',
    `"${(app.notes  || '').replace(/"/g, '""')}"`,
    app.created_at ? app.created_at.toISOString().split('T')[0] : ''
  ]);

  const csvLines = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ];

  return csvLines.join('\n');
};

module.exports = { generateCSV };