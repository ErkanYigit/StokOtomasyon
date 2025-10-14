
const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getOrderById, updateOrder, deleteOrder, getMonthlyOrderCount } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

// Tüm endpointler için auth
router.use(authenticateToken);

// Aylık sipariş sayısı
router.get('/aylik-sayi', getMonthlyOrderCount);

// Sipariş CRUD
router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

module.exports = router; 