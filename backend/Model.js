const mongoose = require('mongoose');
const binanceSchema = mongoose.Schema(
  {
    transaction: {
      type: String,
    },
    ipfs: {
      type: String,
    },
    fileName: {
      type: String,
    },
    fileId: {
      type: Number,
    },
  },

  {
    timestamp: true,
  }
);

module.exports = Binance = mongoose.model('binance', binanceSchema);
