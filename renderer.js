// ================================================================
//  CLAUDE KART — renderer.js
//  Renderizado top-down 2D con efectos de partículas
// ================================================================

const Renderer = (() => {

  const TRACK_W = 44;
  const KART_COLORS = ['#e63946','#06d6a0','#ffd166','#118ab2','#c77dff'];
  const MAX_PARTICLES = 300;

  const particles = [];

  function addDust(x, y, color='#aaaaaa') {
    if(particles.length >= MAX_PARTICLES) return;
    for(let i = 0; i < 3; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1,
        color,
        size: 2
      });
    }
  }

  function addBoom(x, y) {
    if(particles.length >= MAX_PARTICLES) return;
    for(let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * 3 + 1;
      particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 1,
        color: Math.random() < 0.5 ? '#ffd166' : '#e63946',
        size: Math.random() * 4 + 2
      });
    }
  }

  function updateParticles() {
    for(let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life -= 0.04;
      if(p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles(ctx) {
    for(const p of particles) {
      if(p.life <= 0) continue;
      ctx.globalAlpha = p.life * 0.8;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function buildTrackCanvas(W, H, trackPts) {
    const offscreen = document.createElement('canvas');
    offscreen.width = W;
    offscreen.height = H;
    const otx = offscreen.getContext('2d');

    // Grass
    otx.fillStyle = '#1a3a1a';
    otx.fillRect(0, 0, W, H);

    // Road shadow
    otx.strokeStyle = 'rgba(0,0,0,0.5)';
    otx.lineWidth = TRACK_W + 8;
    otx.lineCap = 'round';
    otx.lineJoin = 'round';
    otx.beginPath();
    trackPts.forEach((p, i) => i === 0 ? otx.moveTo(p.x, p.y) : otx.lineTo(p.x, p.y));
    otx.closePath();
    otx.stroke();

    // Road surface
    otx.strokeStyle = '#2a2a3e';
    otx.lineWidth = TRACK_W;
    otx.beginPath();
    trackPts.forEach((p, i) => i === 0 ? otx.moveTo(p.x, p.y) : otx.lineTo(p.x, p.y));
    otx.closePath();
    otx.stroke();

    // Curbs
    const tangentAt = (i) => {
      const n = trackPts.length - 1;
      const a = trackPts[Math.max(0, i - 1)];
      const b = trackPts[Math.min(n, i + 1)];
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      return { tx: dx/len, ty: dy/len, nx: -dy/len, ny: dx/len };
    };

    for(let edge = 0; edge < 2; edge++) {
      const sign = edge === 0 ? 1 : -1;
      const hw = TRACK_W / 2 * sign;
      for(let i = 0; i < trackPts.length - 1; i++) {
        const { nx, ny } = tangentAt(i);
        const p = trackPts[i];
        const q = trackPts[i + 1];
        const stripe = Math.floor(i / 4) % 2;
        otx.strokeStyle = stripe ? '#e63946' : '#f1faee';
        otx.lineWidth = 5;
        otx.beginPath();
        otx.moveTo(p.x + nx * (hw - sign * 2), p.y + ny * (hw - sign * 2));
        otx.lineTo(q.x + nx * (hw - sign * 2), q.y + ny * (hw - sign * 2));
        otx.stroke();
      }
    }

    // Center dashed line
    otx.setLineDash([12, 10]);
    otx.strokeStyle = 'rgba(255,210,80,0.5)';
    otx.lineWidth = 2;
    otx.beginPath();
    trackPts.forEach((p, i) => i === 0 ? otx.moveTo(p.x, p.y) : otx.lineTo(p.x, p.y));
    otx.closePath();
    otx.stroke();
    otx.setLineDash([]);

    // Start/finish line
    const sp = trackPts[0];
    const { nx, ny } = tangentAt(0);
    otx.strokeStyle = '#ffffff';
    otx.lineWidth = 4;
    otx.beginPath();
    otx.moveTo(sp.x + nx * TRACK_W / 2, sp.y + ny * TRACK_W / 2);
    otx.lineTo(sp.x - nx * TRACK_W / 2, sp.y - ny * TRACK_W / 2);
    otx.stroke();

    for(let k = -2; k <= 2; k++) {
      const even = (k + 10) % 2 === 0;
      otx.fillStyle = even ? '#000' : '#fff';
      otx.fillRect(sp.x + nx * (k * 6) - 3, sp.y + ny * (k * 6) - 3, 6, 6);
    }

    return offscreen;
  }

  function drawItemBoxes(ctx, itemBoxes, frame) {
    for(const b of itemBoxes) {
      if(!b.active) continue;
      const pulse = 0.8 + Math.sin(frame * 0.08) * 0.2;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(frame * 0.03);
      ctx.strokeStyle = `rgba(255,210,80,${pulse})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(-9, -9, 18, 18);
      ctx.fillStyle = `rgba(255,210,80,${pulse * 0.3})`;
      ctx.fillRect(-8, -8, 16, 16);
      ctx.font = '12px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(255,255,255,${pulse})`;
      ctx.fillText('?', 0, 4);
      ctx.restore();
    }
  }

  function drawKart(ctx, k, frame) {
    ctx.save();
    ctx.translate(k.x, k.y);
    ctx.rotate(k.angle);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(2, 3, 14, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = k.stunned > 0 ? '#ff6b6b' : k.color;
    ctx.beginPath();
    ctx.roundRect(-14, -8, 28, 16, 4);
    ctx.fill();

    // Cockpit
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.ellipse(2, -1, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Player indicator dot
    if(k.isPlayer) {
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.arc(2, -1, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wheels
    ctx.fillStyle = '#222';
    [[-10,-9],[8,-9],[-10,7],[8,7]].forEach(([wx, wy]) => {
      ctx.beginPath();
      ctx.roundRect(wx - 4, wy - 3, 8, 6, 2);
      ctx.fill();
    });

    // Rear wing
    ctx.fillStyle = k.color;
    ctx.fillRect(-14, -11, 4, 6);
    ctx.fillRect(-14, 5, 4, 6);

    ctx.restore();

    // Name label
    ctx.save();
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillText(k.name, k.x, k.y - 18);
    ctx.shadowBlur = 0;
    ctx.restore();

    // Item floating above kart
    if(k.item) {
      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.fillText(k.item, k.x, k.y - 30);
    }
  }

  function drawHUD(ctx, W, H, player, maxLaps) {
    // Speed bar
    const spd = Math.abs(player.speed) / 4.2;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.roundRect(W - 120, H - 50, 110, 36, 8);
    ctx.fill();

    const grad = ctx.createLinearGradient(W - 115, 0, W - 15, 0);
    grad.addColorStop(0, '#06d6a0');
    grad.addColorStop(0.6, '#ffd166');
    grad.addColorStop(1, '#e63946');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(W - 115, H - 44, 100 * spd, 24, 4);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${Math.floor(Math.abs(player.speed) * 60)} km/h`, W - 113, H - 25);

    // Item slot
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.roundRect(10, H - 60, 52, 52, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,200,80,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if(player.item) {
      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(player.item, 36, H - 26);
    } else {
      ctx.font = '24px serif';
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.textAlign = 'center';
      ctx.fillText('❓', 36, H - 26);
    }

    // SPACE hint
    if(player.item) {
      ctx.font = '9px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.textAlign = 'center';
      ctx.fillText('ESPACIO', 36, H - 10);
    }
  }

  function drawCountdown(ctx, W, H, countdown) {
    const txt = countdown > 0 ? Math.ceil(countdown).toString() : '¡GO!';
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 80px monospace';
    ctx.fillStyle = '#ffd166';
    ctx.shadowColor = '#e63946';
    ctx.shadowBlur = 20;
    ctx.fillText(txt, W / 2, H / 2 + 30);
    ctx.restore();
  }

  function drawFinish(ctx, W, H, finishOrder, allKarts) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.beginPath();
    ctx.roundRect(W/2 - 170, H/2 - 90, 340, 200, 14);
    ctx.fill();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('¡CARRERA TERMINADA!', W/2, H/2 - 58);

    const medals = ['🥇','🥈','🥉','4to','5to'];
    const ordered = [...finishOrder, ...allKarts.filter(k => !finishOrder.includes(k)).sort((a,b) => b.progress - a.progress)];
    ordered.forEach((k, i) => {
      ctx.fillStyle = k.isPlayer ? '#ffd166' : '#aaa';
      ctx.font = `${k.isPlayer ? 'bold ' : ''}16px monospace`;
      ctx.fillText(`${medals[i] || (i+1)+'°'}  ${k.name}`, W/2, H/2 - 22 + i * 28);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '12px monospace';
    ctx.fillText('Presiona F5 para reiniciar', W/2, H/2 + 118);
  }

  return {
    TRACK_W,
    KART_COLORS,
    addDust,
    addBoom,
    updateParticles,
    drawParticles,
    buildTrackCanvas,
    drawItemBoxes,
    drawKart,
    drawHUD,
    drawCountdown,
    drawFinish
  };

})();
