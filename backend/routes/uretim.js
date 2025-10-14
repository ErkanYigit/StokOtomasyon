const express = require('express');
const router = express.Router();
const { createProduction, getAllProductions, getProductionById, updateProduction, deleteProduction } = require('../controllers/productionController');
const { authenticateToken } = require('../middleware/auth');

// Tüm endpointler için auth
router.use(authenticateToken);

// Üretim CRUD
router.post('/', createProduction);
router.get('/', getAllProductions);
router.get('/:id', getProductionById);
router.put('/:id', updateProduction);
router.delete('/:id', deleteProduction);

module.exports = router; 