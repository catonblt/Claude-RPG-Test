// ============================================================
// VERDANT HOLLOW — Particle System & Weather
// ============================================================

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500;
    }

    emit(x, y, count, color, speed, gravity) {
        for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = (speed || 2) * (0.5 + Math.random() * 0.5);
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd - 1,
                life: 1,
                decay: 0.015 + Math.random() * 0.02,
                size: 2 + Math.random() * 2,
                color: color || '#ffffff',
                gravity: gravity !== undefined ? gravity : 0.05
            });
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.life -= p.decay;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx, camX, camY) {
        for (const p of this.particles) {
            const alpha = clamp(p.life, 0, 1);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            const size = p.size * p.life;
            ctx.beginPath();
            ctx.arc(p.x - camX, p.y - camY, Math.max(0.5, size), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}

// ---- WEATHER SYSTEM ----
const Weather = (() => {
    let current = WEATHER.CLEAR;
    let changeTimer = 900;
    let rainDrops = [];
    const MAX_RAIN = 300;

    function update() {
        changeTimer--;
        if (changeTimer <= 0) {
            changeTimer = 900;
            const r = Math.random();
            if (r < 0.45) current = WEATHER.CLEAR;
            else if (r < 0.65) current = WEATHER.CLOUDY;
            else if (r < 0.85) current = WEATHER.RAIN;
            else current = WEATHER.STORM;
        }

        // Rain particles
        if (current === WEATHER.RAIN || current === WEATHER.STORM) {
            const count = current === WEATHER.STORM ? 4 : 2;
            for (let i = 0; i < count && rainDrops.length < MAX_RAIN; i++) {
                rainDrops.push({
                    x: Math.random() * (CANVAS_W + 100) - 50,
                    y: -10,
                    speed: randFloat(4, 7),
                    wind: randFloat(-0.3, current === WEATHER.STORM ? -1.5 : -0.5),
                    length: randInt(6, 12)
                });
            }
        }

        // Update rain
        for (let i = rainDrops.length - 1; i >= 0; i--) {
            const d = rainDrops[i];
            d.y += d.speed;
            d.x += d.wind;
            if (d.y > CANVAS_H + 10) {
                rainDrops.splice(i, 1);
            }
        }
    }

    function render(ctx) {
        // Rain drops
        if (current === WEATHER.RAIN || current === WEATHER.STORM) {
            ctx.strokeStyle = 'rgba(150, 200, 255, 0.35)';
            ctx.lineWidth = 1;
            for (const d of rainDrops) {
                ctx.beginPath();
                ctx.moveTo(d.x, d.y);
                ctx.lineTo(d.x + d.wind * 2, d.y + d.length);
                ctx.stroke();
            }
        }

        // Weather overlay
        if (current === WEATHER.CLOUDY) {
            ctx.fillStyle = 'rgba(40, 40, 60, 0.12)';
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        } else if (current === WEATHER.RAIN) {
            ctx.fillStyle = 'rgba(30, 30, 50, 0.15)';
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        } else if (current === WEATHER.STORM) {
            ctx.fillStyle = 'rgba(20, 20, 40, 0.25)';
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        }
    }

    return {
        update, render,
        get current() { return current; },
        set current(v) { current = v; }
    };
})();

// ---- FLOATING TEXT ----
class FloatingTextSystem {
    constructor() {
        this.texts = [];
    }

    push(obj) {
        this.texts.push(obj);
    }

    update() {
        for (let i = this.texts.length - 1; i >= 0; i--) {
            const t = this.texts[i];
            t.y -= 0.5;
            t.life--;
            if (t.life <= 0) {
                this.texts.splice(i, 1);
            }
        }
    }

    render(ctx, camX, camY) {
        for (const t of this.texts) {
            const alpha = clamp(t.life / 30, 0, 1);
            ctx.globalAlpha = alpha;
            drawTextBold(ctx, t.text, t.x - camX, t.y - camY, t.color, 14, 'center');
        }
        ctx.globalAlpha = 1;
    }
}
