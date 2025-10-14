const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  musteriAdi: { type: String, required: true, trim: true },
  musteriTel: { type: String, trim: true },
  musteriEmail: { type: String, trim: true, lowercase: true },
  siparisTarihi: { type: Date, default: Date.now },
  teslimTarihi: { type: Date },
  urunler: [
    {
      model: { type: String, required: true },
      renk: { type: String },
      adet: { type: Number, required: true, min: 1 },
      ozelNot: { type: String }
    }
  ],
  durum: {
    type: String,
    enum: ['beklemede', 'uretimde', 'hazir', 'teslim'],
    default: 'beklemede'
  },
  toplamTutar: { type: Number, default: 0 },
  aciklama: { type: String },
  olusturan: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guncelleyen: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema); 