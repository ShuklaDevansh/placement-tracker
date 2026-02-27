const pool = require('../config/db');

// GET ALL (with filters + pagination)
const getAllApplications = async (userId, {status, company,sort,page,limit}) => {
    let query = 'SELECT * FROM applications WHERE user_id = ?';
    const params = [userId]

    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }
    if (company) {
        query += ' AND company_name LIKE ?';
        params.push(`%${company}%`);
    }

    //Sorting
    const sortOptions = {
        date_desc: 'applied_date DESC',
        date_asc: 'applied_date ASC',
        company: 'company_name ASC',
        status: 'status ASC'
    };
    const orderBy = sortOptions[sort] || 'applied_date DESC';
    query += ` ORDER BY ${orderBy}`;

    //Pagination
    const pageNum  = parseInt(page)  || 1;
    const limitNum = parseInt(limit) || 20;
    const offset   = (pageNum - 1) * limitNum;
    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [rows] = await pool.query(query, params);
    return rows;
};

//COUNT (for pagination metadata)
const countApplications = async(userId, {status, company}) => {
    let query = 'SELECT COUNT(*) AS total FROM applications WHERE user_id = ?';
    const params = [userId];

    if (status){
        query += ' AND status = ?';
        params.push(status);
    }
    if (company){
        query += ' AND company_name LIKE ?';
        params.push(`%${company}%`);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
};

// GET ONE (ownership enforced at SQL level)
const getApplicationById = async (id, userId) =>{
    const [rows] = await pool.execute(
        'SELECT * FROM applications WHERE id = ? AND user_id = ?',
        [id, userId]
    );
    return rows[0] || null;
};

// CREATE
const createApplication = async (userId, { company_name, role_title, status, applied_date, source, salary_lpa, notes }) => {
  const [result] = await pool.execute(
    'INSERT INTO applications (user_id, company_name, role_title, status, applied_date, source, salary_lpa, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, company_name, role_title, status || 'Applied', applied_date, source || null, salary_lpa || null, notes || null]
  );
  return result.insertId;
};

// UPDATE
const updateApplication = async (id,userId, fields) => {
    const allowed = ['company_name', 'role_title', 'applied_date','source', 'salary_lpa', 'notes'];
    const updates = [];
    const params = [];

    for (const key of allowed){
        if (fields[key] !== undefined){
            updates.push(`${key} = ?`);
            params.push(fields[key]);
        }
    }

    if (updates.length === 0) return 0;

    params.push(id, userId);
    const [result] = await pool.query(
        `UPDATE applications SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, params
    );
    return result.affectedRows;
};

// DELETE
const deleteApplication = async (id,userId) => {
    const [result] = await pool.execute(
        'DELETE FROM applications WHERE id = ? AND user_id = ?',[id,userId]
    );
    return result.affectedRows;
};

//UPDATE STATUS
const updateStatus = async(id, userId, newStatus) => {
    const [result] = await pool.execute(
        'UPDATE applications SET status = ? WHERE id = ? AND user_id = ?',
        [newStatus, id , userId]
    );
    return result.affectedRows;
};

// INSERT STATUS HISTORY
const insertStatusHistory = async (applicationId, fromStatus, toStatus) => {
    await pool.execute(
        'INSERT INTO status_history (application_id , from_status, to_status) VALUES (?,?,?)',
        [applicationId,fromStatus || null, toStatus]
    );
};

// GET STATUS HISTORY
const getStatusHistory = async (applicationId) => {
    const [rows] = await pool.execute(
        'SELECT * FROM status_history WHERE application_id = ? ORDER BY changed_at ASC',
        [applicationId]
    );
    return rows;
};

module.exports = {
    getAllApplications,
    countApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication,
    updateStatus,
    insertStatusHistory,
    getStatusHistory

};