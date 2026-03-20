const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema({
  nombre: String,
  correo: { type: String, unique: true },
  password: String,
  cuenta: { type: String, unique: true },
  saldo: { type: Number, default: 0 }
});

module.exports = mongoose.model("Usuario", UsuarioSchema);
