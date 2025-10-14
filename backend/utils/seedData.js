const User = require('../models/User');
const Stok = require('../models/Stok');

/**
 * Başlangıç verilerini oluştur
 */
const seedData = async () => {
  try {
    console.log('🌱 Başlangıç verileri oluşturuluyor...');

    // Kullanıcıları oluştur
    const users = [
      {
        ad: 'Admin',
        soyad: 'User',
        email: 'admin@koltuk.com',
        sifre: '123456',
        rol: 'yonetici',
        tcKimlik: '12345678901',
        sgkNo: 'SGK001',
        gorev: 'kalite_kontrol'
      },
      {
        ad: 'Depo',
        soyad: 'Sorumlusu',
        email: 'depo@koltuk.com',
        sifre: '123456',
        rol: 'depocu',
        tcKimlik: '12345678902',
        sgkNo: 'SGK002',
        gorev: ''
      },
      {
        ad: 'Usta',
        soyad: 'Ahmet',
        email: 'usta@koltuk.com',
        sifre: '123456',
        rol: 'usta',
        tcKimlik: '12345678903',
        sgkNo: 'SGK003',
        gorev: 'döseme'
      },
      {
        ad: 'Satış',
        soyad: 'Temsilcisi',
        email: 'satis@koltuk.com',
        sifre: '123456',
        rol: 'satiscı'
      }
    ];

    // Kullanıcıları ekle
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Kullanıcı oluşturuldu: ${userData.email}`);
      } else {
        console.log(`⏭️ Kullanıcı zaten mevcut: ${userData.email}`);
      }
    }

    // Stok verilerini oluştur
    const stoklar = [
      {
        malzemeAdi: 'Keten Kumaş',
        malzemeKodu: 'KUM001',
        kategori: 'kumas',
        altKategori: 'Keten',
        miktar: 150,
        birim: 'metre',
        minimumStok: 50,
        birimFiyat: 45.50,
        paraBirimi: 'TRY',
        tedarikci: {
          ad: 'Kumaş A.Ş.',
          telefon: '0212 555 0001',
          email: 'info@kumas.com'
        },
        renk: 'Bej',
        kalite: 'yuksek',
        depoKonumu: 'A-1-1',
        aciklama: 'Yüksek kaliteli keten kumaş'
      },
      {
        malzemeAdi: 'Sünger Yastık',
        malzemeKodu: 'SUN001',
        kategori: 'sunger',
        altKategori: 'Yastık',
        miktar: 25,
        birim: 'adet',
        minimumStok: 30,
        birimFiyat: 120.00,
        paraBirimi: 'TRY',
        tedarikci: {
          ad: 'Sünger Ltd.',
          telefon: '0216 555 0002',
          email: 'info@sunger.com'
        },
        kalite: 'orta',
        depoKonumu: 'B-2-1',
        aciklama: 'Orta yoğunluklu sünger yastık'
      },
      {
        malzemeAdi: 'Ahşap Çerçeve',
        malzemeKodu: 'AHS001',
        kategori: 'ahsap',
        altKategori: 'Çerçeve',
        miktar: 8,
        birim: 'adet',
        minimumStok: 10,
        birimFiyat: 350.00,
        paraBirimi: 'TRY',
        tedarikci: {
          ad: 'Ahşap Sanayi',
          telefon: '0532 555 0003',
          email: 'info@ahsap.com'
        },
        kalite: 'yuksek',
        depoKonumu: 'C-1-1',
        aciklama: 'Meşe ağacından çerçeve'
      },
      {
        malzemeAdi: 'Metal Vida',
        malzemeKodu: 'MET001',
        kategori: 'metal',
        altKategori: 'Vida',
        miktar: 500,
        birim: 'adet',
        minimumStok: 200,
        birimFiyat: 2.50,
        paraBirimi: 'TRY',
        tedarikci: {
          ad: 'Metal Hırdavat',
          telefon: '0212 555 0004',
          email: 'info@metal.com'
        },
        kalite: 'orta',
        depoKonumu: 'D-3-1',
        aciklama: 'Paslanmaz çelik vida'
      },
      {
        malzemeAdi: 'Döşeme İpi',
        malzemeKodu: 'AKS001',
        kategori: 'aksesuar',
        altKategori: 'İp',
        miktar: 0,
        birim: 'top',
        minimumStok: 5,
        birimFiyat: 25.00,
        paraBirimi: 'TRY',
        tedarikci: {
          ad: 'Aksesuar Merkezi',
          telefon: '0216 555 0005',
          email: 'info@aksesuar.com'
        },
        kalite: 'dusuk',
        depoKonumu: 'E-1-1',
        aciklama: 'Döşeme işleri için ip'
      }
    ];

    // Stokları ekle
    for (const stokData of stoklar) {
      const existingStok = await Stok.findOne({ malzemeKodu: stokData.malzemeKodu });
      if (!existingStok) {
        await Stok.create(stokData);
        console.log(`✅ Stok oluşturuldu: ${stokData.malzemeAdi}`);
      } else {
        console.log(`⏭️ Stok zaten mevcut: ${stokData.malzemeAdi}`);
      }
    }

    // --- TEST ÇALIŞANLAR ---
    const Calisan = require('../models/Calisan');
    const calisanlar = [
      {
        ad: 'Ali', soyad: 'Yılmaz', iseGirisTarihi: new Date('2022-01-10'), departman: 'Kesim', ustalikSeviyesi: 'Usta', maas: 18000, saatlikUcret: 120, toplamSaat: 3200, aylikEkMesai: 20, isAktif: true, tckn: '11111111111', sgkNo: 'SGK101', adres: 'İstanbul', telefon: '05551111111', fotoUrl: '',
      },
      {
        ad: 'Mehmet', soyad: 'Kaya', iseGirisTarihi: new Date('2023-03-15'), departman: 'Montaj', ustalikSeviyesi: 'Kalfa', maas: 14500, saatlikUcret: 100, toplamSaat: 1800, aylikEkMesai: 10, isAktif: true, tckn: '22222222222', sgkNo: 'SGK102', adres: 'Ankara', telefon: '05552222222', fotoUrl: '',
      },
      {
        ad: 'Ayşe', soyad: 'Demir', iseGirisTarihi: new Date('2021-11-20'), departman: 'Döşeme', ustalikSeviyesi: 'Çırak', maas: 12000, saatlikUcret: 80, toplamSaat: 600, aylikEkMesai: 5, isAktif: true, tckn: '33333333333', sgkNo: 'SGK103', adres: 'Bursa', telefon: '05553333333', fotoUrl: '',
      },
      {
        ad: 'Zeynep', soyad: 'Çelik', iseGirisTarihi: new Date('2020-07-01'), departman: 'Kesim', ustalikSeviyesi: 'Kalfa', maas: 13500, saatlikUcret: 95, toplamSaat: 2500, aylikEkMesai: 12, isAktif: true, tckn: '44444444444', sgkNo: 'SGK104', adres: 'İzmir', telefon: '05554444444', fotoUrl: '',
      },
      {
        ad: 'Burak', soyad: 'Şahin', iseGirisTarihi: new Date('2022-09-05'), departman: 'Montaj', ustalikSeviyesi: 'Usta', maas: 17000, saatlikUcret: 110, toplamSaat: 2900, aylikEkMesai: 18, isAktif: true, tckn: '55555555555', sgkNo: 'SGK105', adres: 'Antalya', telefon: '05555555555', fotoUrl: '',
      },
    ];
    for (const c of calisanlar) {
      const existing = await Calisan.findOne({ tckn: c.tckn });
      if (!existing) {
        await Calisan.create(c);
        console.log(`✅ Çalışan oluşturuldu: ${c.ad} ${c.soyad}`);
      } else {
        console.log(`⏭️ Çalışan zaten mevcut: ${c.ad} ${c.soyad}`);
      }
    }

    // --- TEST SİPARİŞLER ---
    const Order = require('../models/Order');
    const siparisler = [
      {
        musteriAdi: 'Ahmet Korkmaz', musteriTel: '05321234567', musteriEmail: 'ahmet@example.com', urunler: [ { model: 'Koltuk A', renk: 'Bej', adet: 2 } ], teslimTarihi: new Date('2024-07-01'), durum: 'beklemede', toplamTutar: 12000, aciklama: 'Acil teslim',
      },
      {
        musteriAdi: 'Fatma Yıldız', musteriTel: '05329876543', musteriEmail: 'fatma@example.com', urunler: [ { model: 'Kanepe B', renk: 'Gri', adet: 1 } ], teslimTarihi: new Date('2024-07-10'), durum: 'uretimde', toplamTutar: 8000, aciklama: '',
      },
      {
        musteriAdi: 'Murat Demir', musteriTel: '05324567890', musteriEmail: 'murat@example.com', urunler: [ { model: 'Berjer C', renk: 'Kahverengi', adet: 4 } ], teslimTarihi: new Date('2024-07-15'), durum: 'hazir', toplamTutar: 16000, aciklama: 'Ekstra minderli',
      },
      {
        musteriAdi: 'Elif Aksoy', musteriTel: '05325678901', musteriEmail: 'elif@example.com', urunler: [ { model: 'Köşe Takımı D', renk: 'Lacivert', adet: 1 } ], teslimTarihi: new Date('2024-07-20'), durum: 'teslim', toplamTutar: 20000, aciklama: '',
      },
      {
        musteriAdi: 'Canan Şen', musteriTel: '05326789012', musteriEmail: 'canan@example.com', urunler: [ { model: 'Puf E', renk: 'Sarı', adet: 3 } ], teslimTarihi: new Date('2024-07-25'), durum: 'beklemede', toplamTutar: 4500, aciklama: 'Küçük boy',
      },
    ];
    let orderIds = [];
    for (const s of siparisler) {
      let existing = await Order.findOne({ musteriEmail: s.musteriEmail, teslimTarihi: s.teslimTarihi });
      if (!existing) {
        const created = await Order.create(s);
        orderIds.push(created._id);
        console.log(`✅ Sipariş oluşturuldu: ${s.musteriAdi}`);
      } else {
        orderIds.push(existing._id);
        console.log(`⏭️ Sipariş zaten mevcut: ${s.musteriAdi}`);
      }
    }

    // --- TEST ÜRETİMLER ---
    const Production = require('../models/Production');
    const uretimler = [
      {
        siparis: orderIds[0], baslangicTarihi: new Date('2024-06-01'), durum: 'beklemede', asamalar: [ { ad: 'kesim' }, { ad: 'döşeme' } ], aciklama: 'Kumaş bekleniyor',
      },
      {
        siparis: orderIds[1], baslangicTarihi: new Date('2024-06-05'), durum: 'uretimde', asamalar: [ { ad: 'kesim', tamamlandi: true }, { ad: 'döşeme' } ], aciklama: '',
      },
      {
        siparis: orderIds[2], baslangicTarihi: new Date('2024-06-10'), durum: 'hazir', asamalar: [ { ad: 'kesim', tamamlandi: true }, { ad: 'döşeme', tamamlandi: true } ], aciklama: '',
      },
      {
        siparis: orderIds[3], baslangicTarihi: new Date('2024-06-15'), durum: 'teslim', asamalar: [ { ad: 'kesim', tamamlandi: true }, { ad: 'döşeme', tamamlandi: true }, { ad: 'montaj', tamamlandi: true } ], aciklama: 'Teslim edildi',
      },
      {
        siparis: orderIds[4], baslangicTarihi: new Date('2024-06-20'), durum: 'beklemede', asamalar: [ { ad: 'kesim' } ], aciklama: '',
      },
    ];
    for (const u of uretimler) {
      const existing = await Production.findOne({ siparis: u.siparis });
      if (!existing) {
        await Production.create(u);
        console.log('✅ Üretim oluşturuldu');
      } else {
        console.log('⏭️ Üretim zaten mevcut');
      }
    }

    console.log('🎉 Başlangıç verileri başarıyla oluşturuldu!');
    console.log('\n📋 Demo Hesaplar:');
    console.log('👤 Yönetici: admin@koltuk.com / 123456');
    console.log('📦 Depocu: depo@koltuk.com / 123456');
    console.log('🔧 Usta: usta@koltuk.com / 123456');
    console.log('💼 Satış: satis@koltuk.com / 123456');

  } catch (error) {
    console.error('❌ Başlangıç verileri oluşturulurken hata:', error);
  }
};

module.exports = seedData; 