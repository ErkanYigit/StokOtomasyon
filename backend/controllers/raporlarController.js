const Stok = require('../models/Stok');
const Order = require('../models/Order');
const Production = require('../models/Production');
const Calisan = require('../models/Calisan');

const getBugunRaporu = async (req, res) => {
  try {
    // Kritik ve tükenmiş stoklar
    const kritikStoklar = await Stok.find({
      aktif: true,
      stokDurumu: { $in: ['kritik', 'tukenmis'] }
    }).select('malzemeAdi miktar minimumStok stokDurumu');
    const kritikStoklarData = kritikStoklar.map(s => ({
      ad: s.malzemeAdi,
      adet: s.miktar,
      minLimit: s.minimumStok,
      durum: s.stokDurumu
    }));

    // Bugün teslim edilecek siparişler
    const start = new Date();
    start.setHours(0,0,0,0);
    const end = new Date();
    end.setHours(23,59,59,999);
    const bugunTeslimSiparisler = await Order.find({
      teslimTarihi: { $gte: start, $lte: end },
      durum: { $ne: 'teslim' }
    }).select('musteriAdi urunler teslimTarihi');
    const bugunTeslimSiparislerData = bugunTeslimSiparisler.map(s => ({
      no: s._id,
      musteri: s.musteriAdi,
      urun: s.urunler && s.urunler.length > 0 ? s.urunler[0].model : ''
    }));

    // Üretimdeki işler (devam edenler)
    const uretimdekiIsler = await Production.find({
      durum: { $in: ['beklemede', 'kesim', 'döşeme', 'montaj'] }
    }).populate('siparis', 'musteriAdi').select('siparis durum');
    const uretimdekiIslerData = uretimdekiIsler.map(u => ({
      no: u.siparis?._id,
      musteri: u.siparis?.musteriAdi,
      asama: u.durum
    }));

    // Bugünkü görevli işçiler (örnek: aktif işçiler ve departmanları)
    const bugunkuGorevliIsciler = await Calisan.find({ isAktif: true }).select('ad soyad departman');
    const bugunkuGorevliIscilerData = bugunkuGorevliIsciler.map(i => ({
      ad: i.ad + ' ' + i.soyad.charAt(0) + '.',
      gorev: i.departman
    }));

    res.json({
      kritikStoklar: kritikStoklarData,
      bugunTeslimSiparisler: bugunTeslimSiparislerData,
      uretimdekiIsler: uretimdekiIslerData,
      bugunkuGorevliIsciler: bugunkuGorevliIscilerData
    });
  } catch (err) {
    console.error('Bugün raporu hatası:', err);
    res.status(500).json({ message: 'Bugün raporu alınamadı' });
  }
};

module.exports = { getBugunRaporu }; 