// ============================================================
// VERDANT HOLLOW — Utilities
// ============================================================

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function manhattan(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

// Seeded random for deterministic generation
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }
    next() {
        this.seed = (this.seed * 16807 + 0) % 2147483647;
        return (this.seed - 1) / 2147483646;
    }
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
    nextFloat(min, max) {
        return this.next() * (max - min) + min;
    }
}

// Simple 2D noise (value noise with smoothing)
class SimpleNoise {
    constructor(seed) {
        this.rng = new SeededRandom(seed);
        this.size = 256;
        this.perm = new Array(this.size * 2);
        this.grad = new Float32Array(this.size);
        for (let i = 0; i < this.size; i++) {
            this.grad[i] = this.rng.nextFloat(-1, 1);
            this.perm[i] = i;
        }
        // Shuffle
        for (let i = this.size - 1; i > 0; i--) {
            const j = this.rng.nextInt(0, i);
            [this.perm[i], this.perm[j]] = [this.perm[j], this.perm[i]];
        }
        for (let i = 0; i < this.size; i++) {
            this.perm[i + this.size] = this.perm[i];
        }
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    noise2D(x, y) {
        const X = Math.floor(x) & (this.size - 1);
        const Y = Math.floor(y) & (this.size - 1);
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        const u = this.fade(xf);
        const v = this.fade(yf);

        const aa = this.perm[this.perm[X] + Y];
        const ab = this.perm[this.perm[X] + Y + 1];
        const ba = this.perm[this.perm[X + 1] + Y];
        const bb = this.perm[this.perm[X + 1] + Y + 1];

        const g1 = this.grad[aa & (this.size - 1)];
        const g2 = this.grad[ba & (this.size - 1)];
        const g3 = this.grad[ab & (this.size - 1)];
        const g4 = this.grad[bb & (this.size - 1)];

        const x1 = lerp(g1, g2, u);
        const x2 = lerp(g3, g4, u);
        return lerp(x1, x2, v);
    }

    // Multi-octave fractal noise
    fbm(x, y, octaves = 4, lacunarity = 2, gain = 0.5) {
        let sum = 0;
        let amp = 1;
        let freq = 1;
        let maxAmp = 0;
        for (let i = 0; i < octaves; i++) {
            sum += this.noise2D(x * freq, y * freq) * amp;
            maxAmp += amp;
            amp *= gain;
            freq *= lacunarity;
        }
        return sum / maxAmp;
    }
}

// Drawing helper: rounded rectangle
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// Drawing helper: draw pixel art at scale
function drawPixel(ctx, x, y, size) {
    ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
}

// Create and cache a sprite
function createCachedSprite(key, w, h, drawFn) {
    if (spriteCache[key]) return spriteCache[key];
    const c = document.createElement('canvas');
    c.width = w || TILE;
    c.height = h || TILE;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawFn(ctx, c.width, c.height);
    spriteCache[key] = c;
    return c;
}

// Color helper: lighten/darken hex color
function shadeColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = clamp((num >> 16) + amt, 0, 255);
    const G = clamp((num >> 8 & 0x00FF) + amt, 0, 255);
    const B = clamp((num & 0x0000FF) + amt, 0, 255);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// Tile variation hash
function tileHash(x, y) {
    return ((x * 7 + y * 13) & 0x7FFFFFFF) % 4;
}

// Text drawing with shadow
function drawText(ctx, text, x, y, color, size, align, shadow) {
    ctx.font = `${size || 14}px 'Nunito', sans-serif`;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'top';
    if (shadow !== false) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillText(text, x + 1, y + 1);
    }
    ctx.fillStyle = color || COLORS.UI_TEXT;
    ctx.fillText(text, x, y);
}

function drawTextBold(ctx, text, x, y, color, size, align) {
    ctx.font = `bold ${size || 14}px 'Nunito', sans-serif`;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillText(text, x + 1, y + 1);
    ctx.fillStyle = color || COLORS.UI_TEXT;
    ctx.fillText(text, x, y);
}

// Simple progress bar drawing
function drawBar(ctx, x, y, w, h, ratio, color, bgColor) {
    ctx.fillStyle = bgColor || 'rgba(0,0,0,0.5)';
    roundRect(ctx, x, y, w, h, 2);
    ctx.fill();
    if (ratio > 0) {
        ctx.fillStyle = color;
        roundRect(ctx, x + 1, y + 1, Math.max(0, (w - 2) * clamp(ratio, 0, 1)), h - 2, 1);
        ctx.fill();
    }
}
