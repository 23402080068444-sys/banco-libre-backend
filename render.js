// ================================================================
//  CLAUDE KART — renderer.js
//  Motor pseudo-3D Mode-7 + HUD + Partículas + Sprites + Minimap
//  by Claude (Anthropic) 2026
//  ► Sube este archivo al repo. game.html lo carga con <script src="renderer.js">
// ================================================================

const Renderer = (() => {

  // ── Constantes ───────────────────────────────────────────
  const HORIZON  = 0.44;
  const CAMERA_H = 1.6;
  const ROAD_W   = 2.4;

  const C = {
    sky0:'#060412', sky1:'#1a0848', sky2:'#3d1a8a', sky3:'#7c4dcc',
    road:'#12121e', roadAlt:'#1a1a2e', roadDark:'#0a0a14',
    grass:'#0b3d1f', grassAlt:'#0f4f28',
    curb:'#e63946', curbAlt:'#f1faee',
    mtn:'#0f0c24',
    kartColors:['#e63946','#06d6a0','#ffd166','#118ab2','#f4a261','#c77dff'],
  };

  // ── Helpers ──────────────────────────────────────────────
  const lerp = (a,b,t) => a+(b-a)*t;

  function hexRgb(hex){
    const h=parseInt(hex.replace('#',''),16);
    return [h>>16,(h>>8)&0xff,h&0xff];
  }

  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    if(ctx.roundRect){ ctx.roundRect(x,y,w,h,r); return; }
    ctx.moveTo(x+r,y);
    ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
  }

  // ── Partículas ───────────────────────────────────────────
  const particles = [];

  function spawnDust(x,y,spd=1){
    for(let i=0;i<3;i++) particles.push({
      x,y,
      vx:(Math.random()-.5)*2.2*spd,
      vy:-Math.random()*2.4*spd,
      life:1, r:Math.random()*3.5+2,
      h:28+Math.random()*18|0
    });
  }

  function updateParticles(ctx){
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i];
      p.x+=p.vx; p.y+=p.vy; p.vy+=.13; p.life-=.034;
      if(p.life<=0){particles.splice(i,1);continue;}
      ctx.globalAlpha=p.life*.5;
      ctx.fillStyle=`hsl(${p.h},55%,60%)`;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  // ── Cielo ────────────────────────────────────────────────
  function drawSky(ctx,W,H,frame){
    const hY=H*HORIZON;

    const g=ctx.createLinearGradient(0,0,0,hY);
    g.addColorStop(0,C.sky0); g.addColorStop(.45,C.sky1);
    g.addColorStop(.82,C.sky2); g.addColorStop(1,C.sky3);
    ctx.fillStyle=g; ctx.fillRect(0,0,W,hY);

    // estrellas
    for(let i=0;i<170;i++){
      const sx=((Math.sin(i*137.508+frame*.04)*W*10)%W+W)%W;
      const sy=(Math.cos(i*97.33)*.5+.5)*hY*.88;
      const tw=.5+Math.abs(Math.sin(frame*.045+i))*.85;
      ctx.globalAlpha=.25+tw*.65;
      ctx.fillStyle='#fff';
      ctx.fillRect(sx|0,sy|0,tw>1?2:1,tw>1?2:1);
    }
    ctx.globalAlpha=1;

    // luna
    const mx=W*.78,my=hY*.2;
    const mg=ctx.createRadialGradient(mx,my,0,mx,my,32);
    mg.addColorStop(0,'rgba(255,248,210,1)');
    mg.addColorStop(.55,'rgba(255,228,110,.55)');
    mg.addColorStop(1,'rgba(255,200,0,0)');
    ctx.fillStyle=mg;
    ctx.beginPath(); ctx.arc(mx,my,32,0,Math.PI*2); ctx.fill();

    // montañas lejanas
    ctx.fillStyle=C.mtn;
    ctx.beginPath(); ctx.moveTo(0,hY);
    [0,.17,.09,.07,.19,.14,.32,.03,.44,.12,.56,.06,.67,.13,.77,.04,.87,.11,.95,.08,1,.16]
      .reduce((a,v,i)=>i%2?[...a,v]:[...a,v],[]).forEach((_,i,arr)=>{
        if(i%2===0) ctx.lineTo(arr[i]*W, hY-arr[i+1]*hY*1.12);
      });
    ctx.lineTo(W,hY); ctx.closePath(); ctx.fill();

    // montañas cercanas
    ctx.fillStyle='rgba(8,5,18,.92)';
    ctx.beginPath(); ctx.moveTo(0,hY);
    [0,.08,.14,.03,.27,.09,.39,.02,.52,.07,.64,.03,.75,.08,.87,.02,1,.07]
      .reduce((a,v,i)=>i%2?[...a,v]:[...a,v],[]).forEach((_,i,arr)=>{
        if(i%2===0) ctx.lineTo(arr[i]*W, hY-arr[i+1]*hY*.72);
      });
    ctx.lineTo(W,hY); ctx.closePath(); ctx.fill();
  }

  // ── Piso pseudo-3D (Mode-7) ──────────────────────────────
  function drawGround(ctx,W,H,camX,camZ,camAngle){
    const hY=H*HORIZON|0;
    const rows=H-hY;
    const img=ctx.createImageData(W,rows);
    const d=img.data;
    const sinA=Math.sin(camAngle), cosA=Math.cos(camAngle);

    const [rr,rg,rb]=hexRgb(C.road);
    const [r2,g2,b2]=hexRgb(C.roadAlt);
    const [gr,gg,gb]=hexRgb(C.grass);
    const [g2r,g2g,g2b]=hexRgb(C.grassAlt);
    const [cr,cg,cb]=hexRgb(C.curb);
    const [c2r,c2g,c2b]=hexRgb(C.curbAlt);
    const fR=13,fG=4,fB=26;

    for(let sy=0;sy<rows;sy++){
      const depth=(CAMERA_H*H)/(sy+1+.001);
      const fog=Math.min(1,depth/210);
      const rowZ=camZ+depth*cosA;
      const rowXB=camX-depth*sinA;
      const rowXSt=cosA/W*depth*1.88;

      for(let sx=0;sx<W;sx++){
        const wx=rowXB+rowXSt*sx;
        const wz=rowZ;
        const onRoad=Math.abs(wx)<ROAD_W;
        const stripe=((Math.floor(wz/8)+1000)%2)===0;
        const curbZ=Math.abs(Math.abs(wx)-ROAD_W)<.24;

        let r,g,b;
        if(curbZ){
          r=stripe?cr:c2r; g=stripe?cg:c2g; b=stripe?cb:c2b;
        } else if(onRoad){
          if(Math.abs(wx)<.1&&stripe){r=240;g=215;b=30;}
          else{r=stripe?rr:r2; g=stripe?rg:g2; b=stripe?rb:b2;}
        } else {
          const gs=((Math.floor(wz/14)+Math.floor(wx/4)+1000)%2)===0;
          r=gs?gr:g2r; g=gs?gg:g2g; b=gs?gb:g2b;
        }

        const idx=(sy*W+sx)*4;
        d[idx]  =r+(fR-r)*fog|0;
        d[idx+1]=g+(fG-g)*fog|0;
        d[idx+2]=b+(fB-b)*fog|0;
        d[idx+3]=255;
      }
    }
    ctx.putImageData(img,0,hY);
  }

  // ── Sprite Kart ──────────────────────────────────────────
  function drawKartSprite(ctx,x,y,scale,colorIdx,name,isLocal,frame,starred){
    const col=C.kartColors[colorIdx%C.kartColors.length];
    const w=42*scale, h=25*scale;
    ctx.save();
    ctx.translate(x,y);

    if(starred){ctx.shadowColor='#ffd166';ctx.shadowBlur=20*scale;}

    // sombra
    ctx.fillStyle='rgba(0,0,0,.28)';
    ctx.beginPath(); ctx.ellipse(0,h*.52,w*.5,h*.18,0,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;

    // cuerpo
    ctx.fillStyle=col;
    roundRect(ctx,-w/2,-h*.62,w,h*.88,h*.22); ctx.fill();

    // cabina
    ctx.fillStyle=isLocal?'rgba(255,255,255,.88)':'rgba(150,150,200,.45)';
    roundRect(ctx,-w*.18,-h*.96,w*.38,h*.42,h*.12); ctx.fill();

    // franja
    ctx.fillStyle='rgba(255,255,255,.16)';
    ctx.fillRect(-w/2,-h*.07,w,h*.13);

    // ruedas
    [[-w*.44,-h*.13],[w*.32,-h*.13],[-w*.44,h*.26],[w*.32,h*.26]].forEach(([rx,ry])=>{
      ctx.save(); ctx.translate(rx,ry); ctx.rotate(frame*.24);
      ctx.fillStyle='#0a0a0a';
      ctx.fillRect(-w*.09,-h*.16,w*.18,h*.32);
      ctx.fillStyle='#404040';
      ctx.fillRect(-w*.05,-h*.06,w*.1,h*.12);
      ctx.restore();
    });

    // indicador local
    if(isLocal){
      ctx.fillStyle='rgba(255,215,0,.85)';
      ctx.beginPath();
      ctx.moveTo(0,-h*1.18); ctx.lineTo(w*.1,-h*.9); ctx.lineTo(-w*.1,-h*.9);
      ctx.closePath(); ctx.fill();
    }

    // nombre
    ctx.shadowColor='#000'; ctx.shadowBlur=5;
    ctx.font=`bold ${11*scale}px 'Fredoka One',cursive`;
    ctx.textAlign='center'; ctx.fillStyle='#fff';
    ctx.fillText(name.slice(0,12),0,-h*1.32);
    ctx.shadowBlur=0;
    ctx.restore();
  }

  // ── HUD ──────────────────────────────────────────────────
  function drawHUD(ctx,W,H,{speed,lap,maxLaps,pos,total,item,name,countdown,nitro}){
    const spd=Math.min(speed/5,1);

    // velocímetro
    const px=W-130, py=H-110;
    ctx.save();
    ctx.fillStyle='rgba(6,2,20,.84)';
    roundRect(ctx,px,py,114,98,14); ctx.fill();
    ctx.strokeStyle='rgba(124,77,204,.65)'; ctx.lineWidth=1.5; ctx.stroke();

    ctx.strokeStyle='rgba(255,255,255,.09)'; ctx.lineWidth=10; ctx.lineCap='round';
    ctx.beginPath(); ctx.arc(px+57,py+64,40,Math.PI*.72,Math.PI*.28); ctx.stroke();

    ctx.strokeStyle=spd>.82?'#e63946':spd>.5?'#ffd166':'#06d6a0'; ctx.lineWidth=10;
    ctx.beginPath(); ctx.arc(px+57,py+64,40,Math.PI*.72,Math.PI*.72+spd*Math.PI*1.56); ctx.stroke();

    ctx.fillStyle='#fff'; ctx.font=`bold 18px 'Share Tech Mono',monospace`;
    ctx.textAlign='center'; ctx.fillText(`${speed*18|0}`,px+57,py+69);
    ctx.fillStyle='rgba(255,255,255,.42)'; ctx.font=`9px 'Share Tech Mono',monospace`;
    ctx.fillText('km/h',px+57,py+83);
    ctx.restore();

    // posición
    ctx.save();
    ctx.fillStyle='rgba(6,2,20,.82)';
    roundRect(ctx,10,10,82,54,11); ctx.fill();
    const suf=['st','nd','rd'][pos-1]||'th';
    ctx.font=`bold 30px 'Fredoka One',cursive`;
    ctx.fillStyle='#fff'; ctx.textAlign='left'; ctx.fillText(`${pos}`,22,46);
    ctx.font=`bold 13px 'Fredoka One',cursive`;
    ctx.fillStyle='rgba(255,255,255,.5)'; ctx.fillText(suf,47,46);
    ctx.font=`10px 'Share Tech Mono',monospace`;
    ctx.fillStyle='rgba(124,77,204,.9)'; ctx.fillText(`/${total}`,62,46);
    ctx.restore();

    // vuelta
    ctx.save();
    ctx.textAlign='center';
    ctx.font=`bold 15px 'Share Tech Mono',monospace`;
    ctx.fillStyle='#ffd166'; ctx.fillText(`LAP ${lap}/${maxLaps}`,W/2,30);
    ctx.restore();

    // nombre
    ctx.save();
    ctx.font=`bold 11px 'Share Tech Mono',monospace`;
    ctx.fillStyle='#06d6a0'; ctx.textAlign='left';
    ctx.fillText(name,14,H-118);
    ctx.restore();

    // item
    ctx.save();
    ctx.fillStyle='rgba(6,2,20,.84)';
    roundRect(ctx,10,H-80,62,62,11); ctx.fill();
    ctx.strokeStyle='rgba(124,77,204,.55)'; ctx.lineWidth=1.5; ctx.stroke();
    if(item){
      ctx.font='28px serif'; ctx.textAlign='center'; ctx.fillText(item,41,H-40);
      ctx.font=`9px 'Share Tech Mono',monospace`;
      ctx.fillStyle='rgba(255,255,255,.38)'; ctx.fillText('SPACE',41,H-26);
    } else {
      ctx.font='22px serif'; ctx.textAlign='center';
      ctx.fillStyle='rgba(255,255,255,.12)'; ctx.fillText('?',41,H-40);
    }
    ctx.restore();

    // barra nitro
    if(nitro!==undefined){
      const nh=Math.max(0,Math.min(1,nitro));
      ctx.save();
      ctx.fillStyle='rgba(6,2,20,.72)';
      roundRect(ctx,W-36,H-174,18,104,9); ctx.fill();
      ctx.fillStyle=nh>.6?'#06d6a0':nh>.3?'#ffd166':'#e63946';
      if(nh>0){roundRect(ctx,W-36,H-174+(1-nh)*104,18,nh*104,9); ctx.fill();}
      ctx.font=`8px 'Share Tech Mono',monospace`;
      ctx.fillStyle='rgba(255,255,255,.38)'; ctx.textAlign='center';
      ctx.fillText('NOS',W-27,H-180);
      ctx.restore();
    }

    // countdown
    if(countdown>0){
      const alpha=Math.min(1,(countdown%1)+.22);
      const txt=countdown>=3.5?'READY!':countdown<=.25?'¡GO!':`${Math.ceil(countdown)}`;
      ctx.save();
      ctx.textAlign='center';
      ctx.font=`bold ${W*.17}px 'Fredoka One',cursive`;
      ctx.fillStyle=`rgba(255,215,0,${alpha})`;
      ctx.shadowColor='#e63946'; ctx.shadowBlur=44;
      ctx.fillText(txt,W/2,H/2+34);
      ctx.restore();
    }
  }

  // ── Minimap ──────────────────────────────────────────────
  function drawMinimap(mmCtx,W,H,trackPts,players,localId){
    mmCtx.clearRect(0,0,W,H);
    const cx=W/2, cy=H/2, r=W/2-3;

    mmCtx.fillStyle='rgba(6,2,20,.92)';
    mmCtx.beginPath(); mmCtx.arc(cx,cy,r,0,Math.PI*2); mmCtx.fill();
    mmCtx.strokeStyle='rgba(124,77,204,.65)'; mmCtx.lineWidth=1.5; mmCtx.stroke();

    let minX=1e9,maxX=-1e9,minZ=1e9,maxZ=-1e9;
    trackPts.forEach(p=>{
      if(p.x<minX)minX=p.x; if(p.x>maxX)maxX=p.x;
      if(p.z<minZ)minZ=p.z; if(p.z>maxZ)maxZ=p.z;
    });
    const span=Math.max(maxX-minX,maxZ-minZ)||1;
    const sc=(r*1.72)/span;
    const toX=x=>cx+(x-(minX+maxX)/2)*sc;
    const toY=z=>cy+(z-(minZ+maxZ)/2)*sc;

    mmCtx.strokeStyle='rgba(255,255,255,.2)';
    mmCtx.lineWidth=4; mmCtx.lineCap='round'; mmCtx.lineJoin='round';
    mmCtx.beginPath();
    trackPts.forEach((p,i)=>i===0?mmCtx.moveTo(toX(p.x),toY(p.z)):mmCtx.lineTo(toX(p.x),toY(p.z)));
    mmCtx.closePath(); mmCtx.stroke();

    mmCtx.save();
    mmCtx.beginPath(); mmCtx.arc(cx,cy,r-.5,0,Math.PI*2); mmCtx.clip();
    players.forEach(p=>{
      mmCtx.fillStyle=p.id===localId?'#ffd166':'rgba(255,255,255,.7)';
      mmCtx.beginPath();
      mmCtx.arc(toX(p.x),toY(p.z),p.id===localId?4.5:2.5,0,Math.PI*2);
      mmCtx.fill();
    });
    mmCtx.restore();
  }

  return { HORIZON,ROAD_W,CAMERA_H,KART_COLORS:C.kartColors,
    drawSky,drawGround,drawKartSprite,drawHUD,drawMinimap,
    spawnDust,updateParticles,lerp };
})();
