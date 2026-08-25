const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Add financial data
router.post('/:companyId', dataController.addFinancialData);

// Get financial data
router.get('/:companyId', dataController.getFinancialData);

// Bulk upload
router.post('/bulk/upload', dataController.bulkUploadFinancialData);

module.exports = router;