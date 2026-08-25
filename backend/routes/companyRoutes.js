const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// Get all companies
router.get('/', companyController.getAllCompanies);

// Get company by slug
router.get('/:slug', companyController.getCompanyBySlug);

// Create company
router.post('/', companyController.createCompany);

// Seed Suzlon
router.post('/seed/suzlon', companyController.seedSuzlon);

module.exports = router;