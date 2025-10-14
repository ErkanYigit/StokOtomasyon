const express = require('express');
const router = express.Router();
const Calisan = require('../models/Calisan');
const Notification = require('../models/Notification');

// Tüm aktif işçiler
router.get('/', async (req, res) => {
  try {
    const calisanlar = await Calisan.find({ isAktif: true });
    res.json(calisanlar);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Tek işçi (detay)
router.get('/:id', async (req, res) => {
  try {
    const calisan = await Calisan.findById(req.params.id);
    if (!calisan) return res.status(404).json({ error: 'İşçi bulunamadı' });
    res.json(calisan);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yeni işçi ekle
router.post('/', async (req, res) => {
  try {
    const yeni = new Calisan(req.body);
    await yeni.save();
    res.status(201).json(yeni);
  } catch (err) {
    res.status(400).json({ error: 'Geçersiz veri', detail: err.message });
  }
});

// İşçi güncelle
router.put('/:id', async (req, res) => {
  try {
    const eski = await Calisan.findById(req.params.id);
    const guncel = await Calisan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!guncel) return res.status(404).json({ error: 'İşçi bulunamadı' });
    // Maaş değiştiyse bildirim oluştur
    if (eski && req.body.maas && req.body.maas !== eski.maas) {
      await Notification.create({
        userId: guncel._id,
        title: 'Maaş Güncellemesi',
        message: `Maaşınız ${eski.maas}₺'den ${req.body.maas}₺'ye güncellendi.`,
      });
    }
    res.json(guncel);
  } catch (err) {
    res.status(400).json({ error: 'Güncelleme hatası', detail: err.message });
  }
});

// Soft delete veya hard delete (işten ayrıldı veya tamamen sil)
router.delete('/:id', async (req, res) => {
  try {
    if (req.query.hard === 'true') {
      const silinen = await Calisan.findByIdAndDelete(req.params.id);
      if (!silinen) return res.status(404).json({ error: 'İşçi bulunamadı' });
      return res.json({ success: true, hard: true });
    } else {
      const silinen = await Calisan.findByIdAndUpdate(req.params.id, { isAktif: false }, { new: true });
      if (!silinen) return res.status(404).json({ error: 'İşçi bulunamadı' });
      return res.json({ success: true, hard: false });
    }
  } catch (err) {
    res.status(400).json({ error: 'Silme hatası', detail: err.message });
  }
});

module.exports = router; 