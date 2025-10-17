const express = require('express');
const router = express.Router();
const { createMovement, getMovements, deleteAllMovements } = require('../controllers/movementController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, createMovement);
router.get('/', authenticateToken, getMovements);
router.delete('/', authenticateToken, deleteAllMovements);

module.exports = router; 