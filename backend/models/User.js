const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Temel bilgiler
    ad: {
        type: String,
        required: [true, 'Ad alanı zorunludur'],
        trim: true,
        maxlength: [50, 'Ad 50 karakterden uzun olamaz']
    },
    soyad: {
        type: String,
        required: [true, 'Soyad alanı zorunludur'],
        trim: true,
        maxlength: [50, 'Soyad 50 karakterden uzun olamaz']
    },
    email: {
        type: String,
        required: [true, 'Email alanı zorunludur'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir email adresi giriniz']
    },
    sifre: {
        type: String,
        required: [true, 'Şifre alanı zorunludur'],
        minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
        select: false // Şifreyi varsayılan olarak getirme
    },
    
    // İşçi bilgileri (rol usta ise)
    tcKimlik: {
        type: String,
        unique: true,
        sparse: true, // Sadece dolu olan kayıtlar için unique
        match: [/^\d{11}$/, 'TC Kimlik 11 haneli olmalıdır']
    },
    sgkNo: {
        type: String,
        unique: true,
        sparse: true
    },
    gorev: {
        type: String,
        enum: ['kesim', 'döseme', 'montaj', 'kalite_kontrol', ''],
        default: ''
    },
    
    // Durum bilgileri
    aktif: {
        type: Boolean,
        default: true
    },
    sonGiris: {
        type: Date,
        default: Date.now
    },
    
    // Zaman damgaları
    olusturulmaTarihi: {
        type: Date,
        default: Date.now
    },
    guncellemeTarihi: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field: Tam ad
userSchema.virtual('tamAd').get(function() {
    return `${this.ad} ${this.soyad}`;
});

// Şifre hash'leme middleware
userSchema.pre('save', async function(next) {
    // Şifre değişmemişse hash'leme
    if (!this.isModified('sifre')) return next();
    
    try {
        // Şifreyi hash'le
        const salt = await bcrypt.genSalt(12);
        this.sifre = await bcrypt.hash(this.sifre, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Şifre karşılaştırma metodu
userSchema.methods.sifreKontrol = async function(girilenSifre) {
    return await bcrypt.compare(girilenSifre, this.sifre);
};

// Kullanıcı yetkilerini kontrol etme
userSchema.methods.yetkiKontrol = function(gerekliRol) {
    const rolHiyerarsisi = {
        'admin': 4,
        'depo': 3,
        'uretim': 2,
        'satis': 1
    };
    
    return rolHiyerarsisi[this.role] >= rolHiyerarsisi[gerekliRol];
};

// Güncelleme tarihini otomatik güncelle
userSchema.pre('findOneAndUpdate', function() {
    this.set({ guncellemeTarihi: Date.now() });
});

module.exports = mongoose.model('User', userSchema); 