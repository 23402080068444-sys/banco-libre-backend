const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema({
  correo: { type: String, required: true, unique: true },   // correo electrónico
  password: { type: String, required: true },               // contraseña (hash con bcrypt)
  cuenta: { type: String, required: true, unique: true },   // número de cuenta
  saldo: { type: Number, default: 0 },                      // saldo inicial
  movimientos: { type: [String], default: [] }              // historial de movimientos
});

module.exports = mongoose.model("Usuario", UsuarioSchema);
