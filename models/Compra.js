const mongoose = require("mongoose");

const compraSchema = new mongoose.Schema({
  ticketId: String,
  fecha: String,
  items: [String],
  userEmail: String
});

module.exports = mongoose.model("Compra", compraSchema);
