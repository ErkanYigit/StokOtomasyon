const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
  siparis: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  baslangicTarihi: { type: Date, default: Date.now },
  bitisTarihi: { type: Date },
  durum: {
    type: String,
    enum: ['beklemede', 'kesim', 'döşeme', 'montaj', 'hazir', 'teslim'],
    default: 'beklemede'
  },
  asamalar: [
    {
      ad: { type: String, required: true },
      baslangic: { type: Date },
      bitis: { type: Date },
      tamamlandi: { type: Boolean, default: false },
      aciklama: { type: String }
    }
  ],
  aciklama: { type: String },
  olusturan: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guncelleyen: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Production', productionSchema); 