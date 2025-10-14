const Stok = require('../models/Stok');
const Movement = require('../models/Movement');

/**
 * Tüm stokları getir
 * GET /api/stoklar
 */
const getAllStoklar = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            kategori,
            stokDurumu,
            arama,
            siralama = 'malzemeAdi',
            yon = 'asc'
        } = req.query;

        // Filtreleme kriterleri
        const filter = { aktif: true };
        
        if (kategori) {
            filter.kategori = kategori;
        }
        
        if (stokDurumu) {
            filter.stokDurumu = stokDurumu;
        }
        
        if (arama) {
            filter.$or = [
                { malzemeAdi: { $regex: arama, $options: 'i' } },
                { malzemeKodu: { $regex: arama, $options: 'i' } },
                { altKategori: { $regex: arama, $options: 'i' } }
            ];
        }

        // Toplam değer sıralaması için önce tüm stokları al
        let stoklar;
        if (siralama === 'toplamDeger') {
            // Tüm stokları al
            const allStoklar = await Stok.find(filter)
                .populate('guncelleyenKullanici', 'ad soyad');
            
            // Client-side sıralama
            stoklar = allStoklar.sort((a, b) => {
                const toplamA = a.miktar * a.birimFiyat;
                const toplamB = b.miktar * b.birimFiyat;
                return yon === 'desc' ? toplamB - toplamA : toplamA - toplamB;
            });
            
            // Sayfalama uygula
            const skip = (parseInt(page) - 1) * parseInt(limit);
            stoklar = stoklar.slice(skip, skip + parseInt(limit));
        } else {
            // Normal sıralama
            const sortOptions = {};
            sortOptions[siralama] = yon === 'desc' ? -1 : 1;
            
            // Sayfalama
            const skip = (parseInt(page) - 1) * parseInt(limit);
            
            // Türkçe karakter desteği için collation kullan
            const collation = siralama === 'malzemeAdi' ? { locale: 'tr', strength: 1 } : {};
            
            stoklar = await Stok.find(filter)
                .populate('guncelleyenKullanici', 'ad soyad')
                .sort(sortOptions)
                .collation(collation)
                .skip(skip)
                .limit(parseInt(limit));
        }

        // Toplam sayı
        const total = await Stok.countDocuments(filter);

        res.json({
            success: true,
            data: stoklar,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Stok listesi getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Stok listesi getirilemedi'
        });
    }
};

/**
 * Tekil stok getir
 * GET /api/stoklar/:id
 */
const getStokById = async (req, res) => {
    try {
        const stok = await Stok.findById(req.params.id)
            .populate('guncelleyenKullanici', 'ad soyad');

        if (!stok) {
            return res.status(404).json({
                success: false,
                message: 'Stok bulunamadı'
            });
        }

        res.json({
            success: true,
            data: stok
        });

    } catch (error) {
        console.error('Stok getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Stok getirilemedi'
        });
    }
};

/**
 * Yeni stok oluştur
 * POST /api/stoklar
 */
const createStok = async (req, res) => {
    try {
        const {
            malzemeAdi,
            malzemeKodu,
            kategori,
            altKategori,
            miktar,
            birim,
            minimumStok,
            birimFiyat,
            paraBirimi,
            tedarikci,
            renk,
            kalite,
            depoKonumu,
            aciklama
        } = req.body;

        // Malzeme kodu benzersizlik kontrolü
        const existingStok = await Stok.findOne({ malzemeKodu });
        if (existingStok) {
            return res.status(400).json({
                success: false,
                message: 'Bu malzeme kodu zaten kullanılıyor'
            });
        }

        // Yeni stok oluştur
        const stok = new Stok({
            malzemeAdi,
            malzemeKodu,
            kategori,
            altKategori,
            miktar,
            birim,
            minimumStok,
            birimFiyat,
            paraBirimi,
            tedarikci,
            renk,
            kalite,
            depoKonumu,
            aciklama,
            guncelleyenKullanici: req.user._id
        });

        await stok.save();

        // Eğer miktar > 0 ise hareket kaydı oluştur
        if (miktar > 0) {
            try {
                console.log('Hareket kaydı ekleniyor:', stok._id, req.user._id, miktar);
                await Movement.create({
                    stok: stok._id,
                    user: req.user._id,
                    miktar,
                    aciklama: aciklama || 'Yeni stok ekleme',
                    islemTipi: 'ekle'
                });
                console.log('Hareket kaydı başarıyla eklendi');
            } catch (err) {
                console.error('Hareket kaydı eklenirken hata:', err);
            }
        }

        // Oluşturulan stoku getir
        const createdStok = await Stok.findById(stok._id)
            .populate('guncelleyenKullanici', 'ad soyad');

        res.status(201).json({
            success: true,
            message: 'Stok başarıyla oluşturuldu',
            data: createdStok
        });

    } catch (error) {
        console.error('Stok oluşturma hatası:', error);
        
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
            message: 'Stok oluşturulamadı'
        });
    }
};

/**
 * Stok güncelle
 * PUT /api/stoklar/:id
 */
const updateStok = async (req, res) => {
    try {
        const {
            malzemeAdi,
            malzemeKodu,
            kategori,
            altKategori,
            miktar,
            birim,
            minimumStok,
            birimFiyat,
            paraBirimi,
            tedarikci,
            renk,
            kalite,
            depoKonumu,
            aciklama
        } = req.body;

        // Stok var mı kontrol et
        const existingStok = await Stok.findById(req.params.id);
        if (!existingStok) {
            return res.status(404).json({
                success: false,
                message: 'Stok bulunamadı'
            });
        }

        // Malzeme kodu benzersizlik kontrolü (kendi ID'si hariç)
        if (malzemeKodu && malzemeKodu !== existingStok.malzemeKodu) {
            const duplicateStok = await Stok.findOne({ 
                malzemeKodu, 
                _id: { $ne: req.params.id } 
            });
            if (duplicateStok) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu malzeme kodu zaten kullanılıyor'
                });
            }
        }

        // Stoku güncelle
        const updatedStok = await Stok.findByIdAndUpdate(
            req.params.id,
            {
                malzemeAdi,
                malzemeKodu,
                kategori,
                altKategori,
                miktar,
                birim,
                minimumStok,
                birimFiyat,
                paraBirimi,
                tedarikci,
                renk,
                kalite,
                depoKonumu,
                aciklama,
                guncelleyenKullanici: req.user._id
            },
            { new: true, runValidators: true }
        ).populate('guncelleyenKullanici', 'ad soyad');

        res.json({
            success: true,
            message: 'Stok başarıyla güncellendi',
            data: updatedStok
        });

    } catch (error) {
        console.error('Stok güncelleme hatası:', error);
        
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
            message: 'Stok güncellenemedi'
        });
    }
};

/**
 * Stok sil (soft veya hard delete)
 * DELETE /api/stoklar/:id
 */
const deleteStok = async (req, res) => {
    try {
        console.log('DELETE isteği geldi:', req.params.id, 'hard:', req.query.hard);
        
        const stok = await Stok.findById(req.params.id);
        if (!stok) {
            console.log('Stok bulunamadı:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'Stok bulunamadı'
            });
        }
        
        console.log('Stok bulundu:', stok.malzemeAdi, 'aktif:', stok.aktif);
        
        if (req.query.hard === 'true') {
            console.log('Hard delete yapılıyor...');
            const result = await Stok.findByIdAndDelete(req.params.id);
            console.log('Hard delete sonucu:', result);
            return res.json({ success: true, message: 'Stok kalıcı olarak silindi', hard: true });
        }
        
        console.log('Soft delete yapılıyor...');
        // Soft delete - aktif durumunu false yap
        stok.aktif = false;
        stok.guncelleyenKullanici = req.user._id;
        await stok.save();
        console.log('Soft delete tamamlandı');
        res.json({ success: true, message: 'Stok başarıyla silindi', hard: false });
    } catch (error) {
        console.error('Stok silme hatası:', error);
        res.status(500).json({ success: false, message: 'Stok silinemedi' });
    }
};

/**
 * Stok miktarı ekle
 * POST /api/stoklar/:id/ekle
 */
const stokEkle = async (req, res) => {
    try {
        const { miktar, aciklama } = req.body;

        if (!miktar || miktar <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir miktar giriniz'
            });
        }

        const stok = await Stok.findById(req.params.id);
        
        if (!stok) {
            return res.status(404).json({
                success: false,
                message: 'Stok bulunamadı'
            });
        }

        // Stok miktarını artır
        await stok.stokEkle(miktar, req.user._id);

        // Hareket kaydı ekle
        try {
            await Movement.create({
                stok: stok._id,
                user: req.user._id,
                miktar,
                aciklama: aciklama || 'Stok ekleme',
                islemTipi: 'ekle'
            });
        } catch (err) {
            console.error('Hareket kaydı eklenirken hata (ekle):', err);
        }

        // Güncellenmiş stoku getir
        const updatedStok = await Stok.findById(req.params.id)
            .populate('guncelleyenKullanici', 'ad soyad');

        res.json({
            success: true,
            message: `${miktar} ${stok.birim} stok eklendi`,
            data: updatedStok
        });

    } catch (error) {
        console.error('Stok ekleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Stok eklenemedi'
        });
    }
};

/**
 * Stok miktarı çıkar
 * POST /api/stoklar/:id/cikar
 */
const stokCikar = async (req, res) => {
    try {
        const { miktar, aciklama } = req.body;

        if (!miktar || miktar <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir miktar giriniz'
            });
        }

        const stok = await Stok.findById(req.params.id);
        
        if (!stok) {
            return res.status(404).json({
                success: false,
                message: 'Stok bulunamadı'
            });
        }

        // Yeterli stok var mı kontrol et
        if (stok.miktar < miktar) {
            return res.status(400).json({
                success: false,
                message: 'Yetersiz stok. Mevcut stok: ' + stok.miktar
            });
        }

        // Stok miktarını azalt
        await stok.stokCikar(miktar, req.user._id);

        // Hareket kaydı ekle
        try {
            await Movement.create({
                stok: stok._id,
                user: req.user._id,
                miktar,
                aciklama: aciklama || 'Stok çıkarma',
                islemTipi: 'cikar'
            });
        } catch (err) {
            console.error('Hareket kaydı eklenirken hata (cikar):', err);
        }

        // Güncellenmiş stoku getir
        const updatedStok = await Stok.findById(req.params.id)
            .populate('guncelleyenKullanici', 'ad soyad');

        res.json({
            success: true,
            message: `${miktar} ${stok.birim} stok çıkarıldı`,
            data: updatedStok
        });

    } catch (error) {
        console.error('Stok çıkarma hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Stok çıkarılamadı'
        });
    }
};

/**
 * Kritik stokları getir
 * GET /api/stoklar/kritik
 */
const getKritikStoklar = async (req, res) => {
    try {
        const kritikStoklar = await Stok.find({
            aktif: true,
            stokDurumu: { $in: ['kritik', 'tukenmis'] }
        })
        .populate('guncelleyenKullanici', 'ad soyad')
        .sort({ stokDurumu: 1, miktar: 1 });

        res.json({
            success: true,
            data: kritikStoklar
        });

    } catch (error) {
        console.error('Kritik stok getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kritik stoklar getirilemedi'
        });
    }
};

/**
 * Stok istatistikleri
 * GET /api/stoklar/istatistikler
 */
const getStokIstatistikleri = async (req, res) => {
    try {
        const [
            toplamStokSayisi,
            kritikStokSayisi,
            tukenmisStokSayisi,
            kategoriDagilimi,
            toplamDeger
        ] = await Promise.all([
            Stok.countDocuments({ aktif: true }),
            Stok.countDocuments({ aktif: true, stokDurumu: 'kritik' }),
            Stok.countDocuments({ aktif: true, stokDurumu: 'tukenmis' }),
            Stok.aggregate([
                { $match: { aktif: true } },
                { $group: { _id: '$kategori', sayi: { $sum: 1 } } },
                { $sort: { sayi: -1 } }
            ]),
            Stok.aggregate([
                { $match: { aktif: true } },
                { $group: { _id: null, toplam: { $sum: { $multiply: ['$miktar', '$birimFiyat'] } } } }
            ])
        ]);

        res.json({
            success: true,
            data: {
                toplamStokSayisi,
                kritikStokSayisi,
                tukenmisStokSayisi,
                kategoriDagilimi,
                toplamDeger: toplamDeger[0]?.toplam || 0
            }
        });

    } catch (error) {
        console.error('Stok istatistik hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Stok istatistikleri getirilemedi'
        });
    }
};

module.exports = {
    getAllStoklar,
    getStokById,
    createStok,
    updateStok,
    deleteStok,
    stokEkle,
    stokCikar,
    getKritikStoklar,
    getStokIstatistikleri
}; 