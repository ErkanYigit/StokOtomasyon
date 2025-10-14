const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (token gerektirmeyen)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (token gerektiren)
router.get('/me', authenticateToken, (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Kullanıcı bulunamadı' });
  res.json({ success: true, data: req.user });
});
router.put('/change-password', authenticateToken, authController.changePassword);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router; 