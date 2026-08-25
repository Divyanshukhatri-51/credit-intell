const express = require('express');
const router = express.Router();
const companyRoutes = require('./companyRoutes');
const scoreRoutes = require('./scoreRoutes');
const dataRoutes = require('./dataRoutes');

// Mount routes
router.use('/companies', companyRoutes);
router.use('/scores', scoreRoutes);
router.use('/data', dataRoutes);

module.exports = router;