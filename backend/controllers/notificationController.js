const Notification = require('../models/Notification');

// Kullanıcıya ait son 10 bildirimi getir
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Bildirimler alınamadı.' });
  }
};

// Yeni bildirim oluştur
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    const notification = new Notification({ userId, title, message });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Bildirim oluşturulamadı.' });
  }
};

// Tek bir bildirimi okundu olarak işaretle
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Okundu olarak işaretlenemedi.' });
  }
};

// Kullanıcının tüm bildirimlerini okundu yap
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Tümünü okundu yaparken hata oluştu.' });
  }
}; 