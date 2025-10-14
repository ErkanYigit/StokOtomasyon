const Order = require('../models/Order');

// Sipariş oluştur
const createOrder = async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      olusturan: req.user._id,
      guncelleyen: req.user._id
    });
    await order.save();
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Sipariş oluşturulamadı', error: err.message });
  }
};

// Tüm siparişleri getir
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Siparişler getirilemedi' });
  }
};

// Tekil siparişi getir
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sipariş getirilemedi' });
  }
};

// Siparişi güncelle
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { ...req.body, guncelleyen: req.user._id },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Sipariş güncellenemedi', error: err.message });
  }
};

// Siparişi sil
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
    res.json({ success: true, message: 'Sipariş silindi' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sipariş silinemedi' });
  }
};

// Belirli bir ayın sipariş sayısını getir
const getMonthlyOrderCount = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const count = await Order.countDocuments({
      siparisTarihi: { $gte: startOfMonth, $lte: endOfMonth }
    });
    res.json({ success: true, count });
  } catch (err) {
    console.error('Aylık sipariş sayısı hatası:', err.stack || err);
    res.status(500).json({ success: false, message: 'Aylık sipariş sayısı alınamadı', error: err.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getMonthlyOrderCount
}; 