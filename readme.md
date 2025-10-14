# Koltuk Üretim Otomasyonu – Tümleşik Yönetim Sistemi

Bu proje, bir koltuk üretim firmasının üretimden teslimata kadar olan tüm süreçlerini yönetebileceği **ücretsiz, güvenli ve sade ama şık** bir otomasyon sistemidir. Tüm sistem modüler, genişletilebilir ve kullanıcı dostu tasarlanmıştır.

---

## 🎯 Projenin Amacı

Aşağıdaki operasyonları tek panelden yürütmek:

- Stok Takibi (Kumaş, sünger, ahşap vb.)
- Sipariş Yönetimi
- Üretim Süreci İzleme
- İşçi Yönetimi
- Fiyatlandırma & Maliyet Hesaplama
- Raporlama & Analitik
- Kullanıcı ve Rol Bazlı Yetkilendirme

---

## 🎨 Görsel Tasarım

- **Genel Tema**: Beyaz arka plan
- **Vurgu Renkleri**: Siyah (#000000) ve Gold (#D4AF37)
- **Arayüz**: Minimalist, modern ve kolay kullanılabilir
- **Framework**: React + Tailwind CSS

---

## 🧱 Teknoloji Yığını

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js (Express)
- **Veritabanı**: MongoDB (Mongoose ODM)
- **Authentication**: JWT ile rol tabanlı erişim
- **Grafikler**: Chart.js veya Recharts
- **Veri Güvenliği**: Şifrelenmiş kullanıcı verileri, doğrulanmış tokenlar

---

## 📦 Ana Modüller

### 1. Stok Yönetimi
- Malzeme ekleme/çıkarma
- Minimum stok uyarıları
- Gerçek zamanlı stok durumu

### 2. Sipariş Yönetimi
- Müşteri bilgileri
- Sipariş detayları (model, renk, özel istek)
- Üretim aşamasına aktarım

### 3. Üretim Takibi
- Siparişten üretime geçiş
- Aşamalar: kesim → döşeme → montaj
- İş gücü ve süre izleme

### 4. İşçi Yönetimi
- İşçi bilgileri (TC, SGK, görev)
- Günlük görev atama
- Performans verisi

### 5. Fiyatlandırma & Maliyet
- Otomatik maliyet hesabı
- Malzeme + işçilik + kâr formülü
- Model bazlı fiyat tabloları

### 6. Raporlama
- Üretim grafikleri
- Aylık satış & maliyet raporları
- İş gücü analizi

---

## 👥 Kullanıcı Roller

- **Yönetici**: Tüm kontrol
- **Depo Sorumlusu**: Stok girişi, çıkışı
- **Üretim Personeli**: Kendi görevleri
- **Satış Temsilcisi**: Sipariş ve müşteri işlemleri

---

## 🔧 Geliştirme

### Kurulum

```bash
# Backend kurulumu
cd backend
npm install
npm run dev

# Frontend kurulumu (yeni terminal)
cd frontend
npm install
npm start
```

### Demo Hesaplar

Sistem otomatik olarak aşağıdaki demo hesapları oluşturur:

- **👤 Yönetici**: admin@koltuk.com / 123456
- **📦 Depocu**: depo@koltuk.com / 123456  
- **🔧 Usta**: usta@koltuk.com / 123456
- **💼 Satış**: satis@koltuk.com / 123456

### Proje Yapısı

```
project-root/
├── backend/
│   ├── controllers/     # API controller'ları
│   ├── models/         # MongoDB modelleri
│   ├── routes/         # API route'ları
│   ├── middleware/     # JWT auth middleware
│   ├── utils/          # Yardımcı fonksiyonlar
│   └── server.js       # Ana server dosyası
├── frontend/
│   ├── src/
│   │   ├── components/ # React bileşenleri
│   │   ├── pages/      # Sayfa bileşenleri
│   │   ├── context/    # React context'leri
│   │   ├── services/   # API servisleri
│   │   └── App.tsx     # Ana uygulama
│   └── package.json
└── README.md
```

### API Endpoints

#### Auth
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Kullanıcı kaydı
- `GET /api/auth/me` - Kullanıcı bilgileri

#### Stok Yönetimi
- `GET /api/stoklar` - Stok listesi
- `POST /api/stoklar` - Yeni stok ekleme
- `PUT /api/stoklar/:id` - Stok güncelleme
- `DELETE /api/stoklar/:id` - Stok silme
- `POST /api/stoklar/:id/ekle` - Stok miktarı ekleme
- `POST /api/stoklar/:id/cikar` - Stok miktarı çıkarma
- `GET /api/stoklar/kritik` - Kritik stoklar
- `GET /api/stoklar/istatistikler` - Stok istatistikleri

### Özellikler

✅ **Tamamlanan Modüller:**
- Kullanıcı Authentication (JWT)
- Rol tabanlı yetkilendirme
- Stok Yönetimi (CRUD işlemleri)
- Stok istatistikleri ve raporlama
- Modern React arayüzü
- Responsive tasarım

🔄 **Geliştirilecek Modüller:**
- Sipariş Yönetimi
- Üretim Takibi
- İşçi Yönetimi
- Fiyatlandırma
- Detaylı Raporlama
- Grafik ve analitikler
