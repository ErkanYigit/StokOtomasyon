const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT token oluşturma fonksiyonu
 */
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'koltuk_otomasyon_super_gizli_anahtar_2024',
        { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
};

/**
 * Kullanıcı kaydı
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const {
            ad,
            soyad,
            email,
            sifre,
            rol = 'usta',
            tcKimlik,
            sgkNo,
            gorev
        } = req.body;

        // Email kontrolü
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Bu email adresi zaten kullanılıyor'
            });
        }

        // TC Kimlik kontrolü (varsa)
        if (tcKimlik) {
            const existingTC = await User.findOne({ tcKimlik });
            if (existingTC) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu TC Kimlik numarası zaten kayıtlı'
                });
            }
        }

        // Yeni kullanıcı oluştur
        const user = new User({
            ad,
            soyad,
            email,
            sifre,
            rol,
            tcKimlik,
            sgkNo,
            gorev
        });

        await user.save();

        // Token oluştur
        const token = generateToken(user._id);

        // Kullanıcı bilgilerini döndür (şifre hariç)
        const userResponse = user.toObject();
        delete userResponse.sifre;

        res.status(201).json({
            success: true,
            message: 'Kullanıcı başarıyla oluşturuldu',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        console.error('Kayıt hatası:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validasyon hatası',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
};

/**
 * Kullanıcı girişi
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, sifre } = req.body;

        // Email ve şifre kontrolü
        if (!email || !sifre) {
            return res.status(400).json({
                success: false,
                message: 'Email ve şifre zorunludur'
            });
        }

        // Kullanıcıyı bul (şifre dahil)
        const user = await User.findOne({ email }).select('+sifre');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz email veya şifre'
            });
        }

        // Hesap aktif mi kontrol et
        if (!user.aktif) {
            return res.status(401).json({
                success: false,
                message: 'Hesabınız devre dışı bırakılmış'
            });
        }

        // Şifre kontrolü
        const isPasswordValid = await user.sifreKontrol(sifre);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz email veya şifre'
            });
        }

        // Son giriş tarihini güncelle
        user.sonGiris = Date.now();
        await user.save();

        // Token oluştur
        const token = generateToken(user._id);

        // Kullanıcı bilgilerini döndür (şifre hariç)
        const userResponse = user.toObject();
        delete userResponse.sifre;

        res.json({
            success: true,
            message: 'Giriş başarılı',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        console.error('Giriş hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
};

/**
 * Kullanıcı bilgilerini getir
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-sifre');
        
        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Kullanıcı bilgisi getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
};

/**
 * Şifre değiştirme
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
    try {
        const { mevcutSifre, yeniSifre } = req.body;

        if (!mevcutSifre || !yeniSifre) {
            return res.status(400).json({
                success: false,
                message: 'Mevcut şifre ve yeni şifre zorunludur'
            });
        }

        // Kullanıcıyı şifre ile birlikte getir
        const user = await User.findById(req.user._id).select('+sifre');

        // Mevcut şifre kontrolü
        const isCurrentPasswordValid = await user.sifreKontrol(mevcutSifre);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Mevcut şifre yanlış'
            });
        }

        // Yeni şifreyi güncelle
        user.sifre = yeniSifre;
        await user.save();

        res.json({
            success: true,
            message: 'Şifre başarıyla değiştirildi'
        });

    } catch (error) {
        console.error('Şifre değiştirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
};

/**
 * Kullanıcı çıkışı
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
    try {
        // JWT stateless olduğu için client tarafında token silinmeli
        // Bu endpoint sadece bilgilendirme amaçlı
        res.json({
            success: true,
            message: 'Çıkış başarılı'
        });

    } catch (error) {
        console.error('Çıkış hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
    changePassword,
    logout
}; 