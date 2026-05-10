// ================================================================
//  CLAUDE KART — Motor Mejorado v2.0
//  Cámara desde arriba + Visuales mejorados + Animaciones
// ================================================================

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Configuración de cámara (vista desde arriba)
        this.camera = {
            x: 0, z: 0,
            zoom: 1.2,
            followSpeed: 0.12,
            offsetX: 0,
            offsetZ: 0
        };
        
        // Estado del juego
        this.raceState = 'countdown'; // 'countdown', 'racing', 'finished'
        this.countdown = 4;
        this.frame = 0;
        this.lastTimestamp = 0;
        
        // Pista (circuito ovalado)
        this.track = this.generateTrack();
        
        // Jugadores
        this.players = [];
        this.localPlayerId = 'local';
        this.maxLaps = 3;
        
        // Items
        this.items = ['🍄', '⭐', '⚡', '🛡️', '📦'];
        
        // Efectos visuales
        this.particles = [];
        this.screenShake = 0;
        this.flashEffect = 0;
        
        // Controles
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        };
        
        this.init();
    }
    
    generateTrack() {
        // Pista ovalada más suave y con curvas pronunciadas
        const points = [];
        const segments = 120;
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const angle = t * Math.PI * 2;
            
            // Forma de pista: óvalo con lados rectos
            let x, z;
            if (angle < Math.PI / 2) {
                // Curva superior derecha
                const a = angle / (Math.PI / 2);
                x = Math.sin(a * Math.PI / 2) * 45;
                z = Math.cos(a * Math.PI / 2) * 35;
            } else if (angle < Math.PI) {
                // Lado izquierdo
                const a = (angle - Math.PI / 2) / (Math.PI / 2);
                x = 45 - a * 90;
                z = -35 + a * 70;
            } else if (angle < Math.PI * 1.5) {
                // Curva inferior izquierda
                const a = (angle - Math.PI) / (Math.PI / 2);
                x = -45 + Math.sin(a * Math.PI / 2) * 45;
                z = 35 - Math.cos(a * Math.PI / 2) * 35;
            } else {
                // Lado derecho
                const a = (angle - Math.PI * 1.5) / (Math.PI / 2);
                x = -45 + a * 90;
                z = -35 + a * 70;
            }
            
            points.push({ x, z });
        }
        
        return points;
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Crear jugadores
        this.players = [
            { id: 'local', name: 'YOU', x: 0, z: 0, angle: 0, speed: 0, lap: 0, checkpoint: 0, position: 1, item: null, nitro: 0, color: 0, ai: false },
            { id: 'ai1', name: 'BLAZE', x: 0, z: 0, angle: 0.5, speed: 0, lap: 0, checkpoint: 0, position: 2, item: null, nitro: 0, color: 1, ai: true, aiTarget: 0 },
            { id: 'ai2', name: 'SHADOW', x: 0, z: 0, angle: 1.2, speed: 0, lap: 0, checkpoint: 0, position: 3, item: null, nitro: 0, color: 2, ai: true, aiTarget: 0 },
            { id: 'ai3', name: 'NOVA', x: 0, z: 0, angle: 1.8, speed: 0, lap: 0, checkpoint: 0, position: 3, item: null, nitro: 0, color: 4, ai: true, aiTarget: 0 }
        ];
        
        // Posicionar jugadores en la pista
        this.players.forEach((p, idx) => {
            const startPos = this.getTrackPosition(idx * 0.3);
            p.x = startPos.x;
            p.z = startPos.z;
            p.angle = startPos.angle;
        });
        
        this.animate();
    }
    
    resize() {
        const size = Math.min(window.innerWidth - 40, window.innerHeight - 40, 1200);
        this.canvas.width = size;
        this.canvas.height = size * 0.75;
        this.canvas.style.width = `${size}px`;
        this.canvas.style.height = `${size * 0.75}px`;
    }
    
    handleKeyDown(e) {
        if (e.key === ' ' || e.key === 'Space') {
            e.preventDefault();
            this.keys.Space = true;
            this.useItem();
        }
        if (this.keys.hasOwnProperty(e.key)) {
            this.keys[e.key] = true;
            e.preventDefault();
        }
    }
    
    handleKeyUp(e) {
        if (this.keys.hasOwnProperty(e.key)) {
            this.keys[e.key] = false;
            e.preventDefault();
        }
        if (e.key === ' ' || e.key === 'Space') {
            this.keys.Space = false;
        }
    }
    
    useItem() {
        const player = this.getLocalPlayer();
        if (player && player.item && this.raceState === 'racing') {
            // Efecto de usar item
            this.screenShake = 8;
            this.flashEffect = 0.6;
            
            // Animación de lanzamiento
            this.spawnParticles(player.x, player.z, 20, 15);
            
            if (player.item === '🍄') {
                player.speed = Math.min(player.speed + 8, 28);
                player.nitro = Math.min(1, player.nitro + 0.3);
            } else if (player.item === '⚡') {
                // Golpear a los oponentes
                this.players.forEach(p => {
                    if (p !== player && !p.ai) {
                        const dx = p.x - player.x;
                        const dz = p.z - player.z;
                        const dist = Math.hypot(dx, dz);
                        if (dist < 12) {
                            p.speed = Math.max(p.speed - 5, 0);
                            this.spawnParticles(p.x, p.z, 15, 10);
                        }
                    }
                });
            }
            
            player.item = null;
            
            // Animación de texto
            this.showFloatingText(player.x, player.z, '✨ ITEM USED! ✨', '#ffd166');
        }
    }
    
    showFloatingText(x, z, text, color) {
        this.particles.push({
            type: 'text',
            x, z,
            text,
            color,
            life: 1,
            vy: -3
        });
    }
    
    spawnParticles(x, z, count, speed) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                type: 'dust',
                x: x + (Math.random() - 0.5) * 3,
                z: z + (Math.random() - 0.5) * 3,
                vx: (Math.random() - 0.5) * speed,
                vz: (Math.random() - 0.5) * speed,
                life: 1,
                size: Math.random() * 4 + 2,
                color: `hsl(${40 + Math.random() * 20}, 70%, 60%)`
            });
        }
    }
    
    getLocalPlayer() {
        return this.players.find(p => p.id === 'local');
    }
    
    getTrackPosition(distance) {
        const totalLength = this.track.length;
