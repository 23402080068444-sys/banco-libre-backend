// ================================================================
//  CLAUDE KART — renderer.js v2.0
//  Motor de renderizado con cámara desde arriba + efectos mejorados
// ================================================================

const Renderer = (() => {

  const HORIZON  = 0.55;  // Horizonte más bajo para ver más pista
  const CAMERA_H = 2.8;   // Cámara más alta (vista desde arriba)
  const ROAD_W   = 3.2;   // Pista más ancha

  const C = {
    sky0:'#0a0a2a', sky1:'#1a0a3a', sky2:'#2a0a4a', sky3:'#3a1a6a',
    road:'#1a1a2e', roadAlt:'#252540', roadDark:'#0a0a14',
    grass:'#0a4a2a', grassAlt:'#0d5a35', grassLight:'#155a35',
    curb:'#e63946', curbAlt:'#f1faee',
    mtn:'#0f0c24', mtnLight:'#1a1440',
    roadLine:'#ffd166',
    kartColors:['#e63946','#06d6a0','#ffd166','#118ab2','#f4a261','#c77dff','#ff6b6b','#4ecdc4']
  };

  const lerp = (a,b,t) => a+(b-a)*t;

  function hexRgb(hex){
    const h=parseInt(hex.replace('#',''),16);
    return [h>>16,(h>>8)&0xff,h&0xff];
  }

  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
  }

  // Sistema de partículas mejorado
  const particles = [];

  function spawnDust(x, z, speed=1, color='gold'){
    for(let i=0;i<5;i++){
      particles.push({
        x: x + (Math.random() - 0.5) * 2,
        z: z + (Math.random() - 0.5) * 2,
        vx: (Math.random() - 0.5) * 3 * speed,
        vz: (Math.random() - 0.5) * 3 * speed - speed * 1.5,
        life: 1,
        size: Math.random() * 5 + 3,
        color: color,
        type: 'dust'
      });
    }
  }

  function spawnItemEffect(x, z, itemType){
    for(let i=0;i<15;i++){
      particles.push({
        x: x + (Math.random() - 0.5) * 3,
        z: z + (Math.random() - 0.5) * 3,
        vx: (Math.random() - 0.5) * 8,
        vz: (Math.random() - 0.5) * 8,
        life: 1,
        size: Math.random() * 6 + 2,
        color: itemType === '🍄' ? '#ff6b6b' : itemType === '⚡' ? '#ffd166' : '#06d6a0',
        type: 'item'
      });
    }
  }

  function updateParticles(ctx, camX, camZ){
    for(let i=particles.length-1; i>=0; i--){
      const p = particles[i];
      p.x += p.vx;
      p.z += p.vz;
      p.vz *= 0.98;
      p.vx *= 0.98;
      p.life -= 0.025;
      
      if(p.life <= 0 || Math.abs(p.x - camX) > 30 || Math.abs(p.z - camZ) > 30){
        particles.splice(i,1);
        continue;
      }
      
      // No dibujar aquí - se dibujará en el render principal
    }
  }

  function drawSky(ctx, W, H, frame){
    const hY = H * HORIZON;
    const grad = ctx.createLinearGradient(0, 0, 0, hY);
    grad.addColorStop(0, C.sky0);
    grad.addColorStop(0.4, C.sky1);
    grad.addColorStop(0.7, C.sky2);
    grad.addColorStop(1, C.sky3);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, hY);

    // Estrellas parpadeantes
    for(let i=0;i<200;i++){
      const sx = ((Math.sin(i * 137.5 + frame * 0.02) * W * 3) % W + W) % W;
      const sy = (Math.cos(i * 97.3) * 0.5 + 0.5) * hY * 0.85;
      const tw = 0.8 + Math.abs(Math.sin(frame * 0.03 + i)) * 1.2;
      ctx.globalAlpha = 0.3 + tw * 0.5;
      ctx.fillStyle = `rgba(255,255,200,${0.3 + Math.sin(frame * 0.05 + i) * 0.3})`;
      ctx.fillRect(sx|0, sy|0, tw, tw);
    }
    ctx.globalAlpha = 1;

    // Luna
    const lx = W * 0.82, ly = hY * 0.15;
    const moonGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, 28);
    moonGrad.addColorStop(0, 'rgba(255,248,210,1)');
    moonGrad.addColorStop(0.6, 'rgba(255,228,110,0.7)');
    moonGrad.addColorStop(1, 'rgba(255,200,0,0)');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(lx, ly, 28, 0, Math.PI*2);
    ctx.fill();

    // Montañas
    ctx.fillStyle = C.mtn;
    ctx.beginPath();
    ctx.moveTo(0, hY);
    for(let i=0; i<=W; i+=30){
      const y = hY - Math.sin(i * 0.008 + frame * 0.01) * 35 - 25;
      ctx.lineTo(i, y);
    }
    ctx.lineTo(W, hY);
    ctx.fill();

    ctx.fillStyle = C.mtnLight;
    ctx.beginPath();
    ctx.moveTo(0, hY);
    for(let i=0; i<=W; i+=25){
      const y = hY - Math.sin(i * 0.012 + frame * 0.008) * 22 - 12;
      ctx.lineTo(i, y);
    }
    ctx.lineTo(W, hY);
    ctx.fill();
  }

  function drawGround(ctx, W, H, camX, camZ, camAngle){
    const hY = H * HORIZON;
    const rows = H - hY;
    const img = ctx.createImageData(W, rows);
    const d = img.data;
    const sinA = Math.sin(camAngle);
    const cosA = Math.cos(camAngle);

    const [rr,rg,rb] = hexRgb(C.road);
    const [r2,g2,b2] = hexRgb(C.roadAlt);
    const [gr,gg,gb] = hexRgb(C.grass);
    const [g2r,g2g,g2b] = hexRgb(C.grassAlt);
    const [cr,cg,cb] = hexRgb(C.curb);
    const [c2r,c2g,c2b] = hexRgb(C.curbAlt);
    const [lr,lg,lb] = hexRgb(C.roadLine);
    
    const fR = 10, fG = 8, fB = 25;

    for(let sy = 0; sy < rows; sy++){
      const depth = (CAMERA_H * H) / (sy + 1 + 0.5);
      const fog = Math.min(1, depth / 180);
      const rowZ = camZ + depth * cosA;
      const rowXB = camX - depth * sinA;
      const rowXSt = cosA / W * depth * 1.88;

      for(let sx = 0; sx < W; sx++){
        const wx = rowXB + rowXSt * sx;
        const wz = rowZ;
        const onRoad = Math.abs(wx) < ROAD_W;
        const stripe = (Math.floor(wz / 6) + 1000) % 2 === 0;
        const curbZ = Math.abs(Math.abs(wx) - ROAD_W) < 0.28;
        const centerLine = Math.abs(wx) < 0.12 && stripe;

        let r,g,b;
        if(centerLine){
          r=lr; g=lg; b=lb;
        } else if(curbZ){
          r=stripe?cr:c2r; g=stripe?cg:c2g; b=stripe?cb:c2b;
        } else if(onRoad){
          const darkSpots = Math.sin(wz * 0.5) * 20;
          r = (stripe ? rr : r2) + darkSpots;
          g = (stripe ? rg : g2) + darkSpots;
          b = (stripe ? rb : b2) + darkSpots;
        } else {
          const gs = ((Math.floor(wz / 16) + Math.floor(wx / 5) + 1000) % 2) === 0;
          r = gs ? gr : g2r;
          g = gs ? gg : g2g;
          b = gs ? gb : g2b;
          // Árboles decorativos (simulados con variación de color)
          if(Math.abs(Math.sin(wz * 0.3) * Math.cos(wx * 0.5)) > 0.95 && Math.random() > 0.99){
            const treeDark = 40;
            r = Math.max(0, r - treeDark);
            g = Math.max(0, g - treeDark/2);
            b = Math.max(0, b - treeDark);
          }
        }

        const idx = (sy * W + sx) * 4;
        d[idx]   = Math.min(255, r + (fR - r) * fog);
        d[idx+1] = Math.min(255, g + (fG - g) * fog);
        d[idx+2] = Math.min(255, b + (fB - b) * fog);
        d[idx+3] = 255;
      }
    }
    ctx.putImageData(img, 0, hY);
  }

  function drawKartSprite(ctx, x, y, scale, colorIdx, name, isLocal, frame, starred){
    const col = C.kartColors[colorIdx % C.kartColors.length];
    const w = 48 * scale;
    const h = 28 * scale;
    
    ctx.save();
    ctx.translate(x, y);
    
    if(starred){
      ctx.shadowColor = '#ffd166';
      ctx.shadowBlur = 15 * scale;
    }

    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, h * 0.55, w * 0.55, h * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Cuerpo principal
    ctx.fillStyle = col;
    roundRect(ctx, -w/2, -h * 0.65, w, h * 0.92, h * 0.25);
    ctx.fill();

    // Ventana (cockpit)
    ctx.fillStyle = isLocal ? 'rgba(255,255,255,0.9)' : 'rgba(150,150,200,0.6)';
    roundRect(ctx, -w * 0.22, -h * 0.98, w * 0.44, h * 0.48, h * 0.15);
    ctx.fill();

    // Detalles del carro
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(-w/2, -h * 0.08, w, h * 0.16);
    
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(-w/2 + 5, -h * 0.55, w - 10, 4);
    
    // Ruedas
    const wheelPos = [[-w*0.45, -h*0.12], [w*0.32, -h*0.12], [-w*0.45, h*0.28], [w*0.32, h*0.28]];
    wheelPos.forEach(([rx, ry]) => {
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(frame * 0.3);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-w*0.1, -h*0.18, w*0.2, h*0.36);
      ctx.fillStyle = '#444';
      ctx.fillRect(-w*0.06, -h*0.08, w*0.12, h*0.16);
      ctx.restore();
    });

    // Ala trasera
    ctx.fillStyle = col;
    ctx.fillRect(-w*0.35, -h*0.88, w*0.7, 6);
    ctx.fillRect(-w*0.25, -h*0.98, 6, h*0.2);
    ctx.fillRect(w*0.19, -h*0.98, 6, h*0.2);

    // Corona para el líder
    if(isLocal && starred){
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      for(let i=0; i<5; i++){
        const ang = frame * 0.1 + i * Math.PI * 2 / 5;
        const cx = Math.cos(ang) * w * 0.4;
        const cy = Math.sin(ang) * h * 0.5 - h * 0.95;
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 4, cy - 8);
        ctx.lineTo(cx - 4, cy - 8);
        ctx.closePath();
      }
      ctx.fill();
    }

    // Nombre del jugador
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.font = `bold ${12 * scale}px 'Segoe UI', 'Fredoka One', cursive`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText(name.slice(0, 12), 0, -h * 1.45);
    ctx.shadowBlur = 0;
    
    ctx.restore();
  }

  function drawHUD(ctx, W, H, {speed, lap, maxLaps, pos, total, item, name, countdown, nitro}){
    const spd = Math.min(speed / 5, 1);
    
    // Velocímetro circular
    const px = W - 130, py = H - 110;
    ctx.save();
    ctx.fillStyle = 'rgba(6,2,20,0.88)';
    roundRect(ctx, px, py, 114, 98, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(124,77,204,0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(px + 57, py + 64, 40, Math.PI * 0.72, Math.PI * 0.28);
    ctx.stroke();

    const speedColor = spd > 0.82 ? '#e63946' : spd > 0.5 ? '#ffd166' : '#06d6a0';
    ctx.strokeStyle = speedColor;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(px + 57, py + 64, 40, Math.PI * 0.72, Math.PI * 0.72 + spd * Math.PI * 1.56);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = `bold 20px 'Share Tech Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(speed * 18)}`, px + 57, py + 69);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = `10px 'Share Tech Mono', monospace`;
    ctx.fillText('km/h', px + 57, py + 83);
    ctx.restore();

    // Posición
    ctx.save();
    ctx.fillStyle = 'rgba(6,2,20,0.85)';
    roundRect(ctx, 10, 10, 90, 58, 12);
    ctx.fill();
    const suffix = ['st','nd','rd'][pos-1] || 'th';
    ctx.font = `bold 34px 'Fredoka One', cursive`;
    ctx.fillStyle = '#ffd166';
    ctx.textAlign = 'left';
    ctx.fillText(`${pos}`, 22, 50);
    ctx.font = `bold 14px 'Fredoka One', cursive`;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(suffix, 52, 50);
    ctx.font = `11px 'Share Tech Mono', monospace`;
    ctx.fillStyle = 'rgba(124,77,204,0.9)';
    ctx.fillText(`/${total}`, 68, 50);
    ctx.restore();

    // Vuelta
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `bold 18px 'Share Tech Mono', monospace`;
    ctx.fillStyle = '#ffd166';
    ctx.fillText(`LAP ${lap}/${maxLaps}`, W/2, 35);
    ctx.restore();

    // Nombre del jugador
    ctx.save();
    ctx.font = `bold 14px 'Share Tech Mono', monospace`;
    ctx.fillStyle = '#06d6a0';
    ctx.textAlign = 'left';
    ctx.fillText(name, 14, H - 115);
    ctx.restore();

    // Item
    ctx.save();
    ctx.fillStyle = 'rgba(6,2,20,0.88)';
    roundRect(ctx, 10, H - 85, 70, 70, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(124,77,204,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    if(item){
      ctx.font = `38px 'Segoe UI Emoji'`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(item, 45, H - 38);
      ctx.font = `10px 'Share Tech Mono', monospace`;
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('SPACE', 45, H - 22);
    } else {
      ctx.font = `32px 'Segoe UI Emoji'`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillText('❓', 45, H - 38);
    }
    ctx.restore();

    // Nitro
    if(nitro !== undefined){
      const nh = Math.max(0, Math.min(1, nitro));
      ctx.save();
      ctx.fillStyle = 'rgba(6,2,20,0.8)';
      roundRect(ctx, W - 42, H - 170, 22, 110, 8);
      ctx.fill();
      
      const grad = ctx.createLinearGradient(W - 42, H - 170 + (1-nh)*110, W - 42, H - 170 + 110);
      if(nh > 0.6) grad.addColorStop(0, '#06d6a0');
      else if(nh > 0.3) grad.addColorStop(0, '#ffd166');
      else grad.addColorStop(0, '#e63946');
      grad.addColorStop(1, '#ff6b6b');
      
      ctx.fillStyle = grad;
      if(nh > 0){
        roundRect(ctx, W - 42, H - 170 + (1-nh)*110, 22, nh*110, 8);
        ctx.fill();
      }
      
      ctx.font = `9px 'Share Tech Mono', monospace`;
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.textAlign = 'center';
      ctx.fillText('NOS', W - 31, H - 175);
      ctx.restore();
    }

    // Countdown
    if(countdown > 0){
      const alpha = Math.min(1, (countdown % 1) + 0.3);
      let txt = countdown >= 3.5 ? 'READY!' : countdown <= 0.25 ? 'GO!' : `${Math.ceil(countdown)}`;
      const size = countdown <= 0.5 ? W * 0.2 : W * 0.15;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = `bold ${size}px 'Fredoka One', cursive`;
      ctx.fillStyle = `rgba(255,215,0,${alpha})`;
      ctx.shadowColor = '#e63946';
      ctx.shadowBlur = 20;
      ctx.fillText(txt, W/2, H/2 + 40);
      ctx.restore();
    }
  }

  function drawMinimap(mmCtx, W, H, trackPts, players, localId, frame){
    mmCtx.clearRect(0, 0, W, H);
    const cx = W/2, cy = H/2;
    const r = Math.min(W, H)/2 - 5;

    mmCtx.fillStyle = 'rgba(6,2,20,0.95)';
    mmCtx.beginPath();
    mmCtx.arc(cx, cy, r, 0, Math.PI*2);
    mmCtx.fill();
    mmCtx.strokeStyle = 'rgba(124,77,204,0.8)';
    mmCtx.lineWidth = 2;
    mmCtx.stroke();

    let minX=1e9,maxX=-1e9,minZ=1e9,maxZ=-1e9;
    trackPts.forEach(p=>{
      minX=Math.min(minX,p.x); maxX=Math.max(maxX,p.x);
      minZ=Math.min(minZ,p.z); maxZ=Math.max(maxZ,p.z);
    });
    const span = Math.max(maxX-minX, maxZ-minZ) || 1;
    const scale = (r * 1.6) / span;
    const toX = x => cx + (x - (minX+maxX)/2) * scale;
    const toZ = z => cy + (z - (minZ+maxZ)/2) * scale;

    mmCtx.strokeStyle = 'rgba(255,255,255,0.3)';
    mmCtx.lineWidth = 3;
    mmCtx.lineCap = 'round';
    mmCtx.beginPath();
    trackPts.forEach((p,i)=>{
      if(i===0) mmCtx.moveTo(toX(p.x), toZ(p.z));
      else mmCtx.lineTo(toX(p.x), toZ(p.z));
    });
    mmCtx.closePath();
    mmCtx.stroke();

    mmCtx.save();
    mmCtx.beginPath();
    mmCtx.arc(cx, cy, r-1, 0, Math.PI*2);
    mmCtx.clip();
    
    players.forEach(p=>{
      const isLocal = p.id === localId;
      const x = toX(p.x);
      const z = toZ(p.z);
      mmCtx.fillStyle = isLocal ? '#ffd166' : `hsl(${p.color * 60}, 70%, 60%)`;
      mmCtx.shadowBlur = isLocal ? 6 : 0;
      mmCtx.shadowColor = '#ffd166';
      mmCtx.beginPath();
      mmCtx.arc(x, z, isLocal ? 6 : 4, 0, Math.PI*2);
      mmCtx.fill();
      
      // Dirección del jugador
      mmCtx.strokeStyle = '#fff';
      mmCtx.lineWidth = 2;
      mmCtx.beginPath();
      const dirX = Math.cos(p.angle) * (isLocal ? 8 : 5);
      const dirZ = Math.sin(p.angle) * (isLocal ? 8 : 5);
      mmCtx.moveTo(x, z);
      mmCtx.lineTo(x + dirX, z + dirZ);
      mmCtx.stroke();
    });
    mmCtx.restore();
    
    mmCtx.shadowBlur = 0;
  }

  function drawParticles(ctx, camX, camZ, W, H, scale){
    for(const p of particles){
      if(p.life <= 0) continue;
      
      const screenX = W/2 + (p.x - camX) * scale;
      const screenY = H/2 + (p.z - camZ) * scale;
      
      if(screenX < -50 || screenX > W+50 || screenY < -50 || screenY > H+50) continue;
      
      ctx.globalAlpha = p.life * 0.7;
      ctx.fillStyle = p.color || '#ffd166';
      ctx.beginPath();
      ctx.arc(screenX, screenY, p.size * p.life, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  return {
    HORIZON, ROAD_W, CAMERA_H,
    KART_COLORS: C.kartColors,
    drawSky, drawGround, drawKartSprite,
    drawHUD, drawMinimap,
    spawnDust, spawnItemEffect, updateParticles, drawParticles,
    lerp
  };
})();
