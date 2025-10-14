const express = require('express');
const router = express.Router();
const stokController = require('../controllers/stokController');
const { authenticateToken } = require('../middleware/auth');

// Tüm route'lar için authentication gerekli
router.use(authenticateToken);

// Stok listesi ve istatistikler (depocu ve üzeri)
router.get('/', stokController.getAllStoklar);
router.get('/istatistikler', stokController.getStokIstatistikleri);
router.get('/kritik', stokController.getKritikStoklar);

// Tekil stok işlemleri (depocu ve üzeri)
router.get('/:id', stokController.getStokById);

// Stok oluşturma (sadece depocu ve yönetici)
router.post('/', stokController.createStok);

// Stok güncelleme (sadece depocu ve yönetici)
router.put('/:id', stokController.updateStok);

// Stok silme (sadece yönetici)
router.delete('/:id', stokController.deleteStok);

// Stok miktar işlemleri (depocu ve üzeri)
router.post('/:id/ekle', stokController.stokEkle);
router.post('/:id/cikar', stokController.stokCikar);

module.exports = router; 