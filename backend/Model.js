const mongoose = require("mongoose");
const binanceSchema = mongoose.Schema(
  {
    transaction: {
      type: "string",
      required: false,
    },
    fileName: {
      type: "string",
      required: false,
    },
    blockChainFileId: {
      type: "string",
      required: false,
    },
    mainFileId: {
      type: "string",
      required: false,
    },
  },

  {
    timestamp: true,
  }
);

module.exports = Binance = mongoose.model("binance", binanceSchema);
