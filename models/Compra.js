const mongoose = require("mongoose");

const CompraSchema = new mongoose.Schema({
  ticketId: String,
  fecha: String,
  userEmail: String,
  total: Number,
  items: [
    {
      crypto: String,
      cantidad: Number,
      precioUnitario: Number
    }
  ]
});

module.exports = mongoose.model("Compra", CompraSchema);
