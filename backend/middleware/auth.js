const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT token doğrulama middleware'i
 * Kullanıcının giriş yapmış olup olmadığını kontrol eder
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Authorization header'dan token'ı al
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN formatı
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Erişim token\'ı bulunamadı'
            });
        }
        
        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'koltuk_otomasyon_super_gizli_anahtar_2024');
        
        // Kullanıcıyı veritabanından getir
        const user = await User.findById(decoded.userId).select('-sifre');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz token'
            });
        }
        
        if (!user.aktif) {
            return res.status(401).json({
                success: false,
                message: 'Hesabınız devre dışı bırakılmış'
            });
        }
        
        // Kullanıcı bilgilerini request'e ekle
        req.user = user;
        next();
        
    } catch (error) {
        console.error('Token doğrulama hatası:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token süresi dolmuş'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Token doğrulama hatası'
        });
    }
};

module.exports = {
    authenticateToken
}; 