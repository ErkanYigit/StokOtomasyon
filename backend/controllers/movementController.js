console.log('movementController yüklendi');

const Movement = require('../models/Movement');
const Stok = require('../models/Stok');

// Hareket ekle
const createMovement = async (req, res) => {
  try {
    console.log('createMovement çağrıldı:', req.body);
    const { stokId, miktar, aciklama, islemTipi } = req.body;
    if (!['ekle', 'cikar'].includes(islemTipi)) {
      return res.status(400).json({ message: 'Geçersiz işlem tipi.' });
    }
    const stok = await Stok.findById(stokId);
    if (!stok) {
      return res.status(404).json({ message: 'Stok bulunamadı.' });
    }
    // Stok miktarını güncelle
    if (islemTipi === 'ekle') {
      stok.miktar += miktar;
    } else if (islemTipi === 'cikar') {
      if (stok.miktar < miktar) {
        return res.status(400).json({ message: 'Yetersiz stok.' });
      }
      stok.miktar -= miktar;
    }
    await stok.save();
    // Hareket kaydını oluştur
    try {
      const movement = new Movement({
        stok: stokId,
        user: req.user.id,
        miktar,
        aciklama,
        islemTipi
      });
      await movement.save();
      console.log('Movement başarıyla eklendi:', movement);
      res.status(201).json(movement);
    } catch (err) {
      console.error('Movement eklenirken hata:', err);
      res.status(500).json({ message: 'Hareket eklenirken hata oluştu.', error: err.message });
    }
  } catch (err) {
    res.status(500).json({ message: 'Hareket eklenirken hata oluştu.', error: err.message });
  }
};

// Hareketleri getir
const getMovements = async (req, res) => {
  try {
    const { stokId } = req.query;
    const filter = {};
    if (stokId) filter.stok = stokId;
    // Son 1 gün filtresi kaldırıldı
    const movements = await Movement.find(filter)
      .populate('user', 'ad soyad')
      .populate('stok', 'malzemeAdi malzemeKodu')
      .sort({ createdAt: -1 });
    res.json(movements);
  } catch (err) {
    res.status(500).json({ message: 'Hareketler getirilirken hata oluştu.', error: err.message });
  }
};

console.log('movementController export edildi');

module.exports = {
  createMovement,
  getMovements
}; 