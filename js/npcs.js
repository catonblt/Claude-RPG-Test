// ============================================================
// VERDANT HOLLOW — NPC Dialogue System
// ============================================================

const NPCDialogue = (() => {
    let active = false;
    let npc = null;
    let lines = [];
    let lineIndex = 0;
    let charIndex = 0;
    let charTimer = 0;
    let done = false;

    const CHAR_SPEED = 2; // frames per character

    const DIALOGUE = {
        [NPC_TYPE.ELDER]: [
            "Welcome to Verdant Hollow, young one. This valley holds many secrets...",
            "Your grandfather was a great adventurer. He sealed the dungeon long ago, but the seal weakens.",
            "A Shadow Crystal lies deep below, corrupting the land. Only a brave soul can destroy it.",
            "Venture into the dungeon carefully. Every 5 floors, a powerful guardian awaits.",
            "Grow strong through farming and crafting. The land will provide what you need.",
            "I sense the corruption growing stronger. Please, you must reach Floor 10.",
            "The ancient civilization that built the dungeon left powerful artifacts behind.",
            "Be wary of the deeper floors. The monsters grow fierce near the Shadow Crystal."
        ],
        [NPC_TYPE.FARMER]: [
            "Howdy neighbor! I'm Gil. I can teach you about farming!",
            "Use your hoe on dirt to till it, then plant seeds on the tilled soil.",
            "Don't forget to water your crops every day! Rain does it automatically though.",
            "Each crop has a growing season — check the seed description!",
            "Sleep in your bed to advance to the next day and let crops grow.",
            "The shipping bin near the farm will sell your harvested crops and fish.",
            "Different seasons grow different crops. Plan your planting ahead!",
            "Pro tip: Melons sell for the most in Summer, but take longer to grow."
        ]
    };

    function open(npcData) {
        npc = npcData;
        lines = DIALOGUE[npcData.type] || ["..."];
        lineIndex = Math.floor(Math.random() * lines.length);
        charIndex = 0;
        charTimer = 0;
        done = false;
        active = true;
        Audio.sfx.open();
    }

    function close() {
        active = false;
        npc = null;
        Audio.sfx.close();
    }

    function advance() {
        if (!active) return;
        if (!done) {
            // Complete current line instantly
            charIndex = lines[lineIndex].length;
            done = true;
        } else {
            // Next line
            lineIndex = (lineIndex + 1) % lines.length;
            charIndex = 0;
            charTimer = 0;
            done = false;
        }
    }

    function update() {
        if (!active || done) return;
        charTimer++;
        if (charTimer >= CHAR_SPEED) {
            charTimer = 0;
            charIndex++;
            if (charIndex >= lines[lineIndex].length) {
                done = true;
            }
        }
    }

    function render(ctx) {
        if (!active) return;

        const boxH = 100;
        const boxY = CANVAS_H - boxH - 16;
        const boxX = 16;
        const boxW = CANVAS_W - 32;

        // Background
        ctx.fillStyle = COLORS.UI_BG;
        roundRect(ctx, boxX, boxY, boxW, boxH, 8);
        ctx.fill();

        // Border
        ctx.strokeStyle = COLORS.UI_BORDER;
        ctx.lineWidth = 2;
        roundRect(ctx, boxX, boxY, boxW, boxH, 8);
        ctx.stroke();

        // NPC name
        drawTextBold(ctx, npc.name, boxX + 16, boxY + 10, COLORS.UI_GOLD, 16);

        // Dialogue text (typewriter)
        const displayText = lines[lineIndex].substring(0, charIndex);
        ctx.font = '14px "Nunito", sans-serif';
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // Word wrap
        const maxWidth = boxW - 32;
        const words = displayText.split(' ');
        let line = '';
        let lineY = boxY + 34;
        for (const word of words) {
            const test = line + word + ' ';
            if (ctx.measureText(test).width > maxWidth) {
                ctx.fillText(line, boxX + 16, lineY);
                line = word + ' ';
                lineY += 20;
            } else {
                line = test;
            }
        }
        ctx.fillText(line, boxX + 16, lineY);

        // Controls hint
        const hint = done ? 'E: Next tip  |  ESC: Close' : '';
        drawText(ctx, hint, boxX + boxW - 16, boxY + boxH - 22, COLORS.UI_TEXT_DIM, 11, 'right');
    }

    return {
        open, close, advance, update, render,
        get active() { return active; }
    };
})();
