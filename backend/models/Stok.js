const mongoose = require('mongoose');

const stokSchema = new mongoose.Schema({
    // Temel malzeme bilgileri
    malzemeAdi: {
        type: String,
        required: [true, 'Malzeme adı zorunludur'],
        trim: true,
        maxlength: [100, 'Malzeme adı 100 karakterden uzun olamaz']
    },
    malzemeKodu: {
        type: String,
        required: [true, 'Malzeme kodu zorunludur'],
        unique: true,
        trim: true,
        uppercase: true,
        maxlength: [20, 'Malzeme kodu 20 karakterden uzun olamaz']
    },
    
    // Malzeme kategorisi
    kategori: {
        type: String,
        required: [true, 'Kategori seçimi zorunludur'],
        enum: ['kumas', 'sunger', 'ahsap', 'metal', 'aksesuar', 'diger'],
        default: 'diger'
    },
    
    // Alt kategori (daha detaylı sınıflandırma)
    altKategori: {
        type: String,
        trim: true,
        maxlength: [50, 'Alt kategori 50 karakterden uzun olamaz']
    },
    
    // Stok bilgileri
    miktar: {
        type: Number,
        required: [true, 'Miktar zorunludur'],
        min: [0, 'Miktar negatif olamaz'],
        default: 0
    },
    birim: {
        type: String,
        required: [true, 'Birim zorunludur'],
        enum: ['metre', 'adet', 'kg', 'litre', 'paket', 'top'],
        default: 'adet'
    },
    
    // Minimum stok uyarısı
    minimumStok: {
        type: Number,
        required: [true, 'Minimum stok miktarı zorunludur'],
        min: [0, 'Minimum stok negatif olamaz'],
        default: 10
    },
    
    // Fiyat bilgileri
    birimFiyat: {
        type: Number,
        required: [true, 'Birim fiyat zorunludur'],
        min: [0, 'Birim fiyat negatif olamaz'],
        default: 0
    },
    paraBirimi: {
        type: String,
        enum: ['TRY', 'USD', 'EUR'],
        default: 'TRY'
    },
    
    // Tedarikçi bilgileri
    tedarikci: {
        ad: {
            type: String,
            trim: true,
            maxlength: [100, 'Tedarikçi adı 100 karakterden uzun olamaz']
        },
        telefon: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        }
    },
    
    // Malzeme özellikleri
    renk: {
        type: String,
        trim: true,
        maxlength: [30, 'Renk 30 karakterden uzun olamaz']
    },
    kalite: {
        type: String,
        enum: ['dusuk', 'orta', 'yuksek', 'premium'],
        default: 'orta'
    },
    
    // Konum bilgisi
    depoKonumu: {
        type: String,
        trim: true,
        maxlength: [50, 'Depo konumu 50 karakterden uzun olamaz']
    },
    
    // Durum bilgileri
    aktif: {
        type: Boolean,
        default: true
    },
    stokDurumu: {
        type: String,
        enum: ['yeterli', 'kritik', 'tukenmis'],
        default: 'yeterli'
    },
    
    // Açıklama
    aciklama: {
        type: String,
        trim: true,
        maxlength: [500, 'Açıklama 500 karakterden uzun olamaz']
    },
    
    // Son güncelleme bilgileri
    sonGuncelleme: {
        type: Date,
        default: Date.now
    },
    guncelleyenKullanici: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field: Toplam değer
stokSchema.virtual('toplamDeger').get(function() {
    return this.miktar * this.birimFiyat;
});

// Virtual field: Stok durumu kontrolü
stokSchema.virtual('stokDurumuKontrol').get(function() {
    if (this.miktar <= 0) return 'tukenmis';
    if (this.miktar <= this.minimumStok) return 'kritik';
    return 'yeterli';
});

// Stok durumunu otomatik güncelle
stokSchema.pre('save', function(next) {
    this.stokDurumu = this.stokDurumuKontrol;
    this.sonGuncelleme = Date.now();
    next();
});

// Stok güncelleme middleware
stokSchema.pre('findOneAndUpdate', function() {
    this.set({ sonGuncelleme: Date.now() });
});

// Index'ler (performans için)
stokSchema.index({ malzemeKodu: 1 });
stokSchema.index({ kategori: 1 });
stokSchema.index({ stokDurumu: 1 });
stokSchema.index({ aktif: 1 });

// Statik metodlar
stokSchema.statics.kritikStoklariGetir = function() {
    return this.find({
        aktif: true,
        miktar: { $lte: '$minimumStok' }
    }).populate('guncelleyenKullanici', 'ad soyad');
};

stokSchema.statics.kategoriyeGoreGetir = function(kategori) {
    return this.find({
        aktif: true,
        kategori: kategori
    }).sort({ malzemeAdi: 1 });
};

// Instance metodlar
stokSchema.methods.stokEkle = function(miktar, kullaniciId) {
    this.miktar += miktar;
    this.guncelleyenKullanici = kullaniciId;
    return this.save();
};

stokSchema.methods.stokCikar = function(miktar, kullaniciId) {
    if (this.miktar < miktar) {
        throw new Error('Yetersiz stok');
    }
    this.miktar -= miktar;
    this.guncelleyenKullanici = kullaniciId;
    return this.save();
};

module.exports = mongoose.model('Stok', stokSchema); 