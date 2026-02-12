// ============================================================
// VERDANT HOLLOW — Fishing Minigame
// ============================================================

const Fishing = (() => {
    let active = false;
    let phase = 'waiting'; // waiting, minigame, caught, escaped
    let waitTimer = 0;
    let fish = null;
    let barPos = 0.5; // 0-1, position of catch zone center
    let barVel = 0;
    let fishPos = 0.5;
    let fishVel = 0;
    let fishDir = 1;
    let fishChangeTimer = 0;
    let progress = 0.3;
    let catchZoneSize = 0.3;
    let resultTimer = 0;
    let castTimer = 0;
    let bobberFrame = 0;

    const BAR_X = CANVAS_W - 60;
    const BAR_Y = 80;
    const BAR_W = 30;
    const BAR_H = 400;

    function start() {
        active = true;
        phase = 'waiting';
        waitTimer = randInt(120, 600); // 2-10 seconds at 60fps
        progress = 0.3;
        barPos = 0.5;
        barVel = 0;
        fishPos = 0.5;
        fishVel = 0;
        fishDir = 1;
        fishChangeTimer = 30;
        castTimer = 0;
        bobberFrame = 0;

        // Pick fish from weighted table
        const totalWeight = FISH_DATA.reduce((s, f) => s + f.weight, 0);
        let roll = Math.random() * totalWeight;
        for (const f of FISH_DATA) {
            roll -= f.weight;
            if (roll <= 0) {
                fish = f;
                break;
            }
        }
        if (!fish) fish = FISH_DATA[0];

        const diff = fish.difficulty;
        catchZoneSize = Math.max(0.15, 0.38 - diff * 0.03);
    }

    function stop() {
        active = false;
        phase = 'waiting';
        fish = null;
    }

    function update(keys) {
        if (!active) return null;

        bobberFrame++;

        if (phase === 'waiting') {
            castTimer++;
            waitTimer--;
            if (waitTimer <= 0) {
                phase = 'minigame';
                Audio.sfx.fishBite();
            }
            return null;
        }

        if (phase === 'caught' || phase === 'escaped') {
            resultTimer--;
            if (resultTimer <= 0) {
                const result = phase === 'caught' ? fish : null;
                stop();
                return { done: true, fish: result };
            }
            return null;
        }

        // Minigame phase
        const diff = fish.difficulty;
        const speed = fish.speed;

        // Player control (Space or E to move up)
        const pushing = keys['Space'] || keys['KeyE'] || keys['Enter'];
        if (pushing) {
            barVel -= 0.008;
        } else {
            barVel += 0.005; // Gravity
        }
        barVel *= 0.92; // Damping
        barPos += barVel;
        barPos = clamp(barPos, catchZoneSize / 2, 1 - catchZoneSize / 2);

        // Fish AI
        fishChangeTimer--;
        if (fishChangeTimer <= 0) {
            fishDir = Math.random() < 0.5 ? -1 : 1;
            if (fishPos < 0.2) fishDir = 1;
            if (fishPos > 0.8) fishDir = -1;
            fishChangeTimer = Math.floor(20 + Math.random() * 40 / diff);

            // Occasional burst
            if (Math.random() < 0.02 * diff) {
                fishVel += fishDir * speed * 0.01;
            }
        }
        fishVel += fishDir * speed * 0.002;
        fishVel *= 0.88;
        fishPos += fishVel;
        fishPos = clamp(fishPos, 0.05, 0.95);

        // Check if fish is in catch zone
        const zoneTop = barPos - catchZoneSize / 2;
        const zoneBot = barPos + catchZoneSize / 2;
        const fishInZone = fishPos >= zoneTop && fishPos <= zoneBot;

        if (fishInZone) {
            progress += 0.012 - diff * 0.0005;
        } else {
            progress -= 0.003 + diff * 0.0006;
        }
        progress = clamp(progress, 0, 1);

        if (progress >= 1) {
            phase = 'caught';
            resultTimer = 90;
            Audio.sfx.fishCatch();
            return null;
        }
        if (progress <= 0) {
            phase = 'escaped';
            resultTimer = 60;
            Audio.sfx.fishEscape();
            return null;
        }

        return null;
    }

    function render(ctx) {
        if (!active) return;

        if (phase === 'waiting') {
            // Show casting animation / bobber
            const bobY = Math.sin(bobberFrame * 0.08) * 3;
            drawText(ctx, 'Waiting for a bite...', CANVAS_W / 2, CANVAS_H / 2 - 40, COLORS.UI_TEXT, 18, 'center');

            // Bobber
            ctx.fillStyle = '#e84040';
            ctx.beginPath();
            ctx.arc(CANVAS_W / 2, CANVAS_H / 2 + 20 + bobY, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(CANVAS_W / 2, CANVAS_H / 2 + 16 + bobY, 4, 0, Math.PI * 2);
            ctx.fill();

            // Water ripples
            ctx.strokeStyle = 'rgba(150, 200, 255, 0.3)';
            ctx.lineWidth = 1;
            const ripple = (bobberFrame % 60) / 60;
            ctx.beginPath();
            ctx.arc(CANVAS_W / 2, CANVAS_H / 2 + 24 + bobY, 10 + ripple * 20, 0, Math.PI * 2);
            ctx.stroke();
            return;
        }

        if (phase === 'caught') {
            const fishItem = ITEM_DB[fish.id];
            const rarityColor = getRarityColor(fishItem.rarity);
            drawTextBold(ctx, 'Caught!', CANVAS_W / 2, CANVAS_H / 2 - 60, '#7ec88b', 28, 'center');
            drawTextBold(ctx, fishItem.name, CANVAS_W / 2, CANVAS_H / 2 - 25, rarityColor, 22, 'center');
            drawText(ctx, `${fishItem.rarity} — ${fishItem.price}G`, CANVAS_W / 2, CANVAS_H / 2 + 5, COLORS.UI_GOLD, 16, 'center');
            return;
        }

        if (phase === 'escaped') {
            drawTextBold(ctx, 'It got away...', CANVAS_W / 2, CANVAS_H / 2 - 30, COLORS.UI_RED, 22, 'center');
            return;
        }

        // Minigame rendering
        // Background bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        roundRect(ctx, BAR_X - 4, BAR_Y - 4, BAR_W + 8, BAR_H + 8, 6);
        ctx.fill();

        ctx.fillStyle = 'rgba(30, 30, 50, 0.9)';
        roundRect(ctx, BAR_X, BAR_Y, BAR_W, BAR_H, 4);
        ctx.fill();

        // Catch zone (green)
        const zoneTop = BAR_Y + (barPos - catchZoneSize / 2) * BAR_H;
        const zoneHeight = catchZoneSize * BAR_H;
        ctx.fillStyle = 'rgba(90, 184, 90, 0.45)';
        roundRect(ctx, BAR_X + 2, zoneTop, BAR_W - 4, zoneHeight, 3);
        ctx.fill();
        ctx.strokeStyle = 'rgba(90, 184, 90, 0.8)';
        ctx.lineWidth = 2;
        roundRect(ctx, BAR_X + 2, zoneTop, BAR_W - 4, zoneHeight, 3);
        ctx.stroke();

        // Fish icon
        const fishY = BAR_Y + fishPos * BAR_H;
        const fishInZone = fishPos >= barPos - catchZoneSize / 2 && fishPos <= barPos + catchZoneSize / 2;
        ctx.fillStyle = fishInZone ? '#5aba5a' : '#e86565';
        ctx.beginPath();
        ctx.ellipse(BAR_X + BAR_W / 2, fishY, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Fish eye
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(BAR_X + BAR_W / 2 - 5, fishY - 2, 3, 3);
        ctx.fillStyle = '#000000';
        ctx.fillRect(BAR_X + BAR_W / 2 - 4, fishY - 1, 1, 1);
        // Tail
        ctx.fillStyle = fishInZone ? '#4a9a4a' : '#c84545';
        ctx.beginPath();
        ctx.moveTo(BAR_X + BAR_W / 2 + 10, fishY);
        ctx.lineTo(BAR_X + BAR_W / 2 + 16, fishY - 4);
        ctx.lineTo(BAR_X + BAR_W / 2 + 16, fishY + 4);
        ctx.fill();

        // Progress bar (top)
        const progW = BAR_W + 8;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        roundRect(ctx, BAR_X - 4, BAR_Y - 24, progW, 14, 3);
        ctx.fill();

        const progColor = progress > 0.6 ? '#5aba5a' : progress > 0.3 ? '#e8c040' : '#e86565';
        ctx.fillStyle = progColor;
        roundRect(ctx, BAR_X - 2, BAR_Y - 22, Math.max(0, (progW - 4) * progress), 10, 2);
        ctx.fill();

        // Fish name
        const fishItem = ITEM_DB[fish.id];
        drawText(ctx, fishItem.name, BAR_X + BAR_W / 2, BAR_Y - 44, getRarityColor(fishItem.rarity), 12, 'center');

        // Instructions
        drawText(ctx, 'Hold SPACE', BAR_X + BAR_W / 2, BAR_Y + BAR_H + 12, COLORS.UI_TEXT_DIM, 11, 'center');
    }

    function getRarityColor(rarity) {
        switch (rarity) {
            case 'Common': return COLORS.COMMON;
            case 'Uncommon': return COLORS.UNCOMMON;
            case 'Rare': return COLORS.RARE;
            case 'Epic': return COLORS.EPIC;
            case 'Legendary': return COLORS.LEGENDARY;
            default: return COLORS.COMMON;
        }
    }

    return {
        start, stop, update, render,
        get active() { return active; },
        get phase() { return phase; },
        get fish() { return fish; }
    };
})();
