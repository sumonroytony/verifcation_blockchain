const mongoose = require("mongoose");
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
    paymentDone: {
      type: Boolean,
    },
    paymentTransaction: {
      type: String,
    },
  },

  {
    timestamp: true,
  }
);

module.exports = Binance = mongoose.model("binance", binanceSchema);
