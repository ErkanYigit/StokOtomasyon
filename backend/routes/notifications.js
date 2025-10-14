const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// Bildirimleri getir
router.get('/', authenticateToken, notificationController.getUserNotifications);
// Bildirim oluştur (örnek amaçlı, genelde sistemden tetiklenir)
router.post('/', authenticateToken, notificationController.createNotification);
// Tek bildirimi okundu yap
router.patch('/:id/read', authenticateToken, notificationController.markAsRead);
// Tüm bildirimleri okundu yap
router.patch('/all/read', authenticateToken, notificationController.markAllAsRead);

module.exports = router; 