const Production = require('../models/Production');

// Üretim oluştur
const createProduction = async (req, res) => {
  try {
    const production = new Production({
      ...req.body,
      olusturan: req.user._id,
      guncelleyen: req.user._id
    });
    await production.save();
    res.status(201).json({ success: true, data: production });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Üretim kaydı oluşturulamadı', error: err.message });
  }
};

// Tüm üretimleri getir
const getAllProductions = async (req, res) => {
  try {
    const productions = await Production.find().populate('siparis').sort({ createdAt: -1 });
    res.json({ success: true, data: productions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Üretimler getirilemedi' });
  }
};

// Tekil üretimi getir
const getProductionById = async (req, res) => {
  try {
    const production = await Production.findById(req.params.id).populate('siparis');
    if (!production) return res.status(404).json({ success: false, message: 'Üretim kaydı bulunamadı' });
    res.json({ success: true, data: production });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Üretim kaydı getirilemedi' });
  }
};

// Üretimi güncelle
const updateProduction = async (req, res) => {
  try {
    const production = await Production.findByIdAndUpdate(
      req.params.id,
      { ...req.body, guncelleyen: req.user._id },
      { new: true }
    );
    if (!production) return res.status(404).json({ success: false, message: 'Üretim kaydı bulunamadı' });
    res.json({ success: true, data: production });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Üretim kaydı güncellenemedi', error: err.message });
  }
};

// Üretimi sil
const deleteProduction = async (req, res) => {
  try {
    const production = await Production.findByIdAndDelete(req.params.id);
    if (!production) return res.status(404).json({ success: false, message: 'Üretim kaydı bulunamadı' });
    res.json({ success: true, message: 'Üretim kaydı silindi' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Üretim kaydı silinemedi' });
  }
};

module.exports = {
  createProduction,
  getAllProductions,
  getProductionById,
  updateProduction,
  deleteProduction
}; 