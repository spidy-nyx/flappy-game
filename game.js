/**
 * FLAPPY HER - 2D Mobile Game
 * 
 * HOW TO CUSTOMIZE:
 * 1. Replace 'assets/player.png' with your pixel-art character sprite
 * 2. Replace 'assets/meme.png' with the funny game-over image
 * 3. Edit MEME_TEXTS array below to change game-over messages
 * 4. Replace 'assets/background.png' and 'assets/obstacle.png' for custom look
 */

// ============================================
// GAME CONFIGURATION
// ============================================

const CONFIG = {
    // Canvas settings (will be responsive)
    WIDTH: 400,
    HEIGHT: 600,
    
    // Player settings
    PLAYER_SIZE: 48,
    PLAYER_X: 100,
    GRAVITY: 0.6,
    JUMP_FORCE: -10,
    
    // Obstacle settings
    OBSTACLE_WIDTH: 60,
    OBSTACLE_GAP: 180,
    OBSTACLE_SPEED: 3,
    OBSTACLE_SPAWN_DISTANCE: 250,
    
    // Difficulty progression
    SPEED_INCREASE: 0.0005,
    GAP_DECREASE: 0.01,
    MIN_GAP: 120,
    
    // Colors (fallback if images don't load)
    PLAYER_COLOR: '#ff69b4',
    OBSTACLE_COLOR: '#2ecc71',
    GROUND_COLOR: '#8b4513',
    SKY_COLOR: '#87ceeb',
    
    // Visual effects
    PARTICLE_COUNT: 8,
    TRAIL_ENABLED: true
};

// ============================================
// MEME TEXTS - EDIT THESE!
// ============================================
const MEME_TEXTS = [
    "My score is kinda homeless 💀",
    "She tried to run… society said NO.",
    "Skill issue detected.",
    "Flop era unlocked.",
    "Gravity 1 – Her 0.",
    "Not the serve we expected 😭",
    "Main character energy: LOST",
    "The simulation said nope.",
    "Better luck next time bestie 💅",
    "That was embarrassing...",
    "Even the obstacles felt bad for you",
    "Delete the game sis 😂",
    "Touch grass maybe?",
    "L + ratio + skill issue",
    "The audacity to try again 💀",
    "Physics said: NOT TODAY",
    "Your reflexes left the chat",
    "Gravity undefeated since 1687",
    "This ain't it chief",
    "Yikes... just yikes",
    "The pipes are laughing at you",
    "Maybe gaming isn't your thing?",
    "RIP to your high score dreams",
    "You tried... and failed spectacularly",
    "The bar was low, you went lower",
    "Narrator: She did not, in fact, make it",
    "Error 404: Skills not found",
    "That's gonna be a no from me dawg",
    "Certified flop moment 🏆"
];

// ============================================
// GAME STATE
// ============================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Responsive canvas sizing
function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Maintain aspect ratio
    const targetRatio = CONFIG.WIDTH / CONFIG.HEIGHT;
    const containerRatio = containerWidth / containerHeight;
    
    if (containerRatio > targetRatio) {
        // Container is wider
        canvas.height = containerHeight;
        canvas.width = containerHeight * targetRatio;
    } else {
        // Container is taller
        canvas.width = containerWidth;
        canvas.height = containerWidth / targetRatio;
    }
    
    // Update scale factor for game logic
    CONFIG.SCALE = canvas.width / CONFIG.WIDTH;
}

// Initial resize
resizeCanvas();

// Resize on window resize
window.addEventListener('resize', resizeCanvas);

let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
let frameCount = 0;

// Player object
const player = {
    x: CONFIG.PLAYER_X,
    y: CONFIG.HEIGHT / 2,
    velocity: 0,
    size: CONFIG.PLAYER_SIZE,
    rotation: 0,
    frame: 0,
    animationTimer: 0
};

// Obstacles array
let obstacles = [];
let obstacleSpeed = CONFIG.OBSTACLE_SPEED;
let obstacleGap = CONFIG.OBSTACLE_GAP;

// Particle effects
let particles = [];

// Player trail
let trail = [];

// ============================================
// ASSET LOADING (Base64 Embedded)
// ============================================

const images = {
    playerRun1: new Image(),
    playerRun2: new Image(),
    playerJump: new Image(),
    meme: new Image(),
    background: new Image(),
    obstacle: new Image()
};

// Load images from base64 (embedded in images-data.js)
// No external file dependencies!
if (typeof BASE64_IMAGES !== 'undefined') {
    console.log('Loading images from BASE64_IMAGES...');
    images.playerRun1.src = BASE64_IMAGES.run1;
    images.playerRun2.src = BASE64_IMAGES.run2;
    images.playerJump.src = BASE64_IMAGES.jump;
    images.meme.src = BASE64_IMAGES.meme;
    console.log('Images loaded successfully');
} else {
    console.error('❌ BASE64_IMAGES not loaded - make sure images-data.js is included');
    alert('Error: Images not loaded. Please refresh the page.');
}

// Track loading
let imagesLoaded = 0;
const totalImages = 4; // Only counting the base64 images we actually use

Object.values(images).slice(0, 4).forEach(img => {
    img.onload = () => {
        imagesLoaded++;
    };
    img.onerror = () => {
        imagesLoaded++; // Continue even if image fails
    };
});

// ============================================
// ENHANCED AUDIO SYSTEM
// ============================================

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioEnabled = true;
let musicEnabled = true;
let backgroundMusic = null;
let musicStarted = false;

// Enhanced sound effects
function playWhooshSound() {
    if (!audioEnabled) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Whoosh effect - sweep from high to low
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.15);
    oscillator.type = 'sawtooth';
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
}

function playCoinSound() {
    if (!audioEnabled) return;
    
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Coin ding - two tones
    oscillator1.frequency.setValueAtTime(988, audioContext.currentTime); // B5
    oscillator2.frequency.setValueAtTime(1319, audioContext.currentTime); // E6
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.2);
    oscillator2.stop(audioContext.currentTime + 0.2);
}

function playCrashSound() {
    if (!audioEnabled) return;
    
    // Create dramatic crash with noise and bass
    const bufferSize = audioContext.sampleRate * 0.5;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate noise
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const noiseGain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioContext.destination);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
    
    noiseGain.gain.setValueAtTime(0.5, audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    noise.start(audioContext.currentTime);
    noise.stop(audioContext.currentTime + 0.5);
    
    // Add bass thump
    const bass = audioContext.createOscillator();
    const bassGain = audioContext.createGain();
    
    bass.connect(bassGain);
    bassGain.connect(audioContext.destination);
    
    bass.frequency.setValueAtTime(80, audioContext.currentTime);
    bass.frequency.exponentialRampToValueAtTime(20, audioContext.currentTime + 0.3);
    bass.type = 'sine';
    
    bassGain.gain.setValueAtTime(0.6, audioContext.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    bass.start(audioContext.currentTime);
    bass.stop(audioContext.currentTime + 0.3);
}

// Background music (simple 8-bit melody)
function startBackgroundMusic() {
    if (!musicEnabled || musicStarted) return;
    musicStarted = true;
    
    const melody = [
        { freq: 523, duration: 0.2 }, // C5
        { freq: 659, duration: 0.2 }, // E5
        { freq: 784, duration: 0.2 }, // G5
        { freq: 659, duration: 0.2 }, // E5
        { freq: 523, duration: 0.2 }, // C5
        { freq: 587, duration: 0.2 }, // D5
        { freq: 698, duration: 0.2 }, // F5
        { freq: 587, duration: 0.2 }  // D5
    ];
    
    let currentNote = 0;
    
    function playNote() {
        if (!musicEnabled) {
            musicStarted = false;
            return;
        }
        
        const note = melody[currentNote];
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = note.freq;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + note.duration);
        
        currentNote = (currentNote + 1) % melody.length;
        setTimeout(playNote, note.duration * 1000);
    }
    
    playNote();
}

function stopBackgroundMusic() {
    musicEnabled = false;
    musicStarted = false;
}

function toggleMusic() {
    musicEnabled = !musicEnabled;
    if (musicEnabled) {
        startBackgroundMusic();
    } else {
        stopBackgroundMusic();
    }
    updateMusicButton();
}

function toggleSound() {
    audioEnabled = !audioEnabled;
    updateSoundButton();
}

function updateMusicButton() {
    const btn = document.getElementById('musicBtn');
    if (btn) {
        btn.textContent = musicEnabled ? '🎵' : '🔇';
        btn.title = musicEnabled ? 'Music: ON' : 'Music: OFF';
    }
}

function updateSoundButton() {
    const btn = document.getElementById('soundBtn');
    if (btn) {
        btn.textContent = audioEnabled ? '🔊' : '🔇';
        btn.title = audioEnabled ? 'Sound: ON' : 'Sound: OFF';
    }
}

// Wrapper functions for compatibility
function jumpSound() {
    playWhooshSound();
}

function scoreSound() {
    playCoinSound();
}

function gameOverSound() {
    playCrashSound();
}

// ============================================
// UI ELEMENTS
// ============================================

const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameHUD = document.getElementById('gameHUD');
const currentScoreEl = document.getElementById('currentScore');
const finalScoreEl = document.getElementById('finalScore');
const bestScoreEl = document.getElementById('bestScore');
const memeTextEl = document.getElementById('memeText');
const retryBtn = document.getElementById('retryBtn');
const homeBtn = document.getElementById('homeBtn');

// ============================================
// INPUT HANDLING
// ============================================

function handleInput() {
    // Start audio context on first interaction (browser requirement)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    if (gameState === 'start') {
        startGame();
        startBackgroundMusic();
    } else if (gameState === 'playing') {
        jump();
    }
}

// Touch/Click events
canvas.addEventListener('click', handleInput);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleInput();
});

// Keyboard
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        handleInput();
    }
});

// Button events
retryBtn.addEventListener('click', startGame);
homeBtn.addEventListener('click', showStartScreen);

// Control buttons
const fullscreenBtn = document.getElementById('fullscreenBtn');
const musicBtn = document.getElementById('musicBtn');
const soundBtn = document.getElementById('soundBtn');

fullscreenBtn.addEventListener('click', toggleFullscreen);
musicBtn.addEventListener('click', toggleMusic);
soundBtn.addEventListener('click', toggleSound);

function toggleFullscreen() {
    const container = document.getElementById('gameContainer');
    
    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
            console.log('Fullscreen error:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Update fullscreen button icon
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        fullscreenBtn.textContent = '⛶';
    } else {
        fullscreenBtn.textContent = '⛶';
    }
});

// ============================================
// GAME FUNCTIONS
// ============================================

function startGame() {
    gameState = 'playing';
    score = 0;
    frameCount = 0;
    obstacleSpeed = CONFIG.OBSTACLE_SPEED;
    obstacleGap = CONFIG.OBSTACLE_GAP;
    
    // Reset player
    player.y = canvas.height / 2;
    player.velocity = 0;
    player.rotation = 0;
    
    // Clear obstacles and effects
    obstacles = [];
    particles = [];
    trail = [];
    
    // Spawn first obstacle
    spawnObstacle();
    
    // Update UI
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameHUD.classList.remove('hidden');
    currentScoreEl.textContent = '0';
}

function showStartScreen() {
    gameState = 'start';
    startScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    gameHUD.classList.add('hidden');
}

function endGame() {
    gameState = 'gameOver';
    gameOverSound();
    
    // Create explosion particles
    for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        particles.push({
            x: player.x + player.size / 2,
            y: player.y + player.size / 2,
            vx: Math.cos(angle) * 5,
            vy: Math.sin(angle) * 5,
            life: 40,
            maxLife: 40,
            size: Math.random() * 8 + 4,
            color: `hsl(${Math.random() * 60}, 70%, 60%)`
        });
    }
    
    // Update best score
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
    }
    
    // Show game over screen with delay for effect
    setTimeout(() => {
        finalScoreEl.textContent = score;
        bestScoreEl.textContent = bestScore;
        
        // Random meme text
        const randomMeme = MEME_TEXTS[Math.floor(Math.random() * MEME_TEXTS.length)];
        memeTextEl.textContent = randomMeme;
        
        gameHUD.classList.add('hidden');
        gameOverScreen.classList.remove('hidden');
    }, 500);
    
    // Screen shake effect
    canvas.style.animation = 'none';
    setTimeout(() => {
        canvas.style.animation = 'shake 0.3s';
    }, 10);
}

function jump() {
    player.velocity = CONFIG.JUMP_FORCE;
    jumpSound();
    
    // Create enhanced jump particles
    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
        particles.push({
            x: player.x + player.size / 2,
            y: player.y + player.size / 2,
            vx: Math.random() * 4 - 5,
            vy: Math.random() * 3 + 1,
            life: 30,
            maxLife: 30,
            size: Math.random() * 6 + 3,
            color: `hsl(${Math.random() * 60 + 180}, 70%, 60%)` // Blue-cyan particles
        });
    }
}

function spawnObstacle() {
    const minY = 50;
    const maxY = canvas.height - obstacleGap - 100;
    const gapY = Math.random() * (maxY - minY) + minY;
    
    obstacles.push({
        x: canvas.width,
        gapY: gapY,
        scored: false
    });
}

function updatePlayer() {
    // Apply gravity
    player.velocity += CONFIG.GRAVITY;
    player.y += player.velocity;
    
    // Rotation based on velocity
    player.rotation = Math.min(Math.max(player.velocity * 3, -30), 90);
    
    // Animation
    player.animationTimer++;
    if (player.animationTimer > 10) {
        player.frame = (player.frame + 1) % 4;
        player.animationTimer = 0;
    }
    
    // Add trail effect
    if (CONFIG.TRAIL_ENABLED && frameCount % 3 === 0) {
        trail.push({
            x: player.x + player.size / 2,
            y: player.y + player.size / 2,
            life: 20
        });
    }
    
    // Update trail
    for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].life--;
        if (trail[i].life <= 0) {
            trail.splice(i, 1);
        }
    }
    
    // Check boundaries
    if (player.y + player.size > canvas.height - 50 || player.y < 0) {
        endGame();
    }
}

function updateObstacles() {
    // Increase difficulty over time
    obstacleSpeed += CONFIG.SPEED_INCREASE;
    obstacleGap = Math.max(CONFIG.MIN_GAP, obstacleGap - CONFIG.GAP_DECREASE);
    
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= obstacleSpeed;
        
        // Check collision
        if (checkCollision(obs)) {
            endGame();
        }
        
        // Check score
        if (!obs.scored && obs.x + CONFIG.OBSTACLE_WIDTH < player.x) {
            obs.scored = true;
            score++;
            scoreSound();
            currentScoreEl.textContent = score;
            
            // Score animation
            currentScoreEl.style.transform = 'scale(1.3)';
            setTimeout(() => {
                currentScoreEl.style.transform = 'scale(1)';
            }, 200);
        }
        
        // Remove off-screen obstacles
        if (obs.x + CONFIG.OBSTACLE_WIDTH < 0) {
            obstacles.splice(i, 1);
        }
    }
    
    // Spawn new obstacles
    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - CONFIG.OBSTACLE_SPAWN_DISTANCE) {
        spawnObstacle();
    }
}

function checkCollision(obstacle) {
    const playerLeft = player.x;
    const playerRight = player.x + player.size;
    const playerTop = player.y;
    const playerBottom = player.y + player.size;
    
    const obsLeft = obstacle.x;
    const obsRight = obstacle.x + CONFIG.OBSTACLE_WIDTH;
    
    // Check if player is within obstacle x range
    if (playerRight > obsLeft && playerLeft < obsRight) {
        // Check if player hits top or bottom obstacle
        if (playerTop < obstacle.gapY || playerBottom > obstacle.gapY + obstacleGap) {
            return true;
        }
    }
    
    return false;
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// ============================================
// RENDERING
// ============================================

function drawBackground() {
    // Gradient sky
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(0.7, '#b0d4f1');
    gradient.addColorStop(1, '#e0f6ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Parallax clouds (multiple layers)
    const cloudOffset1 = (frameCount * 0.3) % (canvas.width + 150);
    const cloudOffset2 = (frameCount * 0.5) % (canvas.width + 150);
    
    // Far clouds (slower)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 4; i++) {
        const x = (i * 250 - cloudOffset1) % (canvas.width + 150);
        drawPixelCloud(x, 50 + i * 60, 0.8);
    }
    
    // Near clouds (faster)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 3; i++) {
        const x = (i * 300 - cloudOffset2) % (canvas.width + 150);
        drawPixelCloud(x, 100 + i * 100, 1.2);
    }
    
    // Ground with gradient
    const groundGradient = ctx.createLinearGradient(0, canvas.height - 50, 0, canvas.height);
    groundGradient.addColorStop(0, '#8b6914');
    groundGradient.addColorStop(1, '#654321');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    // Ground details (grass)
    ctx.fillStyle = '#7cb342';
    for (let i = 0; i < canvas.width; i += 20) {
        const offset = (frameCount * 2 + i) % 20;
        ctx.fillRect(i - offset, canvas.height - 52, 10, 4);
    }
}

function drawPixelCloud(x, y, scale = 1) {
    const size = 20 * scale;
    ctx.fillRect(x, y, size, size * 0.5);
    ctx.fillRect(x + size * 0.5, y - size * 0.25, size, size * 0.5);
    ctx.fillRect(x + size, y, size, size * 0.5);
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
    ctx.rotate(player.rotation * Math.PI / 180);
    
    // Choose sprite based on velocity
    let currentSprite;
    if (player.velocity < 0) {
        // Moving up - use jump sprite
        currentSprite = images.playerJump;
    } else {
        // Moving down or falling - alternate between run frames
        currentSprite = player.frame % 2 === 0 ? images.playerRun1 : images.playerRun2;
    }
    
    if (currentSprite.complete && currentSprite.naturalWidth > 0) {
        // Draw the selected sprite
        ctx.drawImage(
            currentSprite,
            -player.size / 2, -player.size / 2,
            player.size, player.size
        );
    } else {
        // Fallback: simple pixel character
        ctx.fillStyle = CONFIG.PLAYER_COLOR;
        ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(-player.size / 4, -player.size / 6, 8, 8);
        ctx.fillRect(player.size / 6, -player.size / 6, 8, 8);
    }
    
    ctx.restore();
}

function drawObstacles() {
    obstacles.forEach(obs => {
        // Main pipe gradient
        const pipeGradient = ctx.createLinearGradient(obs.x, 0, obs.x + CONFIG.OBSTACLE_WIDTH, 0);
        pipeGradient.addColorStop(0, '#27ae60');
        pipeGradient.addColorStop(0.5, '#2ecc71');
        pipeGradient.addColorStop(1, '#27ae60');
        ctx.fillStyle = pipeGradient;
        
        // Top obstacle with shadow
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.fillRect(obs.x, 0, CONFIG.OBSTACLE_WIDTH, obs.gapY);
        
        // Bottom obstacle
        ctx.fillRect(obs.x, obs.gapY + obstacleGap, CONFIG.OBSTACLE_WIDTH, canvas.height - obs.gapY - obstacleGap);
        
        // Pipe caps with gradient
        const capGradient = ctx.createLinearGradient(obs.x - 5, 0, obs.x + CONFIG.OBSTACLE_WIDTH + 5, 0);
        capGradient.addColorStop(0, '#1e8449');
        capGradient.addColorStop(0.5, '#27ae60');
        capGradient.addColorStop(1, '#1e8449');
        ctx.fillStyle = capGradient;
        
        ctx.fillRect(obs.x - 5, obs.gapY - 20, CONFIG.OBSTACLE_WIDTH + 10, 20);
        ctx.fillRect(obs.x - 5, obs.gapY + obstacleGap, CONFIG.OBSTACLE_WIDTH + 10, 20);
        
        // Highlight on pipes
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(obs.x + 5, 0, 8, obs.gapY);
        ctx.fillRect(obs.x + 5, obs.gapY + obstacleGap, 8, canvas.height - obs.gapY - obstacleGap);
        
        ctx.shadowBlur = 0;
    });
}

function drawTrail() {
    trail.forEach((t, index) => {
        const alpha = t.life / 20;
        ctx.save();
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.arc(t.x, t.y, player.size / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function drawParticles() {
    particles.forEach(p => {
        const alpha = p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color || '#ffffff';
        
        // Draw particle with glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color || '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

// ============================================
// GAME LOOP
// ============================================

function gameLoop() {
    frameCount++;
    
    // Clear canvas
    ctx.clearRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    
    // Draw background
    drawBackground();
    
    if (gameState === 'playing') {
        updatePlayer();
        updateObstacles();
        updateParticles();
    }
    
    // Draw game objects
    drawObstacles();
    drawTrail();
    drawParticles();
    drawPlayer();
    
    requestAnimationFrame(gameLoop);
}

// ============================================
// START THE GAME
// ============================================

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    #currentScore {
        transition: transform 0.2s;
    }
`;
document.head.appendChild(style);

// Wait for images to load, then start
function checkImagesLoaded() {
    if (imagesLoaded >= totalImages) {
        gameLoop();
    } else {
        setTimeout(checkImagesLoaded, 100);
    }
}

checkImagesLoaded();
