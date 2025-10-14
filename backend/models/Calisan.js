const mongoose = require('mongoose');

const CalisanSchema = new mongoose.Schema({
  ad: { type: String, required: true },
  soyad: { type: String, required: true },
  iseGirisTarihi: { type: Date, required: true },
  departman: { type: String, enum: ['Kesim', 'Döşeme', 'Montaj'], required: true },
  ustalikSeviyesi: { type: String, enum: ['Çırak', 'Kalfa', 'Usta'], required: true },
  maas: { type: Number, required: true },
  saatlikUcret: { type: Number, required: true },
  toplamSaat: { type: Number, default: 0 },
  aylikEkMesai: { type: Number, default: 0 },
  isAktif: { type: Boolean, default: true },
  tckn: { type: String, required: true },
  sgkNo: { type: String, required: true },
  siparisler: [{ type: String }],
  adres: { type: String },
  telefon: { type: String },
  fotoUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Calisan', CalisanSchema); 