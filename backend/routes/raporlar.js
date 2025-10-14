const express = require('express');
const router = express.Router();
const raporlarController = require('../controllers/raporlarController');

// TODO: Rapor route'ları buraya eklenecek
router.get('/', (req, res) => {
    res.json({ message: 'Rapor route\'ları henüz implement edilmedi' });
});

router.get('/bugun', raporlarController.getBugunRaporu);

module.exports = router; 