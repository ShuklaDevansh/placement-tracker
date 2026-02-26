const {
    getAllApplications,
    countApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication,
    updateStatus,
    insertStatusHistory,
    getStatusHistory
} = require('../repositories/applicationRepository');

const VALID_STATUSES = ['Applied', 'OA', 'Interview', 'Offer','Rejected'];

// GET ALL
const listApplications = async (userId, filters) => {
    const [rows, total] = await Promise.all([
        getAllApplications(userId, filters),
        countApplications(userId, filters)
    ]);

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const totalPages = Math.ceil(total / limit);

    return { applications: rows, total , page, totalPages};
};

// GET ONE
const getApplication = async (id , userId) => {
    const application = await getApplicationById(id , userId);
    if(!application) {
        const error = new Error('Application not found');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
    }
    return application;
};

// CREATE
const addApplication = async (userId ,data) => {
    const id = await createApplication(userId, data);
    const application = await getApplicationById(id, userId);

    // Log initial status to history
    await insertStatusHistory(id, null, application.status);
    return application;
};

// UPDATE
const editApplication = async (id, userId, fields ) => {
    const existing = await getApplicationById(id, userId);
    if (!existing) {
        const error = new Error('Applications not found');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
    }

    const affectedRows = await updateApplication(id, userId, fields);
    if (affectedRows === 0){
        const error = new Error('No valid fields provided to update');
        error.statusCode = 400;
        error.code = 'NO_FIELDS';
        throw error;
    }
    return await getApplicationById(id, userId);
};

// DELETE
const removeApplication = async(id ,userId) => {
    const existing = await getApplicationById(id, userId);
    if (!existing) {
        const error = new Error('Application not found');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
    }
    await deleteApplication(id,userId);
};

// PATCH STATUS
const changeStatus = async (id,userId,newStatus) => {
    if (!VALID_STATUSES.includes(newStatus)){
        const error = new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
        error.statusCode = 400;
        error.code = 'INVALID_STATUS';
        throw error;
    }

    const existing = await getApplicationById(id, userId);
    if (!existing) {
        const error = new Error('Application not found');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
    }

    const oldStatus = existing.status;

    if (oldStatus === newStatus) {
        const error = new Error('Application is already in this status');
        error.statusCode = 400;
        error.code = 'SAME_STATUS';
        throw error;
    }

    await updateStatus(id, userId, newStatus);
    await insertStatusHistory(id, oldStatus, newStatus);

    return await getApplicationById(id, userId);
};

// GET HISTORY
const listStatusHistory = async (id, userId) => {
    const existing = await getApplicationById(id, userId);
    if (!existing) {
        const error = new Error('Application not found');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
    }
    return await getStatusHistory(id);
};

module.exports = {
    listApplications,
    getApplication,
    addApplication,
    editApplication,
    removeApplication,
    changeStatus,
    listStatusHistory
};