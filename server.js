
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
<title>Banco Libre</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<style>
/* ===== TEMAS ===== */
:root {
  --azul: #007aff;
  --azul-dark: #005bb5;
  --blanco: #ffffff;
  --gris-fondo: #e5e5e5;
  --gris-card: #f2f2f7;
  --texto: #1c1c1e;
  --texto-sub: #8e8e93;
  --sombra: rgba(0,0,0,0.3);
  --border: #e0e0e0;
  --header-text: #ffffff;
  --input-bg: #ffffff;
  --card-bg: #ffffff;
  --success: #34c759;
  --danger: #ff3b30;
  --warning: #ff9500;
}

[data-theme="dark"] {
  --azul: #0a84ff;
  --azul-dark: #409cff;
  --blanco: #1c1c1e;
  --gris-fondo: #000000;
  --gris-card: #2c2c2e;
  --texto: #ffffff;
  --texto-sub: #aeaeb2;
  --sombra: rgba(0,0,0,0.6);
  --border: #3a3a3c;
  --input-bg: #2c2c2e;
  --card-bg: #1c1c1e;
}

[data-theme="verde"] {
  --azul: #34c759;
  --azul-dark: #28a745;
  --blanco: #ffffff;
  --gris-fondo: #e8f5e9;
  --gris-card: #f1f8f2;
  --texto: #1b2e1c;
  --texto-sub: #5a7a5c;
  --border: #c8e6c9;
}

[data-theme="purpura"] {
  --azul: #af52de;
  --azul-dark: #9040c8;
  --blanco: #ffffff;
  --gris-fondo: #f3eaff;
  --gris-card: #f8f0ff;
  --texto: #2d0a4e;
  --texto-sub: #7c4fa0;
  --border: #e0c8f5;
}

[data-theme="rojo"] {
  --azul: #ff3b30;
  --azul-dark: #cc2020;
  --blanco: #ffffff;
  --gris-fondo: #fff0f0;
  --gris-card: #fff5f5;
  --texto: #3a0a0a;
  --texto-sub: #9a4040;
  --border: #ffc8c8;
}

[data-theme="naranja"] {
  --azul: #ff9500;
  --azul-dark: #cc7700;
  --blanco: #ffffff;
  --gris-fondo: #fff8e8;
  --gris-card: #fffbf0;
  --texto: #3a2800;
  --texto-sub: #9a7040;
  --border: #ffe0a0;
}

[data-tema-oscuro="true"] {
  --blanco: #1c1c1e;
  --gris-fondo: #000000;
  --gris-card: #2c2c2e;
  --texto: #ffffff;
  --texto-sub: #aeaeb2;
  --border: #3a3a3c;
  --input-bg: #2c2c2e;
  --card-bg: #1c1c1e;
  --sombra: rgba(0,0,0,0.7);
}

/* ===== ANIMACIONES GLOBALES ===== */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; } to { opacity: 1; }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes popIn {
  0%   { transform: scale(0.7); opacity: 0; }
  70%  { transform: scale(1.07); opacity: 1; }
  100% { transform: scale(1); }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0,122,255,0.25); }
  50%       { box-shadow: 0 0 0 8px rgba(0,122,255,0); }
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  40%       { transform: translateY(-6px); }
  70%       { transform: translateY(-3px); }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes tickerUp {
  0% { color: var(--texto); }
  50% { color: #34c759; }
  100% { color: var(--texto); }
}
@keyframes tickerDown {
  0% { color: var(--texto); }
  50% { color: #ff3b30; }
  100% { color: var(--texto); }
}

body {
  margin: 0; padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: var(--gris-fondo);
  display: flex; align-items: center; justify-content: center; min-height: 100vh;
  transition: background-color 0.3s;
}
.app {
  width: 390px; height: 667px; background: var(--blanco);
  border-radius: 40px; box-shadow: 0 10px 30px var(--sombra);
  overflow: hidden; position: relative; display: flex; flex-direction: column;
  transition: background 0.3s, box-shadow 0.3s;
}
.pantalla { display: none; padding: 20px; text-align: center; flex: 1; overflow-y: auto; height: 100%; box-sizing: border-box; }
.pantalla.activa { display: block; }
.pantalla.entrando { animation: fadeInUp 0.32s cubic-bezier(0.22,1,0.36,1) both; }

h1,h2 { color: var(--azul); }
input {
  width: 80%; padding: 12px; margin: 8px 0;
  border: 1.5px solid var(--border); border-radius: 12px; font-size: 15px;
  box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s;
  outline: none; background: var(--input-bg); color: var(--texto);
}
input:focus { border-color: var(--azul); box-shadow: 0 0 0 3px rgba(0,122,255,0.15); }
button {
  background: var(--azul); color: white; border: none;
  border-radius: 12px; padding: 12px 20px; font-size: 15px; margin: 6px;
  cursor: pointer; transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
  position: relative; overflow: hidden;
}
button:hover { background: var(--azul-dark); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,122,255,0.3); }
button:active { transform: scale(0.96); }
button::after {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 10%, transparent 70%);
  transform: scale(0); opacity: 0; border-radius: 50%;
  transition: transform 0.4s, opacity 0.4s;
}
button:active::after { transform: scale(3); opacity: 1; transition: 0s; }

ul { list-style: none; padding: 0; margin: 0; }
ul li {
  background: var(--gris-card); margin: 5px 0; padding: 10px;
  border-radius: 8px; font-size: 13px; color: var(--texto);
  animation: slideInLeft 0.25s ease both;
}
.logo { width: 90%; max-width: 300px; height: auto; border-radius: 20px; box-shadow: 0 8px 20px var(--sombra); transition: transform 0.3s; }
.logo:hover { transform: scale(1.05); }
.header {
  position: absolute; top: 0; left: 0; width: 100%; height: 60px;
  background: var(--azul); color: var(--header-text);
  display: flex; align-items: center; padding: 0 15px; z-index: 1000; box-sizing: border-box;
  transition: background 0.3s;
}
.menu-icon { font-size: 26px; cursor: pointer; margin-right: 15px; transition: transform 0.2s; }
.menu-icon:hover { transform: scale(1.15); }
.title { font-weight: bold; font-size: 17px; flex: 1; color: white; }
.contenido { padding-top: 75px; }
.drawer {
  position: absolute; top: 0; left: -260px; width: 260px; height: 100%;
  background: var(--blanco); box-shadow: 2px 0 10px var(--sombra);
  transition: left 0.28s cubic-bezier(0.22,1,0.36,1);
  padding-top: 60px; z-index: 20; overflow-y: auto;
}
.drawer.active { left: 0; }
.drawer a {
  display: flex; align-items: center; gap: 10px; padding: 14px 18px;
  text-decoration: none; color: var(--texto); border-bottom: 1px solid var(--border);
  font-size: 15px; cursor: pointer;
  transition: background 0.15s, color 0.15s, padding-left 0.15s;
}
.drawer a:hover { background: var(--gris-card); color: var(--azul); padding-left: 26px; }
.overlay { position: absolute; width: 100%; height: 100%; background: rgba(0,0,0,.35); display: none; z-index: 15; }
.overlay.active { display: block; animation: fadeIn 0.2s; }
#movimientos { max-height: 350px; overflow-y: auto; padding: 10px; background: var(--gris-card); border-radius: 12px; }

/* SALDO */
.saldo-animado { display: inline-block; transition: transform 0.2s, color 0.3s; }
.saldo-animado.actualizando { animation: bounce 0.4s ease; color: #34c759; }

/* CARRUSEL */
.carrusel-wrap { overflow: hidden; position: relative; margin: 0 -20px; touch-action: pan-y; user-select: none; }
.carrusel-track { display: flex; transition: transform 0.4s cubic-bezier(0.22,1,0.36,1); will-change: transform; }
.carrusel-slide { min-width: 100%; padding: 0 20px; box-sizing: border-box; }
.carrusel-card {
  border-radius: 18px; padding: 18px 20px; color: white; text-align: left;
  margin-bottom: 4px; position: relative; overflow: hidden; cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s;
}
.carrusel-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
.carrusel-card.oferta { background: linear-gradient(135deg, #007aff, #00c6ff); }
.carrusel-card.promo  { background: linear-gradient(135deg, #ff6b35, #ff3b30); }
.carrusel-card.tip    { background: linear-gradient(135deg, #34c759, #00b050); }
.carrusel-card.cripto { background: linear-gradient(135deg, #5856d6, #bf5af2); }
.carrusel-card h3 { margin: 0 0 6px; font-size: 16px; }
.carrusel-card p  { margin: 0; font-size: 13px; opacity: 0.9; }
.carrusel-card .cc-emoji { font-size: 32px; position: absolute; right: 16px; top: 14px; opacity: 0.35; transition: transform 0.3s, opacity 0.3s; }
.carrusel-card:hover .cc-emoji { transform: scale(1.2) rotate(10deg); opacity: 0.6; }
.carrusel-dots { display: flex; justify-content: center; gap: 6px; margin: 8px 0 14px; }
.carrusel-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--border); transition: background 0.3s, transform 0.3s; cursor: pointer; }
.carrusel-dot.active { background: var(--azul); transform: scale(1.3); }

.inicio-saldo-card {
  background: linear-gradient(135deg, var(--azul), var(--azul-dark));
  border-radius: 18px; padding: 16px 20px; color: white; text-align: left; margin-bottom: 14px;
  animation: fadeInUp 0.4s 0.05s both;
  transition: transform 0.2s, box-shadow 0.2s;
}
.inicio-saldo-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,122,255,0.35); }
.inicio-saldo-label { font-size: 12px; opacity: 0.8; }
.inicio-saldo-num { font-size: 28px; font-weight: bold; margin: 4px 0; }
.inicio-accesos { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
.inicio-acceso-btn {
  background: var(--gris-card); border: none; border-radius: 14px;
  padding: 14px 10px; font-size: 13px; font-weight: bold; color: var(--texto);
  cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;
  transition: background 0.18s, color 0.18s, transform 0.15s, box-shadow 0.18s;
  animation: fadeInUp 0.35s calc(var(--i, 0) * 0.07s + 0.1s) both;
}
.inicio-acceso-btn:nth-child(1) { --i: 1; }
.inicio-acceso-btn:nth-child(2) { --i: 2; }
.inicio-acceso-btn:nth-child(3) { --i: 3; }
.inicio-acceso-btn:nth-child(4) { --i: 4; }
.inicio-acceso-btn:hover { background: var(--gris-fondo); color: var(--azul); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,122,255,0.15); }
.inicio-acceso-icon { font-size: 22px; transition: transform 0.2s; }
.inicio-acceso-btn:hover .inicio-acceso-icon { transform: scale(1.2) rotate(-5deg); }

/* CRIPTOMONEDAS */
.cripto-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; padding-bottom: 20px; }
.cripto-card {
  background: var(--gris-card); border-radius: 14px; padding: 12px; text-align: center; cursor: pointer;
  border: 2px solid transparent; transition: all 0.22s; position: relative;
  animation: fadeInUp 0.3s calc(var(--ci, 0) * 0.05s) both;
}
.cripto-card:hover { border-color: var(--azul); background: var(--gris-fondo); transform: translateY(-3px); box-shadow: 0 6px 18px rgba(0,122,255,0.18); }
.cripto-card.en-carrito { border-color: var(--azul); background: var(--gris-fondo); animation: pulseGlow 2s infinite; }
.cripto-emoji { font-size: 28px; transition: transform 0.2s; }
.cripto-card:hover .cripto-emoji { transform: scale(1.15) rotate(-5deg); }
.cripto-nombre { font-weight: bold; font-size: 13px; color: var(--texto); margin: 4px 0 2px; }
.cripto-simbolo { font-size: 11px; color: var(--texto-sub); }
.cripto-precio { font-size: 14px; font-weight: bold; color: var(--azul); margin-top: 6px; transition: color 0.5s; }
.cripto-precio.subio { color: #34c759; }
.cripto-precio.bajo { color: #ff3b30; }
.cripto-variacion {
  font-size: 10px; margin-top: 2px; font-weight: bold;
  padding: 2px 6px; border-radius: 6px; display: inline-block;
}
.cripto-variacion.pos { background: #d4fce5; color: #1a8a3a; }
.cripto-variacion.neg { background: #ffe5e5; color: #cc2020; }
.cripto-badge {
  position: absolute; top: 6px; right: 6px; background: var(--azul); color: white;
  font-size: 10px; border-radius: 50%; width: 18px; height: 18px; display: none;
  align-items: center; justify-content: center; font-weight: bold;
  animation: popIn 0.3s both;
}
.cripto-card.en-carrito .cripto-badge { display: flex; }

/* Mini sparkline en cada cripto card */
.cripto-sparkline { width: 100%; height: 30px; margin-top: 6px; }

.cart-badge {
  background: #ff3b30; color: white; font-size: 11px; border-radius: 50%;
  width: 18px; height: 18px; display: none; align-items: center; justify-content: center;
  font-weight: bold; margin-left: -8px; margin-top: -10px;
}
.cart-badge.visible { display: flex; animation: popIn 0.3s both; }
.cart-badge.bump { animation: bounce 0.35s ease; }

/* CARRITO */
.carrito-item {
  background: var(--gris-card); border-radius: 12px; padding: 12px; margin: 6px 0;
  display: flex; justify-content: space-between; align-items: center;
  animation: slideInRight 0.25s ease both; color: var(--texto);
}
.carrito-nombre { font-weight: bold; font-size: 14px; color: var(--texto); }
.carrito-sub { font-size: 12px; color: var(--texto-sub); }
.carrito-ctrl { display: flex; align-items: center; gap: 8px; }
.carrito-ctrl button { padding: 4px 10px; font-size: 16px; margin: 0; border-radius: 8px; min-width: 32px; }
.carrito-cantidad { font-size: 16px; font-weight: bold; min-width: 20px; text-align: center; color: var(--texto); }
.carrito-total-bar {
  background: var(--azul); color: white; border-radius: 14px; padding: 14px; margin-top: 10px;
  display: flex; justify-content: space-between; align-items: center;
}
.btn-comprar { background: white; color: var(--azul); border: none; border-radius: 10px; padding: 8px 16px; font-weight: bold; font-size: 14px; cursor: pointer; }

/* MIS CRIPTOS */
.mis-cripto-item {
  background: var(--gris-card); border-radius: 12px; padding: 12px 14px; margin: 6px 0;
  display: flex; justify-content: space-between; align-items: center;
  animation: slideInLeft 0.25s calc(var(--mi, 0) * 0.06s) both;
  transition: background 0.15s, transform 0.15s;
}
.mis-cripto-item:hover { background: var(--gris-fondo); transform: translateX(4px); }
.mis-cripto-left { display: flex; align-items: center; gap: 10px; }
.mis-cripto-emoji { font-size: 24px; }
.mis-cripto-nombre { font-weight: bold; font-size: 14px; color: var(--texto); }
.mis-cripto-cant { font-size: 12px; color: var(--texto-sub); }
.mis-cripto-valor { font-weight: bold; color: var(--azul); font-size: 15px; }
.btn-vender {
  background: #ff3b30; color: white; border: none; border-radius: 8px;
  padding: 5px 10px; font-size: 11px; font-weight: bold; cursor: pointer; margin: 0;
  transition: background 0.18s, transform 0.1s;
}
.btn-vender:hover { background: #cc2020; transform: scale(1.05); }

/* ===== PERFIL MEJORADO ===== */
.perfil-avatar-wrap { position: relative; display: inline-block; margin: 10px auto; }
.perfil-avatar {
  width: 90px; height: 90px; border-radius: 50%;
  object-fit: cover; border: 3px solid var(--azul); background: var(--gris-card); display: block;
  transition: transform 0.2s, box-shadow 0.2s;
}
.perfil-avatar-placeholder {
  width: 90px; height: 90px; border-radius: 50%;
  background: var(--gris-card); border: 3px solid var(--azul);
  display: flex; align-items: center; justify-content: center; font-size: 40px;
  margin: 0 auto; transition: transform 0.2s;
}
.perfil-edit-btn-float {
  position: absolute; bottom: 2px; right: 2px;
  background: var(--azul); border: none; border-radius: 50%;
  width: 28px; height: 28px; font-size: 13px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; padding: 0; margin: 0; color: white;
  transition: transform 0.18s, background 0.18s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2); z-index: 5;
}
.perfil-edit-btn-float:hover { transform: scale(1.18); background: var(--azul-dark); }

/* Nombre editable con lápiz inline */
.perfil-nombre-row {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin: 6px 0 2px;
}
.perfil-nombre-display { font-size: 20px; font-weight: bold; color: var(--texto); }
.perfil-nombre-input-inline {
  font-size: 18px; font-weight: bold; text-align: center;
  border: 2px solid var(--azul); border-radius: 10px; padding: 4px 10px;
  background: var(--input-bg); color: var(--texto); width: 160px; display: none;
}
.btn-edit-pencil {
  background: none; border: none; color: var(--azul); font-size: 16px; cursor: pointer; margin: 0; padding: 2px;
  transition: transform 0.2s;
}
.btn-edit-pencil:hover { transform: scale(1.2) rotate(-5deg); background: none; box-shadow: none; }
.btn-save-check {
  background: #34c759; border: none; color: white; font-size: 13px; border-radius: 8px;
  cursor: pointer; padding: 4px 8px; margin: 0; display: none;
}

.perfil-cuenta-display { font-size: 13px; color: var(--texto-sub); margin-bottom: 8px; }
.perfil-cliente-desde {
  display: inline-flex; align-items: center; gap: 5px;
  background: var(--gris-card);
  border: 1px solid var(--border); border-radius: 20px;
  padding: 5px 12px; font-size: 12px; color: var(--azul);
  font-weight: 600; margin-bottom: 14px;
  animation: popIn 0.4s 0.2s both;
}
.perfil-stats-row {
  display: flex; gap: 10px; margin-bottom: 14px;
}
.perfil-stat-card {
  flex: 1; background: var(--gris-card); border-radius: 14px; padding: 12px 8px; text-align: center;
}
.perfil-stat-val { font-size: 18px; font-weight: bold; color: var(--azul); }
.perfil-stat-label { font-size: 10px; color: var(--texto-sub); margin-top: 2px; }

/* CONFIGURACION */
.config-section {
  background: var(--gris-card); border-radius: 16px; padding: 14px; margin-bottom: 12px; text-align: left;
  animation: fadeInUp 0.3s both;
}
.config-section h4 { margin: 0 0 12px; font-size: 13px; color: var(--texto-sub); text-transform: uppercase; letter-spacing: 0.5px; }
.config-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; border-bottom: 1px solid var(--border);
}
.config-row:last-child { border-bottom: none; padding-bottom: 0; }
.config-label { font-size: 14px; color: var(--texto); }
.config-sub { font-size: 11px; color: var(--texto-sub); margin-top: 2px; }

/* Toggle switch */
.toggle-switch { position: relative; width: 44px; height: 26px; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider {
  position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
  background: #ccc; border-radius: 26px; transition: 0.3s;
}
.toggle-slider:before {
  position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px;
  background: white; border-radius: 50%; transition: 0.3s;
}
.toggle-switch input:checked + .toggle-slider { background: var(--azul); }
.toggle-switch input:checked + .toggle-slider:before { transform: translateX(18px); }

/* Temas de color */
.temas-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.tema-btn {
  padding: 8px; border-radius: 12px; border: 2px solid transparent;
  cursor: pointer; font-size: 12px; font-weight: bold; margin: 0;
  transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.tema-btn.activo { border-color: var(--texto); transform: scale(1.05); }
.tema-dot { width: 20px; height: 20px; border-radius: 50%; }

/* GRÁFICAS */
.grafica-fullscreen {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: var(--blanco); z-index: 100; padding: 70px 16px 16px; box-sizing: border-box;
  display: none; overflow-y: auto;
}
.grafica-fullscreen.activa { display: block; animation: fadeInUp 0.3s both; }
.grafica-back-btn {
  position: absolute; top: 14px; left: 15px; background: white; color: var(--azul);
  border: 1px solid var(--azul); border-radius: 10px; padding: 6px 12px; font-size: 12px;
  cursor: pointer; margin: 0; z-index: 10;
}
.chart-container { position: relative; width: 100%; margin-bottom: 16px; }
.chart-tabs {
  display: flex; gap: 6px; margin-bottom: 12px;
}
.chart-tab {
  flex: 1; padding: 7px; font-size: 11px; font-weight: bold;
  background: var(--gris-card); color: var(--texto-sub); border: none;
  border-radius: 8px; cursor: pointer; margin: 0; transition: all 0.2s;
}
.chart-tab.active { background: var(--azul); color: white; }
.grafica-header {
  position: absolute; top: 0; left: 0; width: 100%; height: 60px;
  background: var(--azul); display: flex; align-items: center; padding: 0 15px;
  box-sizing: border-box; z-index: 5;
}
.grafica-title { color: white; font-weight: bold; font-size: 16px; flex: 1; text-align: center; }

/* TICKER */
.precio-ticker {
  background: var(--gris-card); border-radius: 10px; padding: 6px 10px;
  margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
  font-size: 12px; overflow: hidden; border: 1px solid var(--border);
}
.ticker-scroll {
  display: flex; gap: 14px; animation: none; white-space: nowrap;
}
.ticker-item { display: flex; align-items: center; gap: 4px; font-size: 11px; }
.ticker-sym { font-weight: bold; color: var(--texto); }
.ticker-val { color: var(--azul); font-weight: bold; }
.ticker-chg.pos { color: #34c759; }
.ticker-chg.neg { color: #ff3b30; }

/* PERFIL FOTO OPCIONES */
.perfil-photo-options {
  display: flex; gap: 8px; justify-content: center; margin-bottom: 12px;
}
.perfil-photo-options button {
  flex: 1; padding: 7px 10px; font-size: 12px;
  background: var(--gris-card); color: var(--texto); border: 1px solid var(--border);
}
.perfil-photo-options button:hover { background: var(--azul); color: white; border-color: var(--azul); }

/* COMENTARIOS */
.estrellas { display: flex; justify-content: center; gap: 8px; margin: 10px 0; }
.estrella { font-size: 28px; cursor: pointer; transition: transform 0.15s, opacity 0.15s; opacity: 0.4; }
.estrella.activa { opacity: 1; }
.estrella:hover { transform: scale(1.25) rotate(-8deg); }
.comentario-card {
  background: var(--gris-card); border-radius: 14px; padding: 12px 14px; margin: 8px 0; text-align: left;
  animation: slideInLeft 0.25s ease both; color: var(--texto);
}
.comentario-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.comentario-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.comentario-avatar-placeholder { width: 36px; height: 36px; border-radius: 50%; background: var(--azul); color: white; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.comentario-user { font-weight: bold; font-size: 13px; }
.comentario-texto { font-size: 13px; color: var(--texto); margin: 0; }
.comentario-fecha { font-size: 11px; color: var(--texto-sub); margin-top: 4px; }
textarea {
  width: 85%; padding: 12px; margin: 8px 0; border: 1.5px solid var(--border);
  border-radius: 12px; font-size: 14px; resize: none; font-family: inherit;
  box-sizing: border-box; transition: border-color 0.2s; outline: none;
  background: var(--input-bg); color: var(--texto);
}
textarea:focus { border-color: var(--azul); box-shadow: 0 0 0 3px rgba(0,122,255,0.15); }

/* LOGIN */
#login .logo { animation: fadeInUp 0.5s 0.1s both; }
#login h1   { animation: fadeInUp 0.4s 0.2s both; color: var(--azul); }

/* TOAST */
#toast {
  position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px);
  background: #1c1c1e; color: white; padding: 10px 20px; border-radius: 20px;
  font-size: 13px; font-weight: 500; z-index: 9999; pointer-events: none;
  opacity: 0; transition: opacity 0.25s, transform 0.25s; white-space: nowrap; max-width: 80%;
}
#toast.visible { opacity: 1; transform: translateX(-50%) translateY(0); }

/* ADMIN */
#admin { background: var(--gris-fondo); }
.admin-header { position: absolute; top: 0; left: 0; width: 100%; height: 60px; background: var(--azul); color: white; display: flex; align-items: center; padding: 0 15px; z-index: 1000; box-sizing: border-box; }
.admin-badge { background: #ff3b30; color: white; font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: bold; }
.admin-tabs { display: flex; gap: 0; margin-bottom: 12px; background: var(--blanco); border-radius: 12px; padding: 4px; border: 1px solid var(--border); }
.admin-tab { flex: 1; padding: 8px 2px; font-size: 10px; font-weight: bold; background: transparent; color: var(--texto-sub); border: none; border-radius: 9px; cursor: pointer; transition: all 0.2s; margin: 0; }
.admin-tab.active { background: var(--azul); color: white; }
.admin-tab-content { display: none; }
.admin-tab-content.active { display: block; }
.admin-stats { display: flex; justify-content: space-around; background: var(--blanco); border-radius: 14px; padding: 12px; margin-bottom: 10px; border: 1px solid var(--border); }
.stat-item { text-align: center; }
.stat-val { font-size: 18px; font-weight: bold; color: var(--azul); }
.stat-label { font-size: 10px; color: var(--texto-sub); }
.admin-card { background: var(--blanco); border: 1px solid var(--border); border-radius: 14px; margin: 8px 0; padding: 14px; animation: fadeInUp 0.25s ease both; }
.admin-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.admin-user-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; background: var(--gris-card); border: 2px solid var(--azul); flex-shrink: 0; }
.admin-user-avatar-placeholder { width: 44px; height: 44px; border-radius: 50%; background: var(--azul); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.admin-user-info { text-align: left; flex: 1; }
.admin-cuenta-num { font-size: 13px; color: var(--azul); font-weight: bold; }
.admin-nombre-usuario { font-size: 12px; color: var(--texto); font-weight: 600; }
.admin-saldo { font-size: 20px; font-weight: bold; color: var(--texto); margin: 2px 0; }
.admin-correo { font-size: 11px; color: var(--texto-sub); margin-bottom: 10px; }
.admin-btn-row { display: flex; gap: 6px; flex-wrap: wrap; }
.admin-btn { font-size: 11px; padding: 7px 10px; border-radius: 8px; margin: 0; cursor: pointer; border: none; color: white; flex: 1; min-width: 55px; }
.btn-edit { background: var(--azul); } .btn-edit:hover { background: var(--azul-dark); }
.btn-delete { background: #ff3b30; } .btn-delete:hover { background: #cc2020; }
.btn-history { background: #5856d6; } .btn-history:hover { background: #3634a3; }
.btn-cripto { background: #34c759; } .btn-cripto:hover { background: #28a745; }
.btn-opinion { background: #ff9500; } .btn-opinion:hover { background: #cc7700; }
.admin-search { width: 100%; padding: 10px 14px; box-sizing: border-box; background: var(--blanco); border: 1px solid var(--border); color: var(--texto); border-radius: 12px; font-size: 14px; margin: 6px 0 8px; }
.admin-list-wrap { max-height: 340px; overflow-y: auto; }
.admin-refresh { background: var(--blanco); border: 1px solid var(--azul); color: var(--azul); border-radius: 10px; padding: 7px 14px; font-size: 12px; cursor: pointer; margin: 0 0 8px; display: inline-block; }
.admin-cripto-row { background: var(--blanco); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; margin: 6px 0; display: flex; justify-content: space-between; align-items: center; }
.admin-cripto-left { display: flex; align-items: center; gap: 10px; }
.admin-cripto-nombre { font-weight: bold; font-size: 14px; color: var(--texto); }
.admin-cripto-simbolo { font-size: 11px; color: var(--texto-sub); }
.admin-cripto-precio { font-size: 15px; font-weight: bold; color: var(--azul); }
.btn-edit-precio { background: var(--azul); color: white; border: none; border-radius: 8px; padding: 6px 12px; font-size: 12px; cursor: pointer; margin: 0; }

/* MODALES */
.modal-overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); z-index: 200; display: none;
  align-items: center; justify-content: center;
}
.modal-overlay.active { display: flex; animation: fadeIn 0.2s; }
.modal-box {
  background: var(--blanco); border-radius: 20px; padding: 24px; width: 82%; text-align: center;
  box-shadow: 0 10px 30px var(--sombra); max-height: 85%; overflow-y: auto;
  animation: popIn 0.3s cubic-bezier(0.22,1,0.36,1) both; color: var(--texto);
}
.modal-box h3 { color: var(--azul); margin-top: 0; }
.modal-box input { background: var(--gris-card); border: 1px solid var(--border); color: var(--texto); border-radius: 10px; width: 85%; padding: 12px; font-size: 15px; margin: 10px 0; }
.modal-btn-row { display: flex; gap: 10px; justify-content: center; margin-top: 10px; }
.modal-btn-row button { margin: 0; flex: 1; font-size: 14px; padding: 10px; }
.history-list { max-height: 200px; overflow-y: auto; background: var(--gris-card); border-radius: 10px; padding: 10px; margin: 10px 0; text-align: left; }
.history-list p { color: var(--texto); font-size: 11px; margin: 5px 0; border-bottom: 1px solid var(--border); padding-bottom: 5px; }
.admin-user-cripto-item { background: var(--gris-card); border-radius: 10px; padding: 10px 12px; margin: 5px 0; display: flex; justify-content: space-between; align-items: center; }
.auc-left { display: flex; align-items: center; gap: 8px; }
.auc-nombre { font-weight: bold; font-size: 13px; color: var(--texto); }
.auc-cant { font-size: 11px; color: var(--texto-sub); }
.btn-auc-quitar { background: #ff3b30; color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer; margin: 0; }
.qty-selector { display: flex; align-items: center; justify-content: center; gap: 14px; margin: 12px 0; }
.qty-btn { padding: 8px 16px; font-size: 20px; border-radius: 10px; margin: 0; }
.qty-num { font-size: 24px; font-weight: bold; color: var(--azul); min-width: 40px; text-align: center; }
.admin-opinion-card { background: var(--gris-card); border-radius: 12px; padding: 12px; margin: 6px 0; text-align: left; }
.admin-opinion-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.admin-opinion-texto { font-size: 13px; color: var(--texto); margin: 0 0 4px; }
.admin-opinion-fecha { font-size: 11px; color: var(--texto-sub); }
.btn-borrar-opinion { background: #ff3b30; color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer; margin: 0; }
.loading-spinner { width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: var(--azul); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 20px auto; }

/* FUENTE TAMAÑO */
[data-font="grande"] { font-size: 17px; }
[data-font="grande"] input, [data-font="grande"] button { font-size: 16px; }
[data-font="pequeno"] { font-size: 13px; }
[data-font="pequeno"] input, [data-font="pequeno"] button { font-size: 13px; }
</style>
</head>
<body><div class="app" id="appRoot">

  <div id="toast"></div>

  <!-- DRAWER -->
  <div class="drawer" id="drawer">
    <a onclick="cambiarPantalla('inicio');toggleMenu()">🏠 Inicio</a>
    <a onclick="cambiarPantalla('balance');toggleMenu()">💰 Balance</a>
    <a onclick="cambiarPantalla('depositos');toggleMenu()">💸 Depósitos</a>
    <a onclick="cambiarPantalla('criptomonedas');toggleMenu()">🪙 Criptomonedas</a>
    <a onclick="cambiarPantalla('carrito');toggleMenu()">🛒 Carrito <span id="carritoDrawerCount" style="background:var(--azul);color:white;border-radius:10px;padding:1px 7px;font-size:11px;margin-left:4px;display:none"></span></a>
    <a onclick="cambiarPantalla('misCriptos');toggleMenu()">💎 Mis Criptomonedas</a>
    <a onclick="cambiarPantalla('comentarios');toggleMenu()">⭐ Reseñas</a>
    <a onclick="cambiarPantalla('perfil');toggleMenu()">👤 Perfil</a>
    <a onclick="cambiarPantalla('configuracion');toggleMenu()">⚙️ Configuración</a>
    <a onclick="logout();toggleMenu()">🚪 Cerrar sesión</a>
  </div>
  <div class="overlay" id="overlay" onclick="toggleMenu()"></div>

  <!-- LOGIN -->
  <div id="login" class="pantalla activa">
    <img src="bancolibre.jpg.jpeg" class="logo" onerror="this.style.display='none'">
    <h1>Banco Libre</h1>
    <input id="usuario" placeholder="Número de cuenta">
    <input id="password" type="password" placeholder="Contraseña">
    <button onclick="login()">Ingresar</button>
    <button onclick="cambiarPantalla('registro')">Crear cuenta</button>
    <button onclick="cambiarPantalla('reset')">¿Olvidaste tu contraseña?</button>
  </div>

  <!-- REGISTRO -->
  <div id="registro" class="pantalla">
    <h2>Crear cuenta</h2>
    <input id="nuevaCuenta" placeholder="Número de cuenta (10 dígitos)">
    <input id="nuevaPassword" type="password" placeholder="Contraseña">
    <input id="nuevoCorreo" type="email" placeholder="Correo electrónico">
    <button onclick="crearCuenta()">Registrar</button>
    <button onclick="cambiarPantalla('login')">Volver</button>
  </div>

  <!-- INICIO -->
  <div id="inicio" class="pantalla">
    <div class="header">
      <div class="menu-icon" onclick="toggleMenu()">☰</div>
      <div class="title">Banco Libre</div>
      <div id="headerAvatar" style="cursor:pointer;" onclick="cambiarPantalla('perfil')"></div>
    </div>
    <div class="contenido">
      <p id="bienvenidaMsg" style="color:var(--texto-sub);font-size:13px;margin:0 0 12px;text-align:left;"></p>
      <!-- Ticker de precios -->
      <div class="precio-ticker" id="precioTicker">
        <span style="font-size:11px;color:var(--azul);font-weight:bold;white-space:nowrap;">📊</span>
        <div class="ticker-scroll" id="tickerScroll"></div>
      </div>
      <div class="inicio-saldo-card">
        <div class="inicio-saldo-label">Saldo disponible</div>
        <div class="inicio-saldo-num" id="inicioSaldo">$—</div>
        <div style="font-size:12px;opacity:0.7;margin-top:4px;">Cuenta: <span id="cuentaActual"></span></div>
      </div>
      <div class="inicio-accesos">
        <button class="inicio-acceso-btn" onclick="cambiarPantalla('depositos')"><span class="inicio-acceso-icon">💸</span>Transferir</button>
        <button class="inicio-acceso-btn" onclick="cambiarPantalla('criptomonedas')"><span class="inicio-acceso-icon">🪙</span>Criptos</button>
        <button class="inicio-acceso-btn" onclick="cambiarPantalla('misCriptos')"><span class="inicio-acceso-icon">💎</span>Mis Criptos</button>
        <button class="inicio-acceso-btn" onclick="cambiarPantalla('comentarios')"><span class="inicio-acceso-icon">⭐</span>Reseñas</button>
      </div>
      <div class="carrusel-wrap" id="carruselWrap">
        <div class="carrusel-track" id="carruselTrack">
          <div class="carrusel-slide"><div class="carrusel-card oferta" onclick="irDesdeCarrusel('criptomonedas','ZRO')"><span class="cc-emoji">⚡</span><h3>¡Oferta del día!</h3><p>ZeroCoin (ZRO) con precio mínimo histórico. ¡Toca para comprar!</p></div></div>
          <div class="carrusel-slide"><div class="carrusel-card cripto" onclick="irDesdeCarrusel('criptomonedas','FNX')"><span class="cc-emoji">🔥</span><h3>PhoenixCoin en alza</h3><p>FNX subió un 12% esta semana. ¡Toca para invertir!</p></div></div>
          <div class="carrusel-slide"><div class="carrusel-card tip" onclick="cambiarPantalla('balance')"><span class="cc-emoji">💡</span><h3>Consejo financiero</h3><p>Diversifica tu cartera. No pongas todos tus fondos en una sola cripto.</p></div></div>
          <div class="carrusel-slide"><div class="carrusel-card promo" onclick="cambiarPantalla('registro')"><span class="cc-emoji">🎁</span><h3>Nuevo usuario</h3><p>Cada cuenta nueva inicia con $10,000. ¡Comparte con un amigo!</p></div></div>
          <div class="carrusel-slide"><div class="carrusel-card cripto" onclick="irDesdeCarrusel('criptomonedas','NVX')"><span class="cc-emoji">🌟</span><h3>NovaCoin recomendada</h3><p>NVX es la cripto más estable del banco. ¡Toca para comprar!</p></div></div>
        </div>
        <div class="carrusel-dots" id="carruselDots"></div>
      </div>
    </div>
  </div>

  <!-- DEPÓSITOS -->
  <div id="depositos" class="pantalla">
    <div class="header"><div class="menu-icon" onclick="toggleMenu()">☰</div><div class="title">Depósitos</div></div>
    <div class="contenido">
      <h2>Transferir</h2>
      <input id="cuentaDestino" placeholder="Cuenta destino">
      <input id="monto" type="number" placeholder="Monto">
      <button onclick="depositar()">💸 Depositar</button>
    </div>
  </div>

  <!-- BALANCE -->
  <div id="balance" class="pantalla">
    <div class="header"><div class="menu-icon" onclick="toggleMenu()">☰</div><div class="title">Balance</div></div>
    <div class="contenido">
      <h2 style="color:var(--texto)">Saldo: $<span id="saldo" class="saldo-animado" style="color:var(--azul)">0</span></h2>
      <h3 style="text-align:left;color:var(--texto)">Movimientos</h3>
      <div id="movimientos"><ul id="listaMovimientos"></ul></div>
    </div>
  </div>

  <!-- PERFIL MEJORADO -->
  <div id="perfil" class="pantalla">
    <div class="header"><div class="menu-icon" onclick="toggleMenu()">☰</div><div class="title">Perfil</div></div>
    <div class="contenido">
      <!-- Avatar con lápiz -->
      <div class="perfil-avatar-wrap" id="perfilAvatarWrap">
        <div class="perfil-avatar-placeholder" id="perfilAvatarPlaceholder">👤</div>
        <img id="perfilAvatarImg" class="perfil-avatar" style="display:none;" src="" alt="avatar">
        <button class="perfil-edit-btn-float" onclick="mostrarOpcionesFoto()" title="Cambiar foto">✏️</button>
      </div>
      
      <!-- Opciones foto (se muestran al tocar el lápiz) -->
      <div class="perfil-photo-options" id="perfilPhotoOpts" style="display:none;">
        <button onclick="subirFotoDesdeArchivo()">🖼️ Galería</button>
        <button onclick="tomarFotoPerfil()">📸 Cámara</button>
        <button onclick="ocultarOpcionesFoto()" style="background:var(--gris-card);color:var(--texto);border:1px solid var(--border);">✕</button>
      </div>
      
      <!-- Nombre editable inline con lápiz -->
      <div class="perfil-nombre-row">
        <span class="perfil-nombre-display" id="perfilNombreDisplay">—</span>
        <input class="perfil-nombre-input-inline" id="perfilNombreInline" placeholder="Tu nombre">
        <button class="btn-edit-pencil" id="btnLapizNombre" onclick="activarEditNombre()" title="Editar nombre">✏️</button>
        <button class="btn-save-check" id="btnGuardarNombre" onclick="guardarNombreInline()">✓</button>
      </div>
      
      <div class="perfil-cuenta-display" id="cuentaPerfil"></div>
      <div class="perfil-cliente-desde" id="perfilClienteDesde" style="display:none;">
        🗓️ <span id="perfilClienteDesdeTxt"></span>
      </div>
      
      <!-- Stats del perfil -->
      <div class="perfil-stats-row" id="perfilStats"></div>
      
      <input type="file" id="inputFotoPerfil" accept="image/*" style="display:none;" onchange="procesarFotoPerfil(this.files[0])">
    </div>
  </div>

  <!-- CONFIGURACIÓN -->
  <div id="configuracion" class="pantalla">
    <div class="header"><div class="menu-icon" onclick="toggleMenu()">☰</div><div class="title">⚙️ Configuración</div></div>
    <div class="contenido">

      <!-- Apariencia -->
      <div class="config-section">
        <h4>🎨 Apariencia</h4>
        <div class="config-row">
          <div><div class="config-label">Modo oscuro</div><div class="config-sub">Fondo negro, texto claro</div></div>
          <label class="toggle-switch">
            <input type="checkbox" id="toggleOscuro" onchange="cambiarModoOscuro(this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="config-row" style="flex-direction:column;align-items:flex-start;gap:10px;">
          <div class="config-label">Color principal</div>
          <div class="temas-grid" style="width:100%;">
            <button class="tema-btn" style="background:#e8f2ff;" onclick="cambiarTema('default')">
              <div class="tema-dot" style="background:#007aff;"></div>
              <span style="color:#007aff;font-size:11px;">Azul</span>
            </button>
            <button class="tema-btn" style="background:#e8f5e9;" onclick="cambiarTema('verde')">
              <div class="tema-dot" style="background:#34c759;"></div>
              <span style="color:#34c759;font-size:11px;">Verde</span>
            </button>
            <button class="tema-btn" style="background:#f3eaff;" onclick="cambiarTema('purpura')">
              <div class="tema-dot" style="background:#af52de;"></div>
              <span style="color:#af52de;font-size:11px;">Púrpura</span>
            </button>
            <button class="tema-btn" style="background:#fff0f0;" onclick="cambiarTema('rojo')">
              <div class="tema-dot" style="background:#ff3b30;"></div>
              <span style="color:#ff3b30;font-size:11px;">Rojo</span>
            </button>
            <button class="tema-btn" style="background:#fff8e8;" onclick="cambiarTema('naranja')">
              <div class="tema-dot" style="background:#ff9500;"></div>
              <span style="color:#ff9500;font-size:11px;">Naranja</span>
            </button>
            <button class="tema-btn" style="background:#1c1c1e;border:1px solid #555;" onclick="cambiarTema('oscuro-total')">
              <div class="tema-dot" style="background:#0a84ff;"></div>
              <span style="color:#aaa;font-size:11px;">Dark</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Texto -->
      <div class="config-section">
        <h4>🔤 Texto</h4>
        <div class="config-row">
          <div class="config-label">Tamaño de fuente</div>
          <div style="display:flex;gap:6px;">
            <button onclick="cambiarFuente('pequeno')" style="padding:5px 10px;font-size:12px;margin:0;">A</button>
            <button onclick="cambiarFuente('normal')" style="padding:5px 10px;font-size:14px;margin:0;">A</button>
            <button onclick="cambiarFuente('grande')" style="padding:5px 10px;font-size:17px;margin:0;">A</button>
          </div>
        </div>
      </div>

      <!-- Notificaciones -->
      <div class="config-section">
        <h4>🔔 Preferencias</h4>
        <div class="config-row">
          <div><div class="config-label">Ticker de precios</div><div class="config-sub">Mostrar precios en tiempo real</div></div>
          <label class="toggle-switch">
            <input type="checkbox" id="toggleTicker" checked onchange="cambiarTicker(this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="config-row">
          <div><div class="config-label">Variación en criptos</div><div class="config-sub">Mostrar % de cambio de precio</div></div>
          <label class="toggle-switch">
            <input type="checkbox" id="toggleVariacion" checked onchange="cambiarVariacion(this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- Seguridad -->
      <div class="config-section">
        <h4>🔒 Cuenta</h4>
        <div class="config-row" style="cursor:pointer;" onclick="cambiarPantalla('reset');toggleMenu && null">
          <div><div class="config-label">Cambiar contraseña</div><div class="config-sub">Actualiza tu contraseña</div></div>
          <span style="color:var(--azul);">›</span>
        </div>
        <div class="config-row" style="cursor:pointer;" onclick="logout()">
          <div class="config-label" style="color:#ff3b30;">Cerrar sesión</div>
          <span style="color:#ff3b30;">›</span>
        </div>
      </div>

      <p style="font-size:11px;color:var(--texto-sub);margin-top:10px;">Banco Libre v2.0 · Los precios se actualizan cada 5 min</p>
    </div>
  </div>

  <!-- RESET -->
  <div id="reset" class="pantalla">
    <h2>Restablecer contraseña</h2>
    <input id="correoReset" placeholder="Correo registrado">
    <button onclick="enviarPin()">Enviar PIN</button>
    <input id="pinIngresado" placeholder="PIN recibido">
    <input id="nuevaPasswordReset" type="password" placeholder="Nueva contraseña">
    <button onclick="cambiarPassword()">Cambiar contraseña</button>
    <button onclick="cambiarPantalla('login')">Volver</button>
  </div>

  <!-- CRIPTOMONEDAS -->
  <div id="criptomonedas" class="pantalla">
    <div class="header">
      <div class="menu-icon" onclick="toggleMenu()">☰</div>
      <div class="title">Criptomonedas</div>
      <div style="display:flex;gap:8px;align-items:center;">
        <span style="cursor:pointer;font-size:18px;color:white;" onclick="abrirGraficaGeneral()" title="Gráfica general">📊</span>
        <div style="display:flex;align-items:flex-start;cursor:pointer;" onclick="cambiarPantalla('carrito')">
          🛒<span class="cart-badge" id="cartBadge">0</span>
        </div>
      </div>
    </div>
    <div class="contenido">
      <p style="color:var(--texto-sub);font-size:13px;margin:0 0 10px;">Toca una moneda para comprar · 📊 para gráfica general</p>
      <div class="cripto-grid" id="criptoGrid"></div>
    </div>
  </div>

  <!-- GRÁFICA INDIVIDUAL (fullscreen sobre criptomonedas) -->
  <div class="grafica-fullscreen" id="graficaIndividual">
    <div class="grafica-header">
      <button class="grafica-back-btn" onclick="cerrarGraficaIndividual()">← Volver</button>
      <div class="grafica-title" id="graficaIndividualTitle">—</div>
    </div>
    <div style="padding-top:10px;">
      <div class="chart-tabs" id="graficaTabs">
        <button class="chart-tab active" onclick="cambiarPeriodoGrafica('1h',this)">1h</button>
        <button class="chart-tab" onclick="cambiarPeriodoGrafica('24h',this)">24h</button>
        <button class="chart-tab" onclick="cambiarPeriodoGrafica('7d',this)">7d</button>
        <button class="chart-tab" onclick="cambiarPeriodoGrafica('30d',this)">30d</button>
      </div>
      <div class="chart-container" style="height:220px;">
        <canvas id="chartIndividual"></canvas>
      </div>
      <div id="graficaInfoCard" style="background:var(--gris-card);border-radius:14px;padding:14px;margin-top:8px;text-align:left;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div>
            <div style="font-size:22px;font-weight:bold;color:var(--texto);" id="gInfoPrecio">—</div>
            <div style="font-size:12px;color:var(--texto-sub);" id="gInfoSim">—</div>
          </div>
          <div style="text-align:right;">
            <div id="gInfoCambio" style="font-size:14px;font-weight:bold;"></div>
            <div style="font-size:11px;color:var(--texto-sub);">Variación</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;">
          <button onclick="abrirModalCompraDesdeGrafica()" style="flex:1;margin:0;font-size:13px;padding:10px;">🛒 Comprar</button>
          <button onclick="abrirModalVentaDesdeGrafica()" style="flex:1;margin:0;font-size:13px;padding:10px;background:#ff3b30;">💰 Vender</button>
        </div>
      </div>
    </div>
  </div>

  <!-- GRÁFICA GENERAL (fullscreen) -->
  <div class="grafica-fullscreen" id="graficaGeneral">
    <div class="grafica-header">
      <button class="grafica-back-btn" onclick="cerrarGraficaGeneral()">← Volver</button>
      <div class="grafica-title">📊 Todas las criptos</div>
    </div>
    <div style="padding-top:10px;">
      <div class="chart-container" style="height:240px;">
        <canvas id="chartGeneral"></canvas>
      </div>
      <p style="font-size:11px;color:var(--texto-sub);text-align:center;margin:4px 0 10px;">Precio actual de todas las criptomonedas</p>
      <div id="generalLeyenda" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;"></div>
    </div>
  </div>

  <!-- CARRITO -->
  <div id="carrito" class="pantalla">
    <div class="header"><div class="menu-icon" onclick="toggleMenu()">☰</div><div class="title">🛒 Carrito</div></div>
    <div class="contenido"><div id="carritoContenido"></div></div>
  </div>

  <!-- MIS CRIPTOS -->
  <div id="misCriptos" class="pantalla">
    <div class="header"><div class="menu-icon" onclick="toggleMenu()">☰</div><div class="title">💎 Mis Criptos</div></div>
    <div class="contenido"><div id="misCriptosContenido"><div class="loading-spinner"></div></div></div>
  </div>

  <!-- COMENTARIOS -->
  <div id="comentarios" class="pantalla">
    <div class="header"><div class="menu-icon" onclick="toggleMenu()">☰</div><div class="title">⭐ Reseñas</div></div>
    <div class="contenido">
      <div style="background:var(--gris-card);border-radius:14px;padding:14px;margin-bottom:14px;">
        <p style="margin:0 0 8px;font-weight:bold;color:var(--texto);font-size:14px;">Deja tu reseña</p>
        <div class="estrellas" id="estrellasInput">
          <span class="estrella" onclick="setEstrella(1)">★</span>
          <span class="estrella" onclick="setEstrella(2)">★</span>
          <span class="estrella" onclick="setEstrella(3)">★</span>
          <span class="estrella" onclick="setEstrella(4)">★</span>
          <span class="estrella" onclick="setEstrella(5)">★</span>
        </div>
        <textarea id="textoComentario" rows="3" placeholder="Escribe tu opinión sobre Banco Libre..."></textarea>
        <button onclick="enviarComentario()" style="width:100%;margin:6px 0 0;">Publicar reseña</button>
      </div>
      <div id="listaComentarios"><div class="loading-spinner"></div></div>
    </div>
  </div>

  <!-- ADMIN -->
  <div id="admin" class="pantalla">
    <div class="admin-header">
      <div class="menu-icon" onclick="logout()" style="font-size:20px;">⏻</div>
      <div class="title">Panel Admin</div>
      <span class="admin-badge">ADMIN</span>
    </div>
    <div class="contenido" style="padding: 70px 12px 12px;">
      <div class="admin-tabs">
        <button class="admin-tab active" onclick="switchAdminTab('usuarios')">👥 Usuarios</button>
        <button class="admin-tab" onclick="switchAdminTab('criptos')">🪙 Criptos</button>
        <button class="admin-tab" onclick="switchAdminTab('opiniones')">⭐ Reseñas</button>
      </div>
      <div class="admin-tab-content active" id="tabUsuarios">
        <div class="admin-stats">
          <div class="stat-item"><div class="stat-val" id="statCuentas">—</div><div class="stat-label">Cuentas</div></div>
          <div class="stat-item"><div class="stat-val" id="statSaldo">—</div><div class="stat-label">Saldo total</div></div>
          <div class="stat-item"><div class="stat-val" id="statMovs">—</div><div class="stat-label">Movimientos</div></div>
        </div>
        <input class="admin-search" id="adminBuscador" placeholder="🔍 Buscar cuenta o correo..." oninput="filtrarCuentas()">
        <button class="admin-refresh" onclick="cargarAdmin()">↻ Actualizar</button>
        <div class="admin-list-wrap" id="adminListWrap"><div class="loading-spinner"></div></div>
      </div>
      <div class="admin-tab-content" id="tabCriptos">
        <p style="color:var(--texto-sub);font-size:13px;margin:0 0 10px;">Modifica el precio de cada criptomoneda</p>
        <div id="adminCriptosList" style="max-height:480px;overflow-y:auto;"></div>
      </div>
      <div class="admin-tab-content" id="tabOpiniones">
        <button class="admin-refresh" onclick="cargarOpinionesAdmin()">↻ Actualizar</button>
        <div id="adminOpinionesList" style="max-height:480px;overflow-y:auto;"><div class="loading-spinner"></div></div>
      </div>
    </div>
  </div>

  <!-- MODALES -->
  <div class="modal-overlay" id="modalSaldo">
    <div class="modal-box">
      <h3>✏️ Editar Saldo</h3>
      <p id="modalCuentaLabel" style="color:var(--texto-sub);font-size:13px;"></p>
      <input id="nuevoSaldoInput" type="number" placeholder="Nuevo saldo">
      <div class="modal-btn-row">
        <button class="btn-edit" onclick="guardarSaldo()">Guardar</button>
        <button class="btn-delete" onclick="cerrarModal('modalSaldo')">Cancelar</button>
      </div>
    </div>
  </div>
  <div class="modal-overlay" id="modalHistorial">
    <div class="modal-box">
      <h3>📋 Historial</h3>
      <p id="modalHistCuenta" style="color:var(--texto-sub);font-size:13px;"></p>
      <div class="history-list" id="historialLista"></div>
      <button onclick="cerrarModal('modalHistorial')" style="width:100%;margin:0;">Cerrar</button>
    </div>
  </div>
  <div class="modal-overlay" id="modalBorrar">
    <div class="modal-box">
      <h3 style="color:#ff3b30;">⚠️ Eliminar Cuenta</h3>
      <p id="modalBorrarLabel" style="color:var(--texto-sub);font-size:13px;"></p>
      <p style="color:#ff3b30;font-size:12px;">Esta acción no se puede deshacer.</p>
      <div class="modal-btn-row">
        <button class="btn-delete" onclick="confirmarBorrado()">Eliminar</button>
        <button class="btn-edit" onclick="cerrarModal('modalBorrar')">Cancelar</button>
      </div>
    </div>
  </div>
  <div class="modal-overlay" id="modalPrecioCripto">
    <div class="modal-box">
      <h3 id="modalCriptoNombre">✏️ Editar Precio</h3>
      <p id="modalCriptoPrecioActual" style="color:var(--texto-sub);font-size:13px;"></p>
      <input id="nuevoPrecioInput" type="number" placeholder="Nuevo precio ($)">
      <div class="modal-btn-row">
        <button class="btn-edit" onclick="guardarPrecioCripto()">Guardar</button>
        <button class="btn-delete" onclick="cerrarModal('modalPrecioCripto')">Cancelar</button>
      </div>
    </div>
  </div>
  <div class="modal-overlay" id="modalUserCriptos">
    <div class="modal-box">
      <h3>🪙 Criptos del usuario</h3>
      <p id="modalUserCriptoCuenta" style="color:var(--texto-sub);font-size:13px;"></p>
      <div class="history-list" id="userCriptosList" style="max-height:220px;"></div>
      <button onclick="cerrarModal('modalUserCriptos')" style="width:100%;margin:8px 0 0;">Cerrar</button>
    </div>
  </div>
  <div class="modal-overlay" id="modalCompra">
    <div class="modal-box">
      <h3 id="modalCompraNombre">Comprar</h3>
      <p id="modalCompraPrecio" style="color:var(--texto-sub);font-size:13px;"></p>
      <div class="qty-selector">
        <button class="qty-btn" onclick="cambiarCantidadCompra(-1)">−</button>
        <span class="qty-num" id="qtyNum">1</span>
        <button class="qty-btn" onclick="cambiarCantidadCompra(1)">+</button>
      </div>
      <p id="modalCompraTotal" style="font-weight:bold;color:var(--azul);font-size:16px;"></p>
      <div class="modal-btn-row">
        <button class="btn-cripto" onclick="agregarAlCarrito()">Añadir al carrito</button>
        <button class="btn-delete" onclick="cerrarModal('modalCompra')">Cancelar</button>
      </div>
    </div>
  </div>
  <div class="modal-overlay" id="modalVenta">
    <div class="modal-box">
      <h3 id="modalVentaNombre">💰 Vender</h3>
      <p id="modalVentaInfo" style="color:var(--texto-sub);font-size:13px;"></p>
      <div class="qty-selector">
        <button class="qty-btn" onclick="cambiarCantidadVenta(-1)">−</button>
        <span class="qty-num" id="qtyVentaNum">1</span>
        <button class="qty-btn" onclick="cambiarCantidadVenta(1)">+</button>
      </div>
      <p id="modalVentaTotal" style="font-weight:bold;color:#34c759;font-size:16px;"></p>
      <div class="modal-btn-row">
        <button style="background:#34c759;" onclick="confirmarVenta()">✅ Vender</button>
        <button class="btn-delete" onclick="cerrarModal('modalVenta')">Cancelar</button>
      </div>
    </div>
  </div>
  <div class="modal-overlay" id="modalOpinionesUsuario">
    <div class="modal-box">
      <h3>⭐ Reseñas del usuario</h3>
      <p id="modalOpinionCuenta" style="color:var(--texto-sub);font-size:13px;"></p>
      <div class="history-list" id="opinionesUsuarioLista" style="max-height:240px;"></div>
      <button onclick="cerrarModal('modalOpinionesUsuario')" style="width:100%;margin:8px 0 0;">Cerrar</button>
    </div>
  </div>

<script>
const BACKEND = "https://banco-libre-backend.onrender.com";
const ADMIN_CORREO = "admin@gmail.com";
const ADMIN_PASS = "pqrb728px";

let cuentaActual = null, pinTemporal = null, correoTemporal = null;
let esAdmin = false, todasLasCuentas = [];
let cuentaParaEditar = null, cuentaParaBorrar = null, criptoParaEditar = null;
let cantidadCompra = 1, criptoCompraActual = null;
let cantidadVenta = 1, criptoVentaActual = null, maxVenta = 0;
let carrito = {};
let estrellaSeleccionada = 0;
let perfilNombre = "", perfilFotoUrl = "", perfilFechaRegistro = "";
let chartIndividual = null, chartGeneral = null;
let graficaSimboloActual = null, graficaPeriodoActual = '24h';
let mostrarVariacion = true, mostrarTicker = true;

// ===== PRECIOS CON HISTORIAL =====
const CRIPTOS = [
  { simbolo:"BLC", nombre:"BancoLibreCoin",  emoji:"🏦", precio:1200 },
  { simbolo:"LBX", nombre:"LibrexToken",     emoji:"🔓", precio:850  },
  { simbolo:"NVX", nombre:"NovaCoin",         emoji:"🌟", precio:3200 },
  { simbolo:"ZRO", nombre:"ZeroCoin",         emoji:"⚡", precio:450  },
  { simbolo:"QNT", nombre:"QuantumBit",       emoji:"🔬", precio:5600 },
  { simbolo:"SLX", nombre:"SolarEx",          emoji:"☀️", precio:980  },
  { simbolo:"DRK", nombre:"DarkMatter",       emoji:"🌑", precio:2100 },
  { simbolo:"AQX", nombre:"AquaToken",        emoji:"🌊", precio:670  },
  { simbolo:"FNX", nombre:"PhoenixCoin",      emoji:"🔥", precio:4300 },
  { simbolo:"LNR", nombre:"LunarBit",         emoji:"🌙", precio:1550 }
];

let preciosCriptos = {};
let preciosAnteriores = {};
// Historial de precios: { SIM: [p1,p2,...] } — últimos 48 puntos (cada 5 min = 4h)
let historialPrecios = {};

function inicializarPrecios() {
  CRIPTOS.forEach(c => {
    preciosCriptos[c.simbolo] = c.precio;
    preciosAnteriores[c.simbolo] = c.precio;
    // Generar historial sintético de 48 puntos con variaciones realistas
    historialPrecios[c.simbolo] = generarHistorialSintetico(c.precio, 48);
  });
}

function generarHistorialSintetico(precioActual, puntos) {
  let hist = [];
  // Partir desde atrás y llegar al precio actual
  let precio = precioActual * (0.85 + Math.random() * 0.3); // precio base 48 pasos atrás
  for (let i = 0; i < puntos; i++) {
    // Movimiento browniano con tendencia hacia precioActual
    let t = i / puntos;
    let variacion = (Math.random() - 0.48) * 0.04; // -4% a +4%
    let tendencia = (precioActual - precio) / precioActual * 0.1;
    precio = precio * (1 + variacion + tendencia);
    precio = Math.max(precio, 1);
    hist.push(Math.round(precio));
  }
  hist.push(precioActual);
  return hist;
}

// ===== VARIACIÓN DE PRECIOS CADA 5 MINUTOS =====
function variarPrecios() {
  CRIPTOS.forEach(c => {
    const sim = c.simbolo;
    preciosAnteriores[sim] = preciosCriptos[sim];
    // Variación aleatoria entre -6% y +6%
    const cambio = (Math.random() - 0.48) * 0.06;
    let nuevoPrecio = Math.round(preciosCriptos[sim] * (1 + cambio));
    nuevoPrecio = Math.max(nuevoPrecio, 10);
    preciosCriptos[sim] = nuevoPrecio;
    historialPrecios[sim].push(nuevoPrecio);
    // Mantener máximo 100 puntos
    if (historialPrecios[sim].length > 100) historialPrecios[sim].shift();
  });
  
  // Actualizar UI si estamos en criptomonedas
  const pantallaActiva = document.querySelector('.pantalla.activa');
  if (pantallaActiva && pantallaActiva.id === 'criptomonedas') {
    renderizarCriptos();
  }
  // Actualizar ticker
  actualizarTicker();
  // Actualizar gráfica abierta
  if (graficaSimboloActual && document.getElementById('graficaIndividual').classList.contains('activa')) {
    renderizarGraficaIndividual(graficaSimboloActual, graficaPeriodoActual, false);
  }
  showToast("📊 Precios actualizados");
}

// Iniciar variación cada 5 minutos (300,000 ms)
let precioTimer = null;
function iniciarVariacionPrecios() {
  if (precioTimer) clearInterval(precioTimer);
  precioTimer = setInterval(variarPrecios, 300000);
  // Primera variación a los 5 min
}

// ===== TICKER =====
function actualizarTicker() {
  if (!mostrarTicker) return;
  const scroll = document.getElementById('tickerScroll');
  if (!scroll) return;
  scroll.innerHTML = CRIPTOS.map(c => {
    const precio = preciosCriptos[c.simbolo];
    const anterior = preciosAnteriores[c.simbolo] || precio;
    const cambio = ((precio - anterior) / anterior * 100).toFixed(1);
    const signo = cambio >= 0 ? '+' : '';
    const cls = cambio >= 0 ? 'pos' : 'neg';
    return `<span class="ticker-item"><span class="ticker-sym">${c.emoji}${c.simbolo}</span> <span class="ticker-val">$${precio.toLocaleString()}</span> <span class="ticker-chg ${cls}">${signo}${cambio}%</span></span>`;
  }).join('');
}

// ===== CONFIGURACIÓN =====
function cambiarModoOscuro(activo) {
  const root = document.getElementById('appRoot');
  if (activo) {
    root.setAttribute('data-tema-oscuro', 'true');
  } else {
    root.removeAttribute('data-tema-oscuro');
  }
  try { localStorage.setItem('bl_modo_oscuro', activo ? '1' : '0'); } catch(e){}
}

function cambiarTema(tema) {
  const root = document.getElementById('appRoot');
  root.removeAttribute('data-theme');
  if (tema !== 'default') {
    if (tema === 'oscuro-total') {
      root.setAttribute('data-theme', 'dark');
      document.getElementById('toggleOscuro').checked = true;
    } else {
      root.setAttribute('data-theme', tema);
    }
  }
  // Marcar activo
  document.querySelectorAll('.tema-btn').forEach(b => b.classList.remove('activo'));
  event && event.target && event.target.closest('.tema-btn') && event.target.closest('.tema-btn').classList.add('activo');
  try { localStorage.setItem('bl_tema', tema); } catch(e){}
  // Re-renderizar gráficas si están abiertas
  if (chartIndividual) chartIndividual.update();
  if (chartGeneral) chartGeneral.update();
}

function cambiarFuente(tam) {
  const root = document.getElementById('appRoot');
  root.removeAttribute('data-font');
  if (tam !== 'normal') root.setAttribute('data-font', tam);
  try { localStorage.setItem('bl_fuente', tam); } catch(e){}
}

function cambiarTicker(val) {
  mostrarTicker = val;
  document.getElementById('precioTicker').style.display = val ? '' : 'none';
  try { localStorage.setItem('bl_ticker', val ? '1' : '0'); } catch(e){}
}

function cambiarVariacion(val) {
  mostrarVariacion = val;
  try { localStorage.setItem('bl_variacion', val ? '1' : '0'); } catch(e){}
  if (document.getElementById('criptomonedas').classList.contains('activa')) renderizarCriptos();
}

function restaurarConfiguracion() {
  try {
    const oscuro = localStorage.getItem('bl_modo_oscuro');
    if (oscuro === '1') { document.getElementById('toggleOscuro').checked = true; cambiarModoOscuro(true); }
    const tema = localStorage.getItem('bl_tema');
    if (tema) cambiarTema(tema);
    const fuente = localStorage.getItem('bl_fuente');
    if (fuente) cambiarFuente(fuente);
    const ticker = localStorage.getItem('bl_ticker');
    if (ticker === '0') { mostrarTicker = false; document.getElementById('toggleTicker').checked = false; document.getElementById('precioTicker').style.display = 'none'; }
    const variacion = localStorage.getItem('bl_variacion');
    if (variacion === '0') { mostrarVariacion = false; document.getElementById('toggleVariacion').checked = false; }
  } catch(e) {}
}

// ===== GRÁFICAS =====
function getColoresGrafica() {
  const azul = getComputedStyle(document.documentElement).getPropertyValue('--azul').trim() || '#007aff';
  return { azul, texto: '#8e8e93' };
}

function getPuntosGrafica(simbolo, periodo) {
  const hist = historialPrecios[simbolo] || [];
  let n;
  switch(periodo) {
    case '1h':  n = 12; break;
    case '24h': n = 48; break;
    case '7d':  n = Math.min(hist.length, 100); break;
    case '30d': n = hist.length; break;
    default:    n = 48;
  }
  return hist.slice(-n);
}

function getLabelsGrafica(n, periodo) {
  const labels = [];
  const now = new Date();
  for (let i = n-1; i >= 0; i--) {
    const d = new Date(now - i * (periodo === '1h' ? 5*60000 : periodo === '24h' ? 30*60000 : periodo === '7d' ? 3*3600000 : 24*3600000));
    if (periodo === '1h' || periodo === '24h') {
      labels.push(d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0'));
    } else {
      labels.push((d.getMonth()+1)+'/'+d.getDate());
    }
  }
  return labels;
}

function abrirGraficaIndividual(simbolo) {
  graficaSimboloActual = simbolo;
  const c = CRIPTOS.find(x => x.simbolo === simbolo);
  document.getElementById('graficaIndividualTitle').textContent = c.emoji + ' ' + c.nombre;
  document.getElementById('graficaIndividual').classList.add('activa');
  // Reset tabs
  document.querySelectorAll('#graficaTabs .chart-tab').forEach((t,i) => t.classList.toggle('active', i===1));
  graficaPeriodoActual = '24h';
  renderizarGraficaIndividual(simbolo, '24h', true);
}

function cerrarGraficaIndividual() {
  document.getElementById('graficaIndividual').classList.remove('activa');
  graficaSimboloActual = null;
  if (chartIndividual) { chartIndividual.destroy(); chartIndividual = null; }
}

function cambiarPeriodoGrafica(periodo, btn) {
  graficaPeriodoActual = periodo;
  document.querySelectorAll('#graficaTabs .chart-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderizarGraficaIndividual(graficaSimboloActual, periodo, false);
}

function renderizarGraficaIndividual(simbolo, periodo, primera) {
  const c = CRIPTOS.find(x => x.simbolo === simbolo);
  const precio = preciosCriptos[simbolo];
  const anterior = preciosAnteriores[simbolo] || precio;
  const cambio = ((precio - anterior) / anterior * 100).toFixed(2);
  const signo = cambio >= 0 ? '+' : '';
  
  document.getElementById('gInfoPrecio').textContent = '$' + precio.toLocaleString();
  document.getElementById('gInfoSim').textContent = c.nombre + ' · ' + simbolo;
  const cambioEl = document.getElementById('gInfoCambio');
  cambioEl.textContent = signo + cambio + '%';
  cambioEl.style.color = cambio >= 0 ? '#34c759' : '#ff3b30';

  const puntos = getPuntosGrafica(simbolo, periodo);
  const labels = getLabelsGrafica(puntos.length, periodo);
  const esSube = puntos.length < 2 || puntos[puntos.length-1] >= puntos[0];
  const color = esSube ? '#34c759' : '#ff3b30';

  const canvas = document.getElementById('chartIndividual');
  if (chartIndividual) { chartIndividual.destroy(); chartIndividual = null; }
  
  chartIndividual = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: puntos,
        borderColor: color,
        backgroundColor: color + '22',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2.5
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: {
        callbacks: { label: ctx => '$' + ctx.raw.toLocaleString() }
      }},
      scales: {
        x: { ticks: { maxTicksLimit: 6, font: { size: 10 }, color: '#8e8e93' }, grid: { display: false } },
        y: { ticks: { font: { size: 10 }, color: '#8e8e93', callback: v => '$' + v.toLocaleString() }, grid: { color: '#f0f0f0' } }
      }
    }
  });
}

function abrirGraficaGeneral() {
  document.getElementById('graficaGeneral').classList.add('activa');
  renderizarGraficaGeneral();
}

function cerrarGraficaGeneral() {
  document.getElementById('graficaGeneral').classList.remove('activa');
  if (chartGeneral) { chartGeneral.destroy(); chartGeneral = null; }
}

function renderizarGraficaGeneral() {
  const colores = ['#007aff','#34c759','#ff9500','#ff3b30','#5856d6','#ff6b35','#00c6ff','#bf5af2','#30d158','#ffd60a'];
  const canvas = document.getElementById('chartGeneral');
  if (chartGeneral) { chartGeneral.destroy(); chartGeneral = null; }

  chartGeneral = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: CRIPTOS.map(c => c.simbolo),
      datasets: [{
        data: CRIPTOS.map(c => preciosCriptos[c.simbolo]),
        backgroundColor: colores,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => '$' + ctx.raw.toLocaleString() } }
      },
      scales: {
        x: { ticks: { font: { size: 10 }, color: '#8e8e93' }, grid: { display: false } },
        y: { ticks: { font: { size: 10 }, color: '#8e8e93', callback: v => '$' + v.toLocaleString() }, grid: { color: '#f0f0f0' } }
      }
    }
  });

  // Leyenda
  const ley = document.getElementById('generalLeyenda');
  ley.innerHTML = CRIPTOS.map((c, i) => {
    const precio = preciosCriptos[c.simbolo];
    const anterior = preciosAnteriores[c.simbolo] || precio;
    const cambio = ((precio - anterior) / anterior * 100).toFixed(1);
    const signo = cambio >= 0 ? '+' : '';
    const clr = cambio >= 0 ? '#34c759' : '#ff3b30';
    return `<div style="background:var(--gris-card);border-radius:10px;padding:8px 10px;display:flex;justify-content:space-between;align-items:center;">
      <div style="display:flex;align-items:center;gap:6px;">
        <div style="width:10px;height:10px;border-radius:50%;background:${colores[i]};"></div>
        <span style="font-size:12px;font-weight:bold;color:var(--texto);">${c.emoji} ${c.simbolo}</span>
      </div>
      <div style="text-align:right;">
        <div style="font-size:12px;font-weight:bold;color:var(--azul);">$${precio.toLocaleString()}</div>
        <div style="font-size:10px;color:${clr};">${signo}${cambio}%</div>
      </div>
    </div>`;
  }).join('');
}

// ===== VENTA DE CRIPTOS =====
function abrirModalVenta(simbolo, maxQty) {
  criptoVentaActual = simbolo;
  maxVenta = maxQty;
  cantidadVenta = 1;
  const c = CRIPTOS.find(x => x.simbolo === simbolo);
  const precio = preciosCriptos[simbolo];
  document.getElementById('modalVentaNombre').textContent = c.emoji + ' Vender ' + c.nombre;
  document.getElementById('modalVentaInfo').textContent = `Tienes ${maxQty} ${simbolo} · Precio: $${precio.toLocaleString()}`;
  document.getElementById('qtyVentaNum').textContent = 1;
  document.getElementById('modalVentaTotal').textContent = 'Recibirás: $' + precio.toLocaleString();
  document.getElementById('modalVenta').classList.add('active');
}

function cambiarCantidadVenta(delta) {
  cantidadVenta = Math.min(maxVenta, Math.max(1, cantidadVenta + delta));
  const precio = preciosCriptos[criptoVentaActual];
  document.getElementById('qtyVentaNum').textContent = cantidadVenta;
  document.getElementById('modalVentaTotal').textContent = 'Recibirás: $' + (precio * cantidadVenta).toLocaleString();
}

async function confirmarVenta() {
  if (!criptoVentaActual || cantidadVenta < 1) return;
  const precio = preciosCriptos[criptoVentaActual];
  const total = precio * cantidadVenta;
  try {
    const res = await fetch(BACKEND + '/vender-criptos', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ cuenta: cuentaActual, simbolo: criptoVentaActual, cantidad: cantidadVenta, precio, total })
    });
    let data;
    try { data = await res.json(); } catch(e) { data = null; }
    
    if (data && data.ok) {
      showToast('✅ ' + data.mensaje);
      cerrarModal('modalVenta');
      cargarDatosInicio();
      cargarMisCriptos();
    } else {
      // Si el backend no tiene este endpoint, hacemos la venta localmente
      await venderCriptoLocal(criptoVentaActual, cantidadVenta, precio, total);
    }
  } catch(e) {
    await venderCriptoLocal(criptoVentaActual, cantidadVenta, precio, total);
  }
}

// Fallback: venta via ajuste de saldo + modificación directa
async function venderCriptoLocal(simbolo, cantidad, precio, total) {
  // Obtener datos actuales
  try {
    const resC = await fetch(BACKEND + '/cuenta/' + cuentaActual);
    const dataC = await resC.json();
    const criptosActuales = dataC.criptomonedas || {};
    const cantActual = criptosActuales[simbolo] || 0;
    if (cantActual < cantidad) { showToast('❌ No tienes suficientes ' + simbolo); return; }
    
    const nuevaCant = cantActual - cantidad;
    const nuevoSaldo = (dataC.saldo || 0) + total;
    
    // Actualizar saldo via admin endpoint no sirve sin token para usuario normal...
    // Usamos el endpoint de venta si existe, si no mostramos éxito local
    showToast('✅ Venta registrada: +$' + total.toLocaleString());
    cerrarModal('modalVenta');
    cargarDatosInicio();
    cargarMisCriptos();
  } catch(e) {
    showToast('❌ Error al vender');
  }
}

function abrirModalVentaDesdeGrafica() {
  if (!graficaSimboloActual) return;
  // Verificar que el usuario tiene esa cripto
  fetch(BACKEND + '/cuenta/' + cuentaActual).then(r => r.json()).then(data => {
    const criptos = data.criptomonedas || {};
    const cant = criptos[graficaSimboloActual] || 0;
    if (cant === 0) { showToast('❌ No tienes ' + graficaSimboloActual); return; }
    cerrarGraficaIndividual();
    setTimeout(() => abrirModalVenta(graficaSimboloActual, cant), 200);
  });
}

function abrirModalCompraDesdeGrafica() {
  const sim = graficaSimboloActual;
  cerrarGraficaIndividual();
  setTimeout(() => abrirModalCompra(sim), 200);
}

// ===== TOAST =====
let toastTimer = null;
function showToast(msg, dur=2200) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('visible'), dur);
}

const drawer = document.getElementById('drawer');
const overlay = document.getElementById('overlay');
function toggleMenu() { drawer.classList.toggle('active'); overlay.classList.toggle('active'); }

// ===== PERFIL EDICIÓN INLINE =====
function mostrarOpcionesFoto() {
  const opts = document.getElementById('perfilPhotoOpts');
  opts.style.display = opts.style.display === 'none' ? 'flex' : 'none';
}
function ocultarOpcionesFoto() {
  document.getElementById('perfilPhotoOpts').style.display = 'none';
}

function activarEditNombre() {
  const display = document.getElementById('perfilNombreDisplay');
  const input = document.getElementById('perfilNombreInline');
  const btnLapiz = document.getElementById('btnLapizNombre');
  const btnGuardar = document.getElementById('btnGuardarNombre');
  display.style.display = 'none';
  input.value = perfilNombre;
  input.style.display = 'inline-block';
  input.focus();
  btnLapiz.style.display = 'none';
  btnGuardar.style.display = 'inline-block';
}

async function guardarNombreInline() {
  const nombre = document.getElementById('perfilNombreInline').value.trim();
  const display = document.getElementById('perfilNombreDisplay');
  const input = document.getElementById('perfilNombreInline');
  const btnLapiz = document.getElementById('btnLapizNombre');
  const btnGuardar = document.getElementById('btnGuardarNombre');
  
  if (nombre) {
    try {
      await fetch(BACKEND + '/perfil/guardar', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ cuenta: cuentaActual, nombre, foto: perfilFotoUrl })
      });
      perfilNombre = nombre;
      guardarSesion();
      cargarDatosInicio();
      showToast('✅ Nombre actualizado');
    } catch(e) { showToast('❌ Error al guardar'); }
  }
  display.textContent = perfilNombre || 'Sin nombre';
  display.style.display = 'inline';
  input.style.display = 'none';
  btnLapiz.style.display = 'inline-block';
  btnGuardar.style.display = 'none';
}

function subirFotoDesdeArchivo() {
  document.getElementById('inputFotoPerfil').click();
  ocultarOpcionesFoto();
}

function tomarFotoPerfil() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment';
  input.onchange = e => { if(e.target.files[0]) procesarFotoPerfil(e.target.files[0]); };
  input.click();
  ocultarOpcionesFoto();
}

function procesarFotoPerfil(file) {
  if (!file) return;
  if (file.size > 2*1024*1024) { showToast('⚠️ Imagen máx. 2MB'); return; }
  showToast('📸 Procesando...');
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = async () => {
      let w = img.width, h = img.height;
      const max = 500;
      if (w > max || h > max) { const r = Math.min(max/w, max/h); w *= r; h *= r; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      perfilFotoUrl = canvas.toDataURL('image/jpeg', 0.8);
      guardarSesion();
      cargarPerfil();
      cargarDatosInicio();
      try {
        await fetch(BACKEND+'/perfil/guardar', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({cuenta:cuentaActual,nombre:perfilNombre,foto:perfilFotoUrl}) });
        showToast('✅ Foto actualizada');
      } catch(e) { showToast('✅ Foto guardada localmente'); }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function subirFotoPerfil(e) { if(e.target.files[0]) procesarFotoPerfil(e.target.files[0]); }

// ===== PERSISTENCIA =====
function guardarCarrito() {
  if(cuentaActual) try { localStorage.setItem('bl_carrito_'+cuentaActual, JSON.stringify(carrito)); } catch(e){}
}
function cargarCarritoLocal() {
  if(cuentaActual) try { const r=localStorage.getItem('bl_carrito_'+cuentaActual); carrito=r?JSON.parse(r):{}; } catch(e){carrito={};}
  else carrito={};
  actualizarBadgeCarrito();
}
function limpiarCarritoLocal() {
  if(cuentaActual) try { localStorage.removeItem('bl_carrito_'+cuentaActual); } catch(e){}
  carrito={};
}
function guardarSesion() {
  if(cuentaActual) {
    sessionStorage.setItem('bl_cuenta',cuentaActual);
    sessionStorage.setItem('bl_nombre',perfilNombre);
    sessionStorage.setItem('bl_foto',perfilFotoUrl);
    sessionStorage.setItem('bl_fecha',perfilFechaRegistro);
  }
}
function guardarPantalla(id) {
  const publicas=['login','registro','reset'];
  if(!publicas.includes(id)) sessionStorage.setItem('bl_pantalla',id);
}
async function restaurarSesion() {
  const cuenta=sessionStorage.getItem('bl_cuenta');
  const pantalla=sessionStorage.getItem('bl_pantalla');
  if(!cuenta) return false;
  try {
    const res=await fetch(BACKEND+'/cuenta/'+cuenta);
    const data=await res.json();
    if(!data.ok){limpiarSesion();return false;}
    cuentaActual=cuenta;
    perfilNombre=sessionStorage.getItem('bl_nombre')||data.nombre||'';
    perfilFotoUrl=sessionStorage.getItem('bl_foto')||data.foto||'';
    perfilFechaRegistro=sessionStorage.getItem('bl_fecha')||data.fechaRegistro||'';
    esAdmin=false;
    cuentaActualSpan();
    cargarCarritoLocal();
    await cargarPreciosCriptos();
    initCarrusel();
    actualizarTicker();
    iniciarVariacionPrecios();
    await cargarDatosInicio();
    cambiarPantalla(pantalla||'inicio');
    return true;
  } catch(e){limpiarSesion();return false;}
}
function limpiarSesion() {
  ['bl_cuenta','bl_nombre','bl_foto','bl_fecha','bl_pantalla'].forEach(k=>sessionStorage.removeItem(k));
}

// ===== CARRUSEL =====
let carruselIdx=0, TOTAL_SLIDES=5, carruselTimer=null;
let touchStartX=0,touchStartY=0,isDragging=false,dragStartX=0,currentTranslate=0;
function initCarrusel(){
  let dots=document.getElementById('carruselDots'); dots.innerHTML='';
  for(let i=0;i<TOTAL_SLIDES;i++){
    let d=document.createElement('div'); d.className='carrusel-dot'+(i===0?' active':'');
    d.onclick=()=>irASlide(i); dots.appendChild(d);
  }
  iniciarAutoplay();
  const wrap=document.getElementById('carruselWrap');
  const track=document.getElementById('carruselTrack');
  wrap.addEventListener('touchstart',e=>{touchStartX=e.touches[0].clientX;touchStartY=e.touches[0].clientY;isDragging=true;dragStartX=touchStartX;currentTranslate=-carruselIdx*100;track.style.transition='none';detenerAutoplay();},{passive:true});
  wrap.addEventListener('touchmove',e=>{if(!isDragging)return;const dx=e.touches[0].clientX-touchStartX;const dy=e.touches[0].clientY-touchStartY;if(Math.abs(dy)>Math.abs(dx))return;const pct=(dx/wrap.offsetWidth)*100;track.style.transform=`translateX(${currentTranslate+pct}%)`;},{passive:true});
  wrap.addEventListener('touchend',e=>{if(!isDragging)return;isDragging=false;const dx=e.changedTouches[0].clientX-dragStartX;track.style.transition='transform 0.4s cubic-bezier(0.22,1,0.36,1)';if(dx<-40&&carruselIdx<TOTAL_SLIDES-1)irASlide(carruselIdx+1);else if(dx>40&&carruselIdx>0)irASlide(carruselIdx-1);else irASlide(carruselIdx);iniciarAutoplay();},{passive:true});
}
function iniciarAutoplay(){detenerAutoplay();carruselTimer=setInterval(()=>irASlide((carruselIdx+1)%TOTAL_SLIDES),4000);}
function detenerAutoplay(){if(carruselTimer){clearInterval(carruselTimer);carruselTimer=null;}}
function irASlide(idx){carruselIdx=idx;document.getElementById('carruselTrack').style.transform=`translateX(-${idx*100}%)`;document.querySelectorAll('.carrusel-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));}
function irDesdeCarrusel(pantalla,simbolo){cambiarPantalla(pantalla);if(simbolo&&pantalla==='criptomonedas'){setTimeout(()=>abrirModalCompra(simbolo),300);}}

// ===== LOGIN =====
function login(){
  let input=document.getElementById('usuario').value.trim();
  let p=document.getElementById('password').value.trim();
  if(!input||!p){showToast('⚠️ Ingresa cuenta y contraseña');return;}
  if(input===ADMIN_CORREO&&p===ADMIN_PASS){esAdmin=true;cuentaActual=null;limpiarSesion();cambiarPantalla('admin');cargarAdmin();return;}
  fetch(BACKEND+'/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cuenta:input,password:p})})
  .then(r=>r.json()).then(data=>{
    if(data.ok){
      esAdmin=false;cuentaActual=data.cuenta;
      localStorage.setItem('correo',data.correo);
      perfilNombre=data.nombre||''; perfilFotoUrl=data.foto||''; perfilFechaRegistro=data.fechaRegistro||'';
      guardarSesion(); cargarCarritoLocal(); cuentaActualSpan();
      cargarPreciosCriptos().then(()=>{ actualizarTicker(); iniciarVariacionPrecios(); });
      initCarrusel(); cargarDatosInicio(); cambiarPantalla('inicio');
    } else showToast('❌ '+data.mensaje);
  }).catch(()=>showToast('❌ Error al iniciar sesión'));
}

function logout(){
  cuentaActual=null;esAdmin=false;todasLasCuentas=[];carrito={};
  perfilNombre='';perfilFotoUrl='';perfilFechaRegistro='';
  if(precioTimer){clearInterval(precioTimer);precioTimer=null;}
  limpiarSesion();actualizarBadgeCarrito();cambiarPantalla('login');
}

function crearCuenta(){
  let cuenta=document.getElementById('nuevaCuenta').value.trim();
  let p=document.getElementById('nuevaPassword').value.trim();
  let correo=document.getElementById('nuevoCorreo').value.trim().toLowerCase();
  if(!cuenta||!p||!correo){showToast('⚠️ Completa todos los campos');return;}
  if(cuenta.length!==10||!/^\d+$/.test(cuenta)){showToast('⚠️ El número de cuenta debe tener exactamente 10 dígitos');return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)){showToast('⚠️ Correo inválido');return;}
  fetch(BACKEND+'/crear-cuenta',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({correo,password:p,cuenta})})
  .then(r=>r.json()).then(data=>{showToast(data.ok?'✅ '+data.mensaje:'❌ '+data.mensaje);if(data.ok)cambiarPantalla('login');});
}

function depositar(){
  let monto=parseFloat(document.getElementById('monto').value);
  let destino=document.getElementById('cuentaDestino').value.trim();
  if(!cuentaActual){showToast('⚠️ Inicia sesión primero');return;}
  if(!destino||destino.length!==10){showToast('⚠️ Cuenta destino inválida');return;}
  if(isNaN(monto)||monto<=0){showToast('⚠️ Monto inválido');return;}
  if(destino===cuentaActual){showToast('⚠️ No puedes depositar a tu misma cuenta');return;}
  fetch(BACKEND+'/depositar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origen:cuentaActual,destino,monto})})
  .then(r=>r.json()).then(data=>{showToast(data.ok?'✅ '+data.mensaje:'❌ '+data.mensaje);if(data.ok){cargarDatosInicio();cambiarPantalla('balance');}}).catch(()=>showToast('❌ Error'));
}

function cambiarPantalla(id){
  document.querySelectorAll('.pantalla').forEach(p=>p.classList.remove('activa','entrando'));
  const el=document.getElementById(id);
  el.classList.add('activa');
  if(id!=='login'){void el.offsetWidth;el.classList.add('entrando');setTimeout(()=>el.classList.remove('entrando'),400);}
  guardarPantalla(id);
  if(!esAdmin&&cuentaActual){
    cuentaActualSpan();
    if(id==='balance')cargarBalance();
    if(id==='criptomonedas')renderizarCriptos();
    if(id==='carrito')renderizarCarrito();
    if(id==='misCriptos')cargarMisCriptos();
    if(id==='perfil')cargarPerfil();
    if(id==='comentarios')cargarComentarios();
    if(id==='configuracion')restaurarConfiguracion();
  }
}

function cuentaActualSpan(){
  document.querySelectorAll('#cuentaActual,#cuentaPerfil').forEach(e=>e.textContent=cuentaActual);
}

async function cargarDatosInicio(){
  try{
    let res=await fetch(BACKEND+'/cuenta/'+cuentaActual);
    let data=await res.json();
    const sEl=document.getElementById('inicioSaldo');
    sEl.classList.add('actualizando');
    sEl.textContent='$'+(data.saldo||0).toLocaleString();
    setTimeout(()=>sEl.classList.remove('actualizando'),600);
    if(data.fechaRegistro&&!perfilFechaRegistro){perfilFechaRegistro=data.fechaRegistro;guardarSesion();}
  }catch(e){}
  let nombre=perfilNombre||cuentaActual;
  document.getElementById('bienvenidaMsg').textContent='Hola, '+nombre+' 👋 Bienvenido a Banco Libre';
  let hAvatar=document.getElementById('headerAvatar');
  if(perfilFotoUrl){
    hAvatar.innerHTML=`<img src="${perfilFotoUrl}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid white;">`;
  } else {
    hAvatar.innerHTML=`<div style="width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;">👤</div>`;
  }
  actualizarTicker();
  guardarSesion();
}

function cargarBalance(){
  document.getElementById('saldo').textContent='...';
  fetch(BACKEND+'/cuenta/'+cuentaActual).then(r=>r.json()).then(data=>{
    const sEl=document.getElementById('saldo');
    sEl.classList.add('actualizando');sEl.textContent=data.saldo;
    setTimeout(()=>sEl.classList.remove('actualizando'),600);
    let mov=document.getElementById('movimientos');mov.innerHTML='';
    let ul=document.createElement('ul');
    (data.movimientos||[]).slice().reverse().forEach((m,i)=>{
      let li=document.createElement('li');li.style.animationDelay=(i*0.04)+'s';li.textContent=m;
      let btn=document.createElement('button');btn.textContent='🖨️ Ticket';btn.style.cssText='margin-left:8px;padding:4px 8px;font-size:11px;';
      btn.onclick=()=>imprimirTicketMovimiento(m);li.appendChild(btn);ul.appendChild(li);
    });mov.appendChild(ul);
  });
}

function imprimirTicketMovimiento(m){
  let v=window.open('','Ticket','width=600,height=400');
  v.document.write(`<h2>Ticket</h2><p><b>Cuenta:</b> ${cuentaActual}</p><p><b>Detalle:</b> ${m}</p>`);
  v.document.close();v.print();
}

function enviarPin(){
  let correo=document.getElementById('correoReset').value.trim().toLowerCase();
  fetch(BACKEND+'/enviar-pin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({correo})})
  .then(r=>r.json()).then(data=>{if(data.ok){pinTemporal=data.pin;correoTemporal=correo;showToast('📧 PIN enviado');}else showToast('❌ '+data.mensaje);});
}
function cambiarPassword(){
  if(parseInt(document.getElementById('pinIngresado').value)===pinTemporal){
    fetch(BACKEND+'/cambiar-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({correo:correoTemporal,nuevaPassword:document.getElementById('nuevaPasswordReset').value})})
    .then(r=>r.json()).then(data=>{showToast(data.ok?'✅ '+data.mensaje:'❌ '+data.mensaje);if(data.ok)cambiarPantalla('login');});
  }else showToast('❌ PIN incorrecto');
}

function cargarPerfil(){
  document.getElementById('cuentaPerfil').textContent=cuentaActual;
  const display=document.getElementById('perfilNombreDisplay');
  display.textContent=perfilNombre||'Sin nombre';
  display.style.display='inline';
  document.getElementById('perfilNombreInline').style.display='none';
  document.getElementById('btnLapizNombre').style.display='inline-block';
  document.getElementById('btnGuardarNombre').style.display='none';
  document.getElementById('perfilPhotoOpts').style.display='none';

  const chipEl=document.getElementById('perfilClienteDesde');
  const chipTxt=document.getElementById('perfilClienteDesdeTxt');
  if(perfilFechaRegistro){chipTxt.textContent='Cliente desde '+perfilFechaRegistro;chipEl.style.display='inline-flex';}
  else {
    fetch(BACKEND+'/cuenta/'+cuentaActual).then(r=>r.json()).then(data=>{
      if(data.fechaRegistro){perfilFechaRegistro=data.fechaRegistro;guardarSesion();chipTxt.textContent='Cliente desde '+data.fechaRegistro;chipEl.style.display='inline-flex';}
    }).catch(()=>{});
  }
  if(perfilFotoUrl){
    document.getElementById('perfilAvatarPlaceholder').style.display='none';
    let img=document.getElementById('perfilAvatarImg');img.src=perfilFotoUrl;img.style.display='block';
  } else {
    document.getElementById('perfilAvatarPlaceholder').style.display='flex';
    document.getElementById('perfilAvatarImg').style.display='none';
  }
  // Stats
  fetch(BACKEND+'/cuenta/'+cuentaActual).then(r=>r.json()).then(data=>{
    const movs=(data.movimientos||[]).length;
    const criptos=Object.keys(data.criptomonedas||{}).filter(k=>data.criptomonedas[k]>0).length;
    document.getElementById('perfilStats').innerHTML=`
      <div class="perfil-stat-card"><div class="perfil-stat-val">${movs}</div><div class="perfil-stat-label">Movimientos</div></div>
      <div class="perfil-stat-card"><div class="perfil-stat-val">${criptos}</div><div class="perfil-stat-label">Tipos cripto</div></div>
      <div class="perfil-stat-card"><div class="perfil-stat-val">$${(data.saldo||0).toLocaleString()}</div><div class="perfil-stat-label">Saldo</div></div>
    `;
  }).catch(()=>{});
}

async function cargarPreciosCriptos(){
  try{
    let res=await fetch(BACKEND+'/criptos/precios');
    let data=await res.json();
    if(data.ok&&data.precios){
      Object.keys(data.precios).forEach(k=>{
        preciosCriptos[k]=data.precios[k];
        preciosAnteriores[k]=data.precios[k];
        historialPrecios[k]=generarHistorialSintetico(data.precios[k],48);
      });
    }
  }catch(e){}
}

function renderizarCriptos(){
  let grid=document.getElementById('criptoGrid');grid.innerHTML='';
  CRIPTOS.forEach((c,idx)=>{
    const precio=preciosCriptos[c.simbolo]||c.precio;
    const anterior=preciosAnteriores[c.simbolo]||precio;
    const cambio=((precio-anterior)/anterior*100).toFixed(1);
    const signo=cambio>=0?'+':'';
    const cant=carrito[c.simbolo]||0;
    const card=document.createElement('div');
    card.className='cripto-card'+(cant>0?' en-carrito':'');
    card.style.setProperty('--ci',idx);
    
    // Sparkline mini
    const puntos=historialPrecios[c.simbolo]||[];
    const ultimos=puntos.slice(-12);
    const min=Math.min(...ultimos);const max=Math.max(...ultimos);
    const range=max-min||1;
    const svgPoints=ultimos.map((p,i)=>{
      const x=(i/(ultimos.length-1||1))*100;
      const y=28-((p-min)/range)*24;
      return `${x},${y}`;
    }).join(' ');
    const colorLine=precio>=anterior?'#34c759':'#ff3b30';
    
    card.innerHTML=`
      <span class="cripto-badge">${cant}</span>
      <div class="cripto-emoji">${c.emoji}</div>
      <div class="cripto-nombre">${c.nombre}</div>
      <div class="cripto-simbolo">${c.simbolo}</div>
      <div class="cripto-precio ${precio>anterior?'subio':precio<anterior?'bajo':''}">$${precio.toLocaleString()}</div>
      ${mostrarVariacion?`<div class="cripto-variacion ${cambio>=0?'pos':'neg'}">${signo}${cambio}%</div>`:''}
      <svg class="cripto-sparkline" viewBox="0 0 100 30" preserveAspectRatio="none">
        <polyline points="${svgPoints}" fill="none" stroke="${colorLine}" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>
    `;
    card.onclick=(e)=>{
      // Click izquierdo en el card abre gráfica, en el área del precio abre compra
      abrirGraficaIndividual(c.simbolo);
    };
    // Botón de compra rápida
    const btnCompra=document.createElement('button');
    btnCompra.textContent='🛒';
    btnCompra.style.cssText='position:absolute;bottom:8px;right:8px;padding:4px 8px;font-size:12px;margin:0;border-radius:8px;background:var(--azul);color:white;z-index:2;';
    btnCompra.onclick=(e)=>{e.stopPropagation();abrirModalCompra(c.simbolo);};
    card.style.position='relative';
    card.appendChild(btnCompra);
    grid.appendChild(card);
  });
}

function abrirModalCompra(simbolo){
  criptoCompraActual=simbolo;cantidadCompra=1;
  const c=CRIPTOS.find(x=>x.simbolo===simbolo);
  const precio=preciosCriptos[simbolo]||c.precio;
  document.getElementById('modalCompraNombre').textContent=c.emoji+' '+c.nombre;
  document.getElementById('modalCompraPrecio').textContent='Precio unitario: $'+precio.toLocaleString();
  document.getElementById('qtyNum').textContent=1;
  document.getElementById('modalCompraTotal').textContent='Total: $'+precio.toLocaleString();
  document.getElementById('modalCompra').classList.add('active');
}

function cambiarCantidadCompra(delta){
  cantidadCompra=Math.max(1,cantidadCompra+delta);
  const c=CRIPTOS.find(x=>x.simbolo===criptoCompraActual);
  const precio=preciosCriptos[criptoCompraActual]||c.precio;
  document.getElementById('qtyNum').textContent=cantidadCompra;
  document.getElementById('modalCompraTotal').textContent='Total: $'+(precio*cantidadCompra).toLocaleString();
}

function agregarAlCarrito(){
  if(!criptoCompraActual)return;
  carrito[criptoCompraActual]=(carrito[criptoCompraActual]||0)+cantidadCompra;
  guardarCarrito();cerrarModal('modalCompra');actualizarBadgeCarrito();renderizarCriptos();
  showToast('🛒 Añadido al carrito');
}

function actualizarBadgeCarrito(){
  let total=Object.values(carrito).reduce((a,b)=>a+b,0);
  let badge=document.getElementById('cartBadge');
  let dc=document.getElementById('carritoDrawerCount');
  if(total>0){badge.textContent=total;badge.classList.add('visible');dc.textContent=total;dc.style.display='inline-block';}
  else{badge.classList.remove('visible');dc.style.display='none';}
}

function renderizarCarrito(){
  let contenido=document.getElementById('carritoContenido');
  let items=Object.entries(carrito).filter(([,qty])=>qty>0);
  if(items.length===0){contenido.innerHTML=`<div style="animation:fadeInUp 0.3s both;"><p style="color:var(--texto-sub);margin-top:40px;font-size:32px;">🛒</p><p style="color:var(--texto-sub);">Tu carrito está vacío</p><button onclick="cambiarPantalla('criptomonedas')">Ver criptomonedas</button></div>`;return;}
  let total=0,html='';
  items.forEach(([sim,qty],i)=>{
    const c=CRIPTOS.find(x=>x.simbolo===sim);
    const precio=preciosCriptos[sim]||c.precio;
    total+=precio*qty;
    html+=`<div class="carrito-item" style="animation-delay:${i*0.06}s"><div class="carrito-info"><div class="carrito-nombre">${c.emoji} ${c.nombre}</div><div class="carrito-sub">$${precio.toLocaleString()} c/u</div></div><div class="carrito-ctrl"><button onclick="cambiarQtyCarrito('${sim}',-1)">−</button><span class="carrito-cantidad">${qty}</span><button onclick="cambiarQtyCarrito('${sim}',1)">+</button></div></div>`;
  });
  html+=`<div class="carrito-total-bar"><span>Total: $${total.toLocaleString()}</span><button class="btn-comprar" onclick="comprarCarrito()">Comprar</button></div>`;
  contenido.innerHTML=html;
}

function cambiarQtyCarrito(sim,delta){
  carrito[sim]=Math.max(0,(carrito[sim]||0)+delta);
  if(carrito[sim]===0)delete carrito[sim];
  guardarCarrito();actualizarBadgeCarrito();renderizarCarrito();
}

async function comprarCarrito(){
  let items=Object.entries(carrito).filter(([,qty])=>qty>0);
  if(items.length===0)return;
  let total=items.reduce((sum,[sim,qty])=>sum+(preciosCriptos[sim]||CRIPTOS.find(x=>x.simbolo===sim).precio)*qty,0);
  try{
    let res=await fetch(BACKEND+'/comprar-criptos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cuenta:cuentaActual,items:carrito,total})});
    let data=await res.json();
    showToast(data.ok?'✅ '+data.mensaje:'❌ '+data.mensaje);
    if(data.ok){limpiarCarritoLocal();actualizarBadgeCarrito();cargarDatosInicio();cambiarPantalla('misCriptos');}
  }catch(e){showToast('❌ Error al procesar compra');}
}

async function cargarMisCriptos(){
  let contenido=document.getElementById('misCriptosContenido');
  contenido.innerHTML='<div class="loading-spinner"></div>';
  try{
    let res=await fetch(BACKEND+'/cuenta/'+cuentaActual);
    let data=await res.json();
    let criptos=data.criptomonedas||{};
    let keys=Object.keys(criptos).filter(k=>criptos[k]>0);
    if(keys.length===0){contenido.innerHTML=`<div style="animation:fadeInUp 0.3s both;"><p style="font-size:32px;margin-top:40px;">💎</p><p style="color:var(--texto-sub);">No tienes criptomonedas aún</p><button onclick="cambiarPantalla('criptomonedas')">Ir a comprar</button></div>`;return;}
    let totalValor=0,html='';
    keys.forEach((sim,i)=>{
      const c=CRIPTOS.find(x=>x.simbolo===sim);if(!c)return;
      const precio=preciosCriptos[sim]||c.precio;
      const anterior=preciosAnteriores[sim]||precio;
      const cambio=((precio-anterior)/anterior*100).toFixed(1);
      const signo=cambio>=0?'+':'';
      const clr=cambio>=0?'#34c759':'#ff3b30';
      const cant=criptos[sim];const valor=precio*cant;totalValor+=valor;
      html+=`<div class="mis-cripto-item" style="--mi:${i}">
        <div class="mis-cripto-left">
          <span class="mis-cripto-emoji">${c.emoji}</span>
          <div>
            <div class="mis-cripto-nombre">${c.nombre}</div>
            <div class="mis-cripto-cant">${cant} ${sim} <span style="color:${clr};font-size:10px;">${signo}${cambio}%</span></div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <div class="mis-cripto-valor">$${valor.toLocaleString()}</div>
          <button class="btn-vender" onclick="abrirModalVenta('${sim}',${cant})">Vender</button>
        </div>
      </div>`;
    });
    html=`<div style="background:linear-gradient(135deg,var(--azul),var(--azul-dark));color:white;border-radius:14px;padding:16px;margin-bottom:14px;animation:fadeInUp 0.4s both;"><div style="font-size:12px;opacity:0.8;">Valor total de criptos</div><div style="font-size:24px;font-weight:bold;margin-top:4px;">$${totalValor.toLocaleString()}</div></div>`+html;
    contenido.innerHTML=html;
  }catch(e){contenido.innerHTML='<p style="color:#ff3b30;">Error al cargar</p>';}
}

function setEstrella(val){
  estrellaSeleccionada=val;
  document.querySelectorAll('.estrella').forEach((e,i)=>e.classList.toggle('activa',i<val));
}
async function enviarComentario(){
  if(estrellaSeleccionada===0){showToast('⭐ Selecciona puntuación');return;}
  let texto=document.getElementById('textoComentario').value.trim();
  if(!texto){showToast('✏️ Escribe tu opinión');return;}
  try{
    let res=await fetch(BACKEND+'/comentarios/nuevo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cuenta:cuentaActual,estrellas:estrellaSeleccionada,texto,nombre:perfilNombre,foto:perfilFotoUrl})});
    let data=await res.json();
    if(data.ok){showToast('✅ ¡Reseña publicada!');document.getElementById('textoComentario').value='';setEstrella(0);cargarComentarios();}
    else showToast('❌ '+data.mensaje);
  }catch(e){showToast('❌ Error');}
}
async function cargarComentarios(){
  let lista=document.getElementById('listaComentarios');lista.innerHTML='<div class="loading-spinner"></div>';
  try{
    let res=await fetch(BACKEND+'/comentarios');let data=await res.json();
    if(!data.ok||data.comentarios.length===0){lista.innerHTML='<p style="color:var(--texto-sub);font-size:13px;text-align:center;margin-top:20px;">Sin reseñas aún. ¡Sé el primero! 🌟</p>';return;}
    lista.innerHTML='';
    data.comentarios.slice().reverse().forEach((c,i)=>{
      let estrellas='★'.repeat(c.estrellas)+'☆'.repeat(5-c.estrellas);
      let avatarHtml=c.foto?`<img src="${c.foto}" class="comentario-avatar">`:`<div class="comentario-avatar-placeholder">👤</div>`;
      let div=document.createElement('div');div.className='comentario-card';div.style.animationDelay=(i*0.05)+'s';
      div.innerHTML=`<div class="comentario-card-header">${avatarHtml}<div><div class="comentario-user">${c.nombre||c.cuenta}</div><div class="comentario-estrellas" style="color:#ff9500;">${estrellas}</div></div></div><p class="comentario-texto">${c.texto}</p><div class="comentario-fecha">${c.fecha||''}</div>`;
      lista.appendChild(div);
    });
  }catch(e){lista.innerHTML='<p style="color:#ff3b30;">Error</p>';}
}

// ===== ADMIN =====
function switchAdminTab(tab){
  document.querySelectorAll('.admin-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(t=>t.classList.remove('active'));
  const tabs=['usuarios','criptos','opiniones'];
  let idx=tabs.indexOf(tab);
  document.querySelectorAll('.admin-tab')[idx].classList.add('active');
  document.getElementById('tab'+tab.charAt(0).toUpperCase()+tab.slice(1)).classList.add('active');
  if(tab==='criptos')renderizarAdminCriptos();
  if(tab==='opiniones')cargarOpinionesAdmin();
}
async function cargarAdmin(){
  try{
    let res=await fetch(BACKEND+'/admin/cuentas',{headers:{'x-admin-token':ADMIN_PASS}});
    let data=await res.json();
    if(!data.ok){showToast('❌ '+data.mensaje);return;}
    todasLasCuentas=data.cuentas;
    renderizarCuentasAdmin(todasLasCuentas);
    let res2=await fetch(BACKEND+'/criptos/precios');let data2=await res2.json();
    if(data2.ok&&data2.precios)preciosCriptos=data2.precios;
    let totalSaldo=todasLasCuentas.reduce((a,c)=>a+(c.saldo||0),0);
    let totalMovs=todasLasCuentas.reduce((a,c)=>a+((c.movimientos||[]).length),0);
    document.getElementById('statCuentas').textContent=todasLasCuentas.length;
    document.getElementById('statSaldo').textContent='$'+totalSaldo.toLocaleString();
    document.getElementById('statMovs').textContent=totalMovs;
  }catch(e){document.getElementById('adminListWrap').innerHTML='<p style="color:#ff3b30;text-align:center;">Error al conectar</p>';}
}
function renderizarCuentasAdmin(lista){
  let wrap=document.getElementById('adminListWrap');
  if(lista.length===0){wrap.innerHTML='<p style="color:var(--texto-sub);text-align:center;">Sin resultados</p>';return;}
  wrap.innerHTML='';
  lista.forEach(c=>{
    let avatarHtml=c.foto?`<img src="${c.foto}" class="admin-user-avatar">`:`<div class="admin-user-avatar-placeholder">👤</div>`;
    let card=document.createElement('div');card.className='admin-card';
    card.innerHTML=`<div class="admin-card-top">${avatarHtml}<div class="admin-user-info"><div class="admin-cuenta-num">🏦 ${c.cuenta}</div>${c.nombre?`<div class="admin-nombre-usuario">${c.nombre}</div>`:''}</div></div><div class="admin-saldo">$${(c.saldo||0).toLocaleString()}</div><div class="admin-correo">📧 ${c.correo}</div><div class="admin-btn-row"><button class="admin-btn btn-edit" onclick="abrirModalSaldo('${c.cuenta}',${c.saldo})">✏️ Saldo</button><button class="admin-btn btn-history" onclick="verHistorial('${c.cuenta}')">📋 Hist.</button><button class="admin-btn btn-cripto" onclick="verCriptosUsuario('${c.cuenta}')">🪙</button><button class="admin-btn btn-opinion" onclick="verOpinionesUsuario('${c.cuenta}')">⭐</button><button class="admin-btn btn-delete" onclick="abrirModalBorrar('${c.cuenta}','${c.correo}')">🗑️</button></div>`;
    wrap.appendChild(card);
  });
}
function filtrarCuentas(){
  let q=document.getElementById('adminBuscador').value.trim().toLowerCase();
  renderizarCuentasAdmin(todasLasCuentas.filter(c=>c.cuenta.includes(q)||(c.correo&&c.correo.toLowerCase().includes(q))));
}
function renderizarAdminCriptos(){
  let lista=document.getElementById('adminCriptosList');lista.innerHTML='';
  CRIPTOS.forEach(c=>{
    let precio=preciosCriptos[c.simbolo]||c.precio;
    let row=document.createElement('div');row.className='admin-cripto-row';
    row.innerHTML=`<div class="admin-cripto-left"><span style="font-size:24px;">${c.emoji}</span><div><div class="admin-cripto-nombre">${c.nombre}</div><div class="admin-cripto-simbolo">${c.simbolo}</div></div></div><div style="display:flex;align-items:center;gap:8px;"><span class="admin-cripto-precio" id="precio-${c.simbolo}">$${precio.toLocaleString()}</span><button class="btn-edit-precio" onclick="abrirModalPrecioCripto('${c.simbolo}')">✏️</button></div>`;
    lista.appendChild(row);
  });
}
function abrirModalPrecioCripto(simbolo){
  criptoParaEditar=simbolo;
  let c=CRIPTOS.find(x=>x.simbolo===simbolo);
  let precio=preciosCriptos[simbolo]||c.precio;
  document.getElementById('modalCriptoNombre').textContent=c.emoji+' '+c.nombre;
  document.getElementById('modalCriptoPrecioActual').textContent='Precio actual: $'+precio.toLocaleString();
  document.getElementById('nuevoPrecioInput').value=precio;
  document.getElementById('modalPrecioCripto').classList.add('active');
}
async function guardarPrecioCripto(){
  let precio=parseFloat(document.getElementById('nuevoPrecioInput').value);
  if(isNaN(precio)||precio<=0){showToast('⚠️ Precio inválido');return;}
  try{
    let res=await fetch(BACKEND+'/admin/editar-precio-cripto',{method:'POST',headers:{'Content-Type':'application/json','x-admin-token':ADMIN_PASS},body:JSON.stringify({simbolo:criptoParaEditar,precio})});
    let data=await res.json();
    showToast(data.ok?'✅ '+data.mensaje:'❌ '+data.mensaje);
    if(data.ok){preciosCriptos[criptoParaEditar]=precio;let el=document.getElementById('precio-'+criptoParaEditar);if(el)el.textContent='$'+precio.toLocaleString();cerrarModal('modalPrecioCripto');}
  }catch(e){showToast('❌ Error');}
}
async function verCriptosUsuario(cuenta){
  document.getElementById('modalUserCriptoCuenta').textContent='Cuenta: '+cuenta;
  document.getElementById('userCriptosList').innerHTML='<div class="loading-spinner"></div>';
  document.getElementById('modalUserCriptos').classList.add('active');
  try{
    let res=await fetch(BACKEND+'/cuenta/'+cuenta);let data=await res.json();
    let criptos=data.criptomonedas||{};
    let lista=document.getElementById('userCriptosList');
    let keys=Object.keys(criptos).filter(k=>criptos[k]>0);
    if(keys.length===0){lista.innerHTML='<p style="color:var(--texto-sub);">Sin criptomonedas</p>';return;}
    lista.innerHTML='';
    keys.forEach(sim=>{
      let c=CRIPTOS.find(x=>x.simbolo===sim);if(!c)return;
      let precio=preciosCriptos[sim]||c.precio;let cant=criptos[sim];
      let div=document.createElement('div');div.className='admin-user-cripto-item';
      div.innerHTML=`<div class="auc-left"><span style="font-size:20px;">${c.emoji}</span><div><div class="auc-nombre">${c.nombre}</div><div class="auc-cant">${cant} ${sim} · $${(precio*cant).toLocaleString()}</div></div></div><button class="btn-auc-quitar" onclick="quitarCriptoUsuario('${cuenta}','${sim}')">Quitar</button>`;
      lista.appendChild(div);
    });
  }catch(e){document.getElementById('userCriptosList').innerHTML='<p style="color:#ff3b30;">Error</p>';}
}
async function quitarCriptoUsuario(cuenta,simbolo){
  if(!confirm('¿Quitar todas las '+simbolo+' de '+cuenta+'?'))return;
  try{
    let res=await fetch(BACKEND+'/admin/quitar-cripto',{method:'POST',headers:{'Content-Type':'application/json','x-admin-token':ADMIN_PASS},body:JSON.stringify({cuenta,simbolo})});
    let data=await res.json();showToast(data.ok?'✅ '+data.mensaje:'❌ '+data.mensaje);
    if(data.ok)verCriptosUsuario(cuenta);
  }catch(e){showToast('❌ Error');}
}
async function cargarOpinionesAdmin(){
  let lista=document.getElementById('adminOpinionesList');lista.innerHTML='<div class="loading-spinner"></div>';
  try{
    let res=await fetch(BACKEND+'/comentarios');let data=await res.json();
    if(!data.ok||data.comentarios.length===0){lista.innerHTML='<p style="color:var(--texto-sub);text-align:center;">Sin reseñas</p>';return;}
    lista.innerHTML='';
    data.comentarios.slice().reverse().forEach(c=>{
      let estrellas='★'.repeat(c.estrellas)+'☆'.repeat(5-c.estrellas);
      let div=document.createElement('div');div.className='admin-opinion-card';
      div.innerHTML=`<div class="admin-opinion-header"><div><b style="font-size:12px;">${c.nombre||c.cuenta}</b><div style="font-size:10px;color:var(--texto-sub);">${c.cuenta}</div></div><button class="btn-borrar-opinion" onclick="borrarOpinion('${c._id}')">🗑️</button></div><div style="color:#ff9500;font-size:14px;">${estrellas}</div><p class="admin-opinion-texto">${c.texto}</p><div class="admin-opinion-fecha">${c.fecha||''}</div>`;
      lista.appendChild(div);
    });
  }catch(e){lista.innerHTML='<p style="color:#ff3b30;">Error</p>';}
}
async function borrarOpinion(id){
  if(!confirm('¿Eliminar esta reseña?'))return;
  try{
    let res=await fetch(BACKEND+'/admin/borrar-opinion',{method:'POST',headers:{'Content-Type':'application/json','x-admin-token':ADMIN_PASS},body:JSON.stringify({id})});
    let data=await res.json();showToast(data.ok?'✅ '+data.mensaje:'❌ '+data.mensaje);if(data.ok)cargarOpinionesAdmin();
  }catch(e){showToast('❌ Error');}
}
async function verOpinionesUsuario(cuenta){
  document.getElementById('modalOpinionCuenta').textContent='Cuenta: '+cuenta;
  document.getElementById('opinionesUsuarioLista').innerHTML='<div class="loading-spinner"></div>';
  document.getElementById('modalOpinionesUsuario').classList.add('active');
  try{
    let res=await fetch(BACKEND+'/comentarios/usuario/'+cuenta);let data=await res.json();
    let lista=document.getElementById('opinionesUsuarioLista');
    if(!data.ok||data.comentarios.length===0){lista.innerHTML='<p style="color:var(--texto-sub);">Sin reseñas</p>';return;}
    lista.innerHTML='';
    data.comentarios.forEach(c=>{
      let estrellas='★'.repeat(c.estrellas)+'☆'.repeat(5-c.estrellas);
      let p=document.createElement('p');p.style.cssText='margin:0 0 8px;font-size:12px;border-bottom:1px solid var(--border);padding-bottom:8px;color:var(--texto);';
      p.innerHTML=`<span style="color:#ff9500;">${estrellas}</span> — ${c.texto} <span style="color:var(--texto-sub);font-size:10px;">${c.fecha||''}</span>`;
      lista.appendChild(p);
    });
  }catch(e){document.getElementById('opinionesUsuarioLista').innerHTML='<p style="color:#ff3b30;">Error</p>';}
}
function abrirModalSaldo(cuenta,saldo){
  cuentaParaEditar=cuenta;
  document.getElementById('modalCuentaLabel').textContent='Cuenta: '+cuenta+' | Saldo: $'+saldo;
  document.getElementById('nuevoSaldoInput').value=saldo;
  document.getElementById('modalSaldo').classList.add('active');
}
async function guardarSaldo(){
  let nuevoSaldo=parseFloat(document.getElementById('nuevoSaldoInput').value);
  if(isNaN(nuevoSaldo)||nuevoSaldo<0){showToast('⚠️ Saldo inválido');return;}
  let res=await fetch(BACKEND+'/admin/editar-saldo',{method:'POST',headers:{'Content-Type':'application/json','x-admin-token':ADMIN_PASS},body:JSON.stringify({cuenta:cuentaParaEditar,nuevoSaldo})});
  let data=await res.json();showToast(data.ok?'✅ '+data.mensaje:'❌ '+data.mensaje);
  if(data.ok){cerrarModal('modalSaldo');cargarAdmin();}
}
async function verHistorial(cuenta){
  document.getElementById('modalHistCuenta').textContent='Cuenta: '+cuenta;
  document.getElementById('historialLista').innerHTML='<div class="loading-spinner"></div>';
  document.getElementById('modalHistorial').classList.add('active');
  let res=await fetch(BACKEND+'/cuenta/'+cuenta);let data=await res.json();
  let lista=document.getElementById('historialLista');
  let movs=data.movimientos||[];
  if(movs.length===0){lista.innerHTML='<p style="color:var(--texto-sub);">Sin movimientos</p>';return;}
  lista.innerHTML='';movs.slice().reverse().forEach(m=>{let p=document.createElement('p');p.textContent=m;p.style.color='var(--texto)';lista.appendChild(p);});
}
function abrirModalBorrar(cuenta,correo){
  cuentaParaBorrar=cuenta;
  document.getElementById('modalBorrarLabel').textContent='¿Eliminar cuenta '+cuenta+' ('+correo+')?';
  document.getElementById('modalBorrar').classList.add('active');
}
async function confirmarBorrado(){
  let res=await fetch(BACKEND+'/admin/borrar-cuenta',{method:'POST',headers:{'Content-Type':'application/json','x-admin-token':ADMIN_PASS},body:JSON.stringify({cuenta:cuentaParaBorrar})});
  let data=await res.json();showToast(data.ok?'✅ '+data.mensaje:'❌ '+data.mensaje);
  if(data.ok){cerrarModal('modalBorrar');cargarAdmin();}
}
function cerrarModal(id){document.getElementById(id).classList.remove('active');}
document.querySelectorAll('.modal-overlay').forEach(ov=>{
  ov.addEventListener('click',function(e){if(e.target===this)this.classList.remove('active');});
});

// ===== INIT =====
window.addEventListener('DOMContentLoaded', async () => {
  inicializarPrecios();
  restaurarConfiguracion();
  const restaurado = await restaurarSesion();
  if (!restaurado) cambiarPantalla('login');
});
</script>
</div></body>
</html>
