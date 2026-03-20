const mongoose = require("mongoose");

const CarritoSchema = new mongoose.Schema({
  userEmail: String,
  items: [
    {
      crypto: String,
      cantidad: Number,
      precioUnitario: Number
    }
  ]
});

module.exports = mongoose.model("Carrito", CarritoSchema);
