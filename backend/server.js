const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Güvenlik middleware'leri
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

// JSON parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/koltuk-otomasyon', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('✅ MongoDB bağlantısı başarılı');
    // Başlangıç verilerini oluştur (her zaman çalışsın diye if'i kaldırabilirsin)
    const seedData = require('./utils/seedData');
    await seedData();
})
.catch((err) => {
    console.error('❌ MongoDB bağlantı hatası:', err);
    process.exit(1);
});

// Ana route'lar
app.get('/', (req, res) => {
    res.json({
        message: 'Koltuk Üretim Otomasyonu API',
        version: '1.0.0',
        status: 'Çalışıyor'
    });
});

// API route'ları
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stoklar', require('./routes/stoklar'));
app.use('/api/movements', require('./routes/movement'));
app.use('/api/siparisler', require('./routes/siparisler'));
app.use('/api/uretim', require('./routes/uretim'));
const iscilerRoute = require('./routes/isciler');
app.use('/api/calisanlar', iscilerRoute);
app.use('/api/fiyatlandirma', require('./routes/fiyatlandirma'));
app.use('/api/raporlar', require('./routes/raporlar'));
app.use('/api/notifications', require('./routes/notifications'));

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Sayfa bulunamadı'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Hata:', err);
    res.status(500).json({
        success: false,
        message: 'Sunucu hatası',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Server'ı başlat
app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor`);
    console.log(`📊 API: http://localhost:${PORT}/api`);
}); 