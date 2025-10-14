const express = require('express');
const router = express.Router();
const { createMovement, getMovements } = require('../controllers/movementController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, createMovement);
router.get('/', authenticateToken, getMovements);

module.exports = router; 