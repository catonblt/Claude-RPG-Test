// ============================================================
// VERDANT HOLLOW — UI System
// ============================================================

const UI = (() => {
    let messages = [];
    let shopItems = [];
    let shopType = '';
    let shopScroll = 0;
    let invCursor = 0;
    let craftScroll = 0;

    function showMessage(text, duration) {
        messages.push({ text, timer: duration || 120 });
    }

    // Extra HUD info set by the game
    let hudExtra = {};
    function setHudExtra(info) { hudExtra = info || {}; }

    // ---- HUD ----
    function renderHUD(ctx, player) {
        // Top-left panel
        const px = 8, py = 8, pw = 230, ph = 90;
        ctx.fillStyle = COLORS.UI_BG;
        roundRect(ctx, px, py, pw, ph, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(90, 138, 74, 0.4)';
        ctx.lineWidth = 1;
        roundRect(ctx, px, py, pw, ph, 6);
        ctx.stroke();

        // Bars
        const barX = px + 10, barW = 130, barH = 8;
        let by = py + 8;

        // HP
        drawText(ctx, 'HP', barX, by - 1, COLORS.UI_RED, 10, 'left', false);
        drawBar(ctx, barX + 22, by, barW, barH, player.hp / player.maxHp, '#e86565');
        drawText(ctx, `${player.hp}/${player.maxHp}`, barX + barW + 26, by - 1, COLORS.UI_TEXT, 10, 'left', false);
        by += 14;

        // MP
        drawText(ctx, 'MP', barX, by - 1, COLORS.UI_BLUE, 10, 'left', false);
        drawBar(ctx, barX + 22, by, barW, barH, player.mp / player.maxMp, '#6aaedd');
        drawText(ctx, `${player.mp}/${player.maxMp}`, barX + barW + 26, by - 1, COLORS.UI_TEXT, 10, 'left', false);
        by += 14;

        // Stamina
        drawText(ctx, 'ST', barX, by - 1, COLORS.UI_GOLD, 10, 'left', false);
        drawBar(ctx, barX + 22, by, barW, barH, player.stamina / player.maxStamina, '#e8c040');
        drawText(ctx, `${player.stamina}/${player.maxStamina}`, barX + barW + 26, by - 1, COLORS.UI_TEXT, 10, 'left', false);
        by += 14;

        // XP
        drawText(ctx, 'XP', barX, by - 1, COLORS.UI_PURPLE, 10, 'left', false);
        drawBar(ctx, barX + 22, by, barW, barH, player.xp / player.xpToNext, '#b68edb');
        drawText(ctx, `Lv${player.level}`, barX + barW + 26, by - 1, COLORS.UI_TEXT, 10, 'left', false);
        by += 16;

        // Gold, Day, Season, Time
        drawText(ctx, `${player.gold}G`, barX, by, COLORS.UI_GOLD, 12, 'left', false);
        drawText(ctx, `Day ${player.day}`, barX + 60, by, COLORS.UI_TEXT, 12, 'left', false);
        drawText(ctx, `${player.seasonName}`, barX + 110, by, COLORS.UI_GREEN, 12, 'left', false);
        drawText(ctx, player.timeString, barX + 170, by, COLORS.UI_TEXT, 12, 'left', false);

        // Weather icon (overworld only)
        if (hudExtra.weather && hudExtra.mapType === 'overworld') {
            const wx = px + pw - 36, wy = py + 6;
            let weatherLabel = '';
            let weatherColor = COLORS.UI_TEXT_DIM;
            switch (hudExtra.weather) {
                case WEATHER.CLEAR: weatherLabel = 'Clear'; weatherColor = '#f0e060'; break;
                case WEATHER.CLOUDY: weatherLabel = 'Cloudy'; weatherColor = '#a0a0b0'; break;
                case WEATHER.RAIN: weatherLabel = 'Rain'; weatherColor = '#6aaedd'; break;
                case WEATHER.STORM: weatherLabel = 'Storm'; weatherColor = '#aa80e0'; break;
            }
            drawText(ctx, weatherLabel, wx, wy, weatherColor, 9, 'left', false);
        }

        // Dungeon floor
        if (hudExtra.mapType === 'dungeon' && hudExtra.dungeonFloor) {
            const dfx = px + pw - 36, dfy = py + 6;
            drawTextBold(ctx, `F${hudExtra.dungeonFloor}`, dfx, dfy, COLORS.UI_PURPLE, 12, 'left');
        }
    }

    // ---- HOTBAR ----
    function renderHotbar(ctx, player) {
        const slots = 8;
        const slotSize = 38;
        const gap = 4;
        const totalW = slots * slotSize + (slots - 1) * gap;
        const hx = (CANVAS_W - totalW) / 2;
        const hy = CANVAS_H - slotSize - 12;

        // Background
        ctx.fillStyle = 'rgba(20, 18, 30, 0.7)';
        roundRect(ctx, hx - 6, hy - 6, totalW + 12, slotSize + 12, 6);
        ctx.fill();

        for (let i = 0; i < slots; i++) {
            const sx = hx + i * (slotSize + gap);
            const selected = i === player.selectedSlot;

            // Slot background
            ctx.fillStyle = selected ? 'rgba(90, 184, 90, 0.3)' : 'rgba(40, 38, 50, 0.6)';
            roundRect(ctx, sx, hy, slotSize, slotSize, 4);
            ctx.fill();

            // Slot border
            ctx.strokeStyle = selected ? '#7ec88b' : 'rgba(100, 100, 120, 0.4)';
            ctx.lineWidth = selected ? 2 : 1;
            roundRect(ctx, sx, hy, slotSize, slotSize, 4);
            ctx.stroke();

            // Slot number
            drawText(ctx, `${i + 1}`, sx + 3, hy - 14, COLORS.UI_TEXT_DIM, 10, 'left', false);

            // Item
            const slot = player.inventory[i];
            if (slot) {
                const item = ITEM_DB[slot.id];
                if (item) {
                    const icon = Sprites.getItemIcon(item);
                    ctx.drawImage(icon, sx + 3, hy + 3, slotSize - 6, slotSize - 6);

                    // Stack count
                    if (slot.amount > 1) {
                        drawText(ctx, `${slot.amount}`, sx + slotSize - 4, hy + slotSize - 12, COLORS.UI_TEXT, 10, 'right');
                    }

                    // Equipped badge
                    if (player.weapon === slot.id || player.accessory === slot.id) {
                        ctx.fillStyle = 'rgba(90, 184, 90, 0.8)';
                        roundRect(ctx, sx + slotSize - 14, hy + 2, 12, 12, 2);
                        ctx.fill();
                        drawText(ctx, 'E', sx + slotSize - 12, hy + 2, '#ffffff', 9, 'left', false);
                    }
                }
            }
        }
    }

    // ---- MINIMAP ----
    function renderMinimap(ctx, map, player) {
        const mmW = 110, mmH = 80;
        const mx = CANVAS_W - mmW - 8, my = 8;
        const scale = Math.min(mmW / map.width, mmH / map.height);

        ctx.fillStyle = COLORS.UI_BG;
        roundRect(ctx, mx - 4, my - 4, mmW + 8, mmH + 8, 4);
        ctx.fill();

        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                if (map.explored && !map.explored[y][x]) continue;
                const tile = map.tiles[y][x];
                let color;
                switch (tile) {
                    case TILES.WATER: color = '#4a8ebf'; break;
                    case TILES.SAND: color = '#d4b878'; break;
                    case TILES.PATH: color = '#c4a870'; break;
                    case TILES.STONE: color = '#7a7a8a'; break;
                    case TILES.BRIDGE: color = '#a08050'; break;
                    case TILES.FARM_DIRT: color = '#7a5a3a'; break;
                    case TILES.DIRT: color = '#9b7d5a'; break;
                    case TILES.DUNGEON_FLOOR: color = '#4a4555'; break;
                    case TILES.DUNGEON_WALL: color = '#2a2535'; break;
                    case TILES.STAIRS_DOWN: color = '#8a6aaa'; break;
                    case TILES.STAIRS_UP: color = '#7ec88b'; break;
                    case TILES.WOOD_FLOOR: color = '#a08058'; break;
                    default: color = '#4a8a3a';
                }
                ctx.fillStyle = color;
                ctx.fillRect(mx + x * scale, my + y * scale, Math.max(1, scale), Math.max(1, scale));
            }
        }

        // Player dot (blinking)
        if (Math.floor(Date.now() / 300) % 2 === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(mx + player.x * scale - 1, my + player.y * scale - 1, 3, 3);
        }
    }

    // ---- INVENTORY SCREEN ----
    function renderInventory(ctx, player) {
        const cols = 6, rows = 4, slotSize = 46, gap = 4;
        const gridW = cols * slotSize + (cols - 1) * gap;
        const gridH = rows * slotSize + (rows - 1) * gap;
        const panelW = gridW + 40;
        const panelH = gridH + 140;
        const px = (CANVAS_W - panelW) / 2;
        const py = (CANVAS_H - panelH) / 2;

        // Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Panel
        ctx.fillStyle = 'rgba(25, 22, 40, 0.95)';
        roundRect(ctx, px, py, panelW, panelH, 10);
        ctx.fill();
        ctx.strokeStyle = COLORS.UI_BORDER;
        ctx.lineWidth = 2;
        roundRect(ctx, px, py, panelW, panelH, 10);
        ctx.stroke();

        drawTextBold(ctx, 'Inventory', px + 20, py + 12, COLORS.UI_TEXT, 18);

        // Grid
        const gx = px + 20, gy = py + 40;
        for (let i = 0; i < 24; i++) {
            const col = i % cols, row = Math.floor(i / cols);
            const sx = gx + col * (slotSize + gap);
            const sy = gy + row * (slotSize + gap);
            const selected = i === invCursor;

            ctx.fillStyle = selected ? 'rgba(90, 184, 90, 0.3)' : 'rgba(40, 38, 50, 0.7)';
            roundRect(ctx, sx, sy, slotSize, slotSize, 4);
            ctx.fill();
            ctx.strokeStyle = selected ? '#7ec88b' : 'rgba(80, 80, 100, 0.4)';
            ctx.lineWidth = selected ? 2 : 1;
            roundRect(ctx, sx, sy, slotSize, slotSize, 4);
            ctx.stroke();

            const slot = player.inventory[i];
            if (slot) {
                const item = ITEM_DB[slot.id];
                if (item) {
                    const icon = Sprites.getItemIcon(item);
                    ctx.drawImage(icon, sx + 3, sy + 3, slotSize - 6, slotSize - 6);
                    if (slot.amount > 1) {
                        drawText(ctx, `${slot.amount}`, sx + slotSize - 4, sy + slotSize - 14, COLORS.UI_TEXT, 11, 'right');
                    }
                    if (player.weapon === slot.id || player.accessory === slot.id) {
                        ctx.fillStyle = 'rgba(90, 184, 90, 0.8)';
                        roundRect(ctx, sx + slotSize - 14, sy + 2, 12, 12, 2);
                        ctx.fill();
                        drawText(ctx, 'E', sx + slotSize - 12, sy + 2, '#ffffff', 9, 'left', false);
                    }
                }
            }
        }

        // Detail panel
        const detY = gy + gridH + 12;
        const slot = player.inventory[invCursor];
        if (slot) {
            const item = ITEM_DB[slot.id];
            if (item) {
                drawTextBold(ctx, item.name, gx, detY, COLORS.UI_GOLD, 14);
                drawText(ctx, item.desc, gx, detY + 20, COLORS.UI_TEXT, 12);
                let stats = [];
                if (item.attack) stats.push(`ATK +${item.attack}`);
                if (item.defense) stats.push(`DEF +${item.defense}`);
                if (item.price) stats.push(`Value: ${item.price}G`);
                drawText(ctx, stats.join('  |  '), gx, detY + 38, COLORS.UI_TEXT_DIM, 11);
            }
        }

        // Controls
        drawText(ctx, 'Arrows: Navigate  |  E/Space: Use/Equip  |  Q: Drop  |  I/ESC: Close',
            CANVAS_W / 2, py + panelH - 22, COLORS.UI_TEXT_DIM, 11, 'center');
    }

    // ---- SHOP SCREEN ----
    function openShop(type) {
        shopType = type;
        shopItems = SHOP_INVENTORY[type] || [];
        shopScroll = 0;
    }

    function renderShop(ctx, player) {
        const panelW = 380, panelH = 420;
        const px = (CANVAS_W - panelW) / 2;
        const py = (CANVAS_H - panelH) / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.fillStyle = 'rgba(25, 22, 40, 0.95)';
        roundRect(ctx, px, py, panelW, panelH, 10);
        ctx.fill();
        ctx.strokeStyle = COLORS.UI_BORDER;
        ctx.lineWidth = 2;
        roundRect(ctx, px, py, panelW, panelH, 10);
        ctx.stroke();

        const title = shopType === 'general' ? "Pip's General Store" : "Forge's Blacksmith";
        drawTextBold(ctx, title, px + 20, py + 12, COLORS.UI_GOLD, 16);
        drawText(ctx, `Your Gold: ${player.gold}G`, px + panelW - 20, py + 14, COLORS.UI_GOLD, 13, 'right');

        const listY = py + 42;
        const itemH = 38;
        const maxVisible = 9;
        const scrollStart = Math.max(0, Math.min(shopScroll - Math.floor(maxVisible / 2), shopItems.length - maxVisible));
        const visible = Math.min(shopItems.length, maxVisible);

        for (let i = 0; i < visible; i++) {
            const idx = i + scrollStart;
            if (idx >= shopItems.length) break;

            const itemId = shopItems[idx];
            const item = ITEM_DB[itemId];
            if (!item) continue;

            const iy = listY + i * itemH;
            const selected = idx === shopScroll;
            const canAfford = player.gold >= item.price;

            ctx.fillStyle = selected ? 'rgba(90, 184, 90, 0.2)' : 'rgba(40, 38, 50, 0.4)';
            roundRect(ctx, px + 12, iy, panelW - 24, itemH - 4, 4);
            ctx.fill();

            if (selected) {
                ctx.strokeStyle = '#7ec88b';
                ctx.lineWidth = 1;
                roundRect(ctx, px + 12, iy, panelW - 24, itemH - 4, 4);
                ctx.stroke();
            }

            // Icon
            const icon = Sprites.getItemIcon(item);
            ctx.drawImage(icon, px + 18, iy + 3, 28, 28);

            // Name
            drawText(ctx, item.name, px + 52, iy + 5, canAfford ? COLORS.UI_TEXT : COLORS.UI_RED, 13);
            drawText(ctx, item.desc.substring(0, 40), px + 52, iy + 20, COLORS.UI_TEXT_DIM, 10);

            // Price
            drawText(ctx, `${item.price}G`, px + panelW - 28, iy + 10, canAfford ? COLORS.UI_GOLD : COLORS.UI_RED, 13, 'right');
        }

        // Selected item detail
        if (shopItems[shopScroll]) {
            const item = ITEM_DB[shopItems[shopScroll]];
            if (item) {
                let stats = [];
                if (item.attack) stats.push(`ATK +${item.attack}`);
                if (item.defense) stats.push(`DEF +${item.defense}`);
                if (item.effect) stats.push(`Effect: ${item.effect}`);
                if (stats.length > 0) {
                    drawText(ctx, stats.join('  |  '), px + 20, py + panelH - 50, COLORS.UI_TEXT_DIM, 11);
                }
            }
        }

        drawText(ctx, 'Up/Down: Browse  |  E: Buy  |  ESC: Close',
            CANVAS_W / 2, py + panelH - 22, COLORS.UI_TEXT_DIM, 11, 'center');
    }

    // ---- CRAFTING SCREEN ----
    function renderCrafting(ctx, player) {
        const panelW = 420, panelH = 440;
        const px = (CANVAS_W - panelW) / 2;
        const py = (CANVAS_H - panelH) / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.fillStyle = 'rgba(25, 22, 40, 0.95)';
        roundRect(ctx, px, py, panelW, panelH, 10);
        ctx.fill();
        ctx.strokeStyle = COLORS.UI_BORDER;
        ctx.lineWidth = 2;
        roundRect(ctx, px, py, panelW, panelH, 10);
        ctx.stroke();

        drawTextBold(ctx, 'Crafting', px + 20, py + 12, COLORS.UI_GOLD, 16);

        const listY = py + 40;
        const itemH = 50;
        const recipes = RECIPES;
        const maxVisible = 7;
        const craftStart = Math.max(0, Math.min(craftScroll - Math.floor(maxVisible / 2), recipes.length - maxVisible));
        const visible = Math.min(recipes.length, maxVisible);

        for (let i = 0; i < visible; i++) {
            const idx = i + craftStart;
            if (idx < 0 || idx >= recipes.length) continue;

            const recipe = recipes[idx];
            const result = ITEM_DB[recipe.result];
            if (!result) continue;

            const iy = listY + i * itemH;
            const canMake = Crafting.canCraft(recipe, player);
            const selected = idx === craftScroll;

            ctx.fillStyle = selected ? 'rgba(90, 184, 90, 0.2)' : 'rgba(40, 38, 50, 0.4)';
            roundRect(ctx, px + 12, iy, panelW - 24, itemH - 4, 4);
            ctx.fill();

            if (selected) {
                ctx.strokeStyle = canMake ? '#7ec88b' : '#e86565';
                ctx.lineWidth = 1;
                roundRect(ctx, px + 12, iy, panelW - 24, itemH - 4, 4);
                ctx.stroke();
            }

            // Result icon
            const icon = Sprites.getItemIcon(result);
            ctx.drawImage(icon, px + 18, iy + 5, 32, 32);

            // Result name
            const amountText = recipe.amount > 1 ? ` x${recipe.amount}` : '';
            drawText(ctx, result.name + amountText, px + 56, iy + 4, canMake ? COLORS.UI_TEXT : COLORS.UI_TEXT_DIM, 13);

            // Ingredients
            let ingText = '';
            for (const ing of recipe.ingredients) {
                const ingItem = ITEM_DB[ing.id];
                const have = player.countItem(ing.id);
                const enough = have >= ing.amount;
                if (ingText) ingText += '  ';
                ingText += `${ingItem ? ingItem.name : '?'}: `;
                ingText += `${have}/${ing.amount}`;
            }
            // Draw ingredients with color coding
            let ix = px + 56;
            for (const ing of recipe.ingredients) {
                const ingItem = ITEM_DB[ing.id];
                const have = player.countItem(ing.id);
                const enough = have >= ing.amount;
                const text = `${ingItem ? ingItem.name : '?'} ${have}/${ing.amount}  `;
                drawText(ctx, text, ix, iy + 24, enough ? COLORS.UI_GREEN : COLORS.UI_RED, 10, 'left', false);
                ctx.font = '10px "Nunito", sans-serif';
                ix += ctx.measureText(text).width + 2;
            }
        }

        drawText(ctx, 'Up/Down: Browse  |  E: Craft  |  ESC: Close',
            CANVAS_W / 2, py + panelH - 22, COLORS.UI_TEXT_DIM, 11, 'center');
    }

    // ---- MESSAGES ----
    function updateMessages() {
        for (let i = messages.length - 1; i >= 0; i--) {
            messages[i].timer--;
            if (messages[i].timer <= 0) {
                messages.splice(i, 1);
            }
        }
    }

    function renderMessages(ctx) {
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            const alpha = msg.timer < 30 ? msg.timer / 30 : 1;
            ctx.globalAlpha = alpha;
            const y = CANVAS_H * 0.65 - i * 28;

            ctx.font = '14px "Nunito", sans-serif';
            const tw = ctx.measureText(msg.text).width;
            ctx.fillStyle = 'rgba(20, 18, 30, 0.8)';
            roundRect(ctx, (CANVAS_W - tw) / 2 - 16, y - 4, tw + 32, 24, 12);
            ctx.fill();

            drawText(ctx, msg.text, CANVAS_W / 2, y, COLORS.UI_TEXT, 14, 'center', false);
        }
        ctx.globalAlpha = 1;
    }

    return {
        showMessage, openShop, setHudExtra,
        renderHUD, renderHotbar, renderMinimap,
        renderInventory, renderShop, renderCrafting,
        updateMessages, renderMessages,
        get invCursor() { return invCursor; },
        set invCursor(v) { invCursor = v; },
        get shopScroll() { return shopScroll; },
        set shopScroll(v) { shopScroll = v; },
        get craftScroll() { return craftScroll; },
        set craftScroll(v) { craftScroll = v; },
        get shopType() { return shopType; },
        get shopItems() { return shopItems; }
    };
})();
