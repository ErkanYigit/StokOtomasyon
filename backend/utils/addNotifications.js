const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/koltuk-otomasyon';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const user = await User.findOne();
  if (!user) {
    console.log('Kullanıcı bulunamadı!');
    process.exit(1);
  }
  const notifications = [
    {
      userId: user._id,
      title: 'Kritik Stok!',
      message: 'Sünger stoğu kritik seviyeye düştü.',
    },
    {
      userId: user._id,
      title: 'Yeni Sipariş',
      message: 'Yeni bir sipariş başarıyla oluşturuldu.',
    },
    {
      userId: user._id,
      title: 'Maaş Güncellemesi',
      message: 'Maaşınız 20.000₺ olarak güncellendi.',
    },
  ];
  await Notification.insertMany(notifications);
  console.log('Örnek bildirimler eklendi!');
  process.exit(0);
}

main(); 