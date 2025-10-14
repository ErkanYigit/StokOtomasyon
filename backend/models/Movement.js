const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema({
  stok: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stok',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  miktar: {
    type: Number,
    required: true
  },
  aciklama: {
    type: String,
    required: true
  },
  islemTipi: {
    type: String,
    enum: ['ekle', 'cikar'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Movement', movementSchema); 