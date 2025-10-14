const express = require('express');
const router = express.Router();

// TODO: Fiyatlandırma route'ları buraya eklenecek
router.get('/', (req, res) => {
    res.json({ message: 'Fiyatlandırma route\'ları henüz implement edilmedi' });
});

module.exports = router; 