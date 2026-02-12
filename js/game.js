// ============================================================
// VERDANT HOLLOW — Main Game Engine
// ============================================================

const Game = (() => {
    let canvas, ctx;
    let state = STATE.TITLE;
    let frame = 0;

    // Maps
    let overworldMap = null;
    let houseMap = null;
    let dungeonMap = null;
    let currentMap = null;
    let dungeonFloor = 0;

    // Player
    let player = null;

    // Systems
    let particles = null;
    let floatingTexts = null;

    // Camera
    let camX = 0, camY = 0;

    // Transition
    let transition = { active: false, alpha: 0, callback: null, phase: 'none' };

    // Input
    let keys = {};
    let lastKeys = {};

    // Title screen animation
    let titleFrame = 0;
    let titleStars = [];

    function init() {
        canvas = document.getElementById('game');
        canvas.width = CANVAS_W;
        canvas.height = CANVAS_H;
        ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        // Generate stars for title screen
        for (let i = 0; i < 60; i++) {
            titleStars.push({
                x: Math.random() * CANVAS_W,
                y: Math.random() * CANVAS_H * 0.5,
                size: Math.random() * 2 + 0.5,
                twinkle: Math.random() * Math.PI * 2
            });
        }

        // Input listeners
        window.addEventListener('keydown', e => {
            keys[e.code] = true;
            // Initialize audio on first interaction
            if (!Audio.initialized) {
                Audio.init();
            }
            Audio.resume();
            e.preventDefault();
        });
        window.addEventListener('keyup', e => {
            keys[e.code] = false;
            e.preventDefault();
        });

        // Prevent context menu
        canvas.addEventListener('contextmenu', e => e.preventDefault());

        // Start game loop
        requestAnimationFrame(gameLoop);
    }

    function isJustPressed(code) {
        return keys[code] && !lastKeys[code];
    }

    function startNewGame() {
        player = new Player();
        overworldMap = generateOverworld();
        houseMap = generateHouseInterior();
        currentMap = overworldMap;
        particles = new ParticleSystem();
        floatingTexts = new FloatingTextSystem();
        dungeonFloor = 0;
        dungeonMap = null;
        state = STATE.PLAYING;
        Audio.playMusic('farm');
    }

    function loadGame() {
        const data = SaveSystem.load();
        if (!data) return false;

        player = new Player();
        overworldMap = generateOverworld();
        houseMap = generateHouseInterior();
        SaveSystem.applyLoad(data, player, overworldMap);
        currentMap = overworldMap;
        particles = new ParticleSystem();
        floatingTexts = new FloatingTextSystem();
        dungeonFloor = 0;
        dungeonMap = null;
        state = STATE.PLAYING;
        Audio.playMusic('farm');
        UI.showMessage('Game loaded!');
        return true;
    }

    // ---- GAME LOOP ----
    function gameLoop(timestamp) {
        frame++;
        update();
        render();
        lastKeys = { ...keys };
        requestAnimationFrame(gameLoop);
    }

    // ---- UPDATE ----
    function update() {
        if (transition.active) {
            updateTransition();
            return;
        }

        switch (state) {
            case STATE.TITLE:
                updateTitle();
                break;
            case STATE.PLAYING:
                updatePlaying();
                break;
            case STATE.INVENTORY:
                updateInventory();
                break;
            case STATE.SHOP:
                updateShop();
                break;
            case STATE.CRAFTING:
                updateCrafting();
                break;
            case STATE.DIALOGUE:
                updateDialogue();
                break;
            case STATE.FISHING:
                updateFishing();
                break;
        }
    }

    function updateTitle() {
        titleFrame++;
        if (isJustPressed('Enter') || isJustPressed('KeyE')) {
            startNewGame();
        }
        if (isJustPressed('KeyL') && SaveSystem.hasSave()) {
            loadGame();
        }
    }

    function updatePlaying() {
        if (player.dead) {
            player.deathTimer--;
            if (player.deathTimer <= 0) {
                startTransition(() => {
                    player.respawn();
                    currentMap = overworldMap;
                    dungeonMap = null;
                    dungeonFloor = 0;
                    Audio.playMusic('farm');
                });
            }
            return;
        }

        // Time advance on overworld
        if (currentMap.type === MAP_TYPE.OVERWORLD) {
            player.advanceTime();
        }

        // Movement
        updatePlayerMovement();

        // Interaction
        if (isJustPressed('KeyE') || isJustPressed('Enter')) {
            handleInteraction();
        }

        // Hotbar
        for (let i = 0; i < 8; i++) {
            if (isJustPressed(`Digit${i + 1}`)) {
                player.selectedSlot = i;
                Audio.sfx.select();
            }
        }

        // Inventory
        if (isJustPressed('KeyI') || isJustPressed('Tab')) {
            state = STATE.INVENTORY;
            UI.invCursor = player.selectedSlot;
            Audio.sfx.open();
        }

        // Use consumable / equip
        if (isJustPressed('Space')) {
            handleUseItem();
        }

        // Drop
        if (isJustPressed('KeyQ')) {
            handleDropItem();
        }

        // Quick save
        if (isJustPressed('KeyP') && currentMap.type !== MAP_TYPE.DUNGEON) {
            if (SaveSystem.save(player, overworldMap, Weather.current)) {
                UI.showMessage('Game saved!');
            }
        }

        // Action timer
        if (player.actionTimer > 0) player.actionTimer--;

        // Smooth position
        player.px = lerp(player.px, player.x * TILE, 0.25);
        player.py = lerp(player.py, player.y * TILE, 0.25);
        player.breathFrame++;

        // Camera
        updateCamera();

        // Enemy AI
        if (currentMap.type === MAP_TYPE.DUNGEON) {
            Combat.updateEnemies(currentMap, player, particles, floatingTexts);
            // Explore dungeon minimap
            if (currentMap.explored) {
                const revealRadius = 4;
                for (let dy = -revealRadius; dy <= revealRadius; dy++) {
                    for (let dx = -revealRadius; dx <= revealRadius; dx++) {
                        const ey = player.y + dy, ex = player.x + dx;
                        if (ey >= 0 && ey < currentMap.height && ex >= 0 && ex < currentMap.width) {
                            currentMap.explored[ey][ex] = true;
                        }
                    }
                }
            }
        }

        // Particles
        particles.update();
        floatingTexts.update();
        Weather.update();
        UI.updateMessages();

        // Crop sparkle particles for mature crops
        if (currentMap.type === MAP_TYPE.OVERWORLD && frame % 30 === 0) {
            for (const crop of currentMap.crops) {
                if (crop.stage >= crop.maxStage) {
                    particles.emit(crop.x * TILE + HALF_TILE, crop.y * TILE + HALF_TILE, 1, '#f0e060', 1, 0.02);
                }
            }
        }
    }

    function updatePlayerMovement() {
        if (player.actionTimer > 0 || player.moveTimer > 0) {
            if (player.moveTimer > 0) player.moveTimer--;
            return;
        }

        let dx = 0, dy = 0;
        if (keys['ArrowUp'] || keys['KeyW']) { dy = -1; player.dir = DIR.UP; }
        else if (keys['ArrowDown'] || keys['KeyS']) { dy = 1; player.dir = DIR.DOWN; }
        else if (keys['ArrowLeft'] || keys['KeyA']) { dx = -1; player.dir = DIR.LEFT; }
        else if (keys['ArrowRight'] || keys['KeyD']) { dx = 1; player.dir = DIR.RIGHT; }

        if (dx === 0 && dy === 0) return;

        const nx = player.x + dx;
        const ny = player.y + dy;

        // Check for enemy collision (auto-attack in dungeon)
        if (currentMap.type === MAP_TYPE.DUNGEON) {
            const enemy = currentMap.getEnemy(nx, ny);
            if (enemy && enemy.hp > 0) {
                const result = Combat.playerAttack(player, enemy, particles, floatingTexts);
                if (result) {
                    if (result.drops.length > 0) {
                        const names = result.drops.map(id => ITEM_DB[id]?.name || '?').join(', ');
                        UI.showMessage(`Got: ${names}`);
                    }
                    if (result.leveledUp) {
                        UI.showMessage(`Level up! You are now level ${player.level}!`);
                        Audio.sfx.levelUp();
                    }
                }
                player.moveTimer = MOVE_COOLDOWN;
                player.walkFrame++;
                return;
            }
        }

        if (currentMap.isWalkable(nx, ny)) {
            player.x = nx;
            player.y = ny;
            player.moveTimer = MOVE_COOLDOWN;
            player.walkFrame++;
            if (frame % 3 === 0) Audio.sfx.walk();
        }
    }

    function handleInteraction() {
        if (player.actionTimer > 0) return;

        const facing = player.getFacingTile();
        const fx = facing.x, fy = facing.y;

        // Check interactables at facing tile AND player tile (for proximity)
        let inter = currentMap.getInteractable(fx, fy) || currentMap.getInteractable(player.x, player.y);

        // Proximity-based house door check
        if (!inter && currentMap.type === MAP_TYPE.OVERWORLD) {
            for (const ia of currentMap.interactables) {
                if (ia.type === INTERACT_TYPE.HOUSE_DOOR && manhattan(player.x, player.y, ia.x, ia.y) <= 2) {
                    inter = ia;
                    break;
                }
            }
        }

        // Check NPC at facing tile
        const npc = currentMap.getNPC(fx, fy);
        if (npc) {
            if (npc.shopType) {
                // Shop NPC — direct to shop
                UI.openShop(npc.shopType);
                state = STATE.SHOP;
                Audio.sfx.open();
                return;
            } else {
                // Dialogue NPC
                NPCDialogue.open(npc);
                state = STATE.DIALOGUE;
                return;
            }
        }

        // Check enemies at facing tile (attack in dungeon)
        if (currentMap.type === MAP_TYPE.DUNGEON) {
            const enemy = currentMap.getEnemy(fx, fy);
            if (enemy && enemy.hp > 0) {
                const result = Combat.playerAttack(player, enemy, particles, floatingTexts);
                if (result) {
                    if (result.drops.length > 0) {
                        const names = result.drops.map(id => ITEM_DB[id]?.name || '?').join(', ');
                        UI.showMessage(`Got: ${names}`);
                    }
                    if (result.leveledUp) {
                        UI.showMessage(`Level up! You are now level ${player.level}!`);
                        Audio.sfx.levelUp();
                    }
                }
                return;
            }
        }

        // Handle interactable
        if (inter) {
            handleInteractable(inter);
            return;
        }

        // Context-based tool use
        handleToolUse(fx, fy);
    }

    function handleInteractable(inter) {
        switch (inter.type) {
            case INTERACT_TYPE.HOUSE_DOOR:
                startTransition(() => {
                    currentMap = houseMap;
                    player.x = Math.floor(HOUSE_W / 2);
                    player.y = HOUSE_H - 3;
                    player.px = player.x * TILE;
                    player.py = player.y * TILE;
                    Audio.playMusic('house');
                    Audio.sfx.doorEnter();
                });
                break;

            case INTERACT_TYPE.HOUSE_EXIT:
                startTransition(() => {
                    currentMap = overworldMap;
                    player.x = HOUSE_TILE_X + 1;
                    player.y = HOUSE_TILE_Y + 3;
                    player.px = player.x * TILE;
                    player.py = player.y * TILE;
                    Audio.playMusic('farm');
                    Audio.sfx.doorEnter();
                });
                break;

            case INTERACT_TYPE.BED:
                // Sleep — advance day
                startTransition(() => {
                    const prevDay = player.day;
                    player.sleep();
                    Farming.dailyGrowth(overworldMap, Weather.current);
                    SaveSystem.save(player, overworldMap, Weather.current);
                    UI.showMessage(`Slept well! Day ${player.day}, ${player.seasonName}`);
                });
                break;

            case INTERACT_TYPE.CHEST:
                if (inter.data && !inter.data.opened) {
                    inter.data.opened = true;
                    const loot = generateChestLoot(inter.data.floor || 1);
                    for (const item of loot) {
                        player.addItem(item.id, item.amount);
                        const itemName = ITEM_DB[item.id]?.name || '?';
                        UI.showMessage(`Found: ${itemName} x${item.amount}`);
                    }
                    Audio.sfx.chest();
                } else if (inter.data && inter.data.opened) {
                    UI.showMessage('Already opened.');
                }
                break;

            case INTERACT_TYPE.CRAFTING_BENCH:
                state = STATE.CRAFTING;
                UI.craftScroll = 0;
                Audio.sfx.open();
                break;

            case INTERACT_TYPE.SHIPPING_BIN:
                const total = Farming.sellCropsAndFish(player);
                if (total > 0) {
                    UI.showMessage(`Sold goods for ${total}G!`);
                } else {
                    UI.showMessage('No crops or fish to sell.');
                }
                break;

            case INTERACT_TYPE.FISHING_SPOT:
                if (player.hasItem(ITEM.FISHING_ROD)) {
                    state = STATE.FISHING;
                    Fishing.start();
                } else {
                    UI.showMessage('You need a Fishing Rod! Buy one from Pip.');
                }
                break;

            case INTERACT_TYPE.DUNGEON_ENTRANCE:
                startTransition(() => {
                    dungeonFloor = 1;
                    dungeonMap = generateDungeon(dungeonFloor);
                    currentMap = dungeonMap;
                    // Place player at stairs up
                    if (dungeonMap.rooms.length > 0) {
                        player.x = dungeonMap.rooms[0].cx;
                        player.y = dungeonMap.rooms[0].cy + 1;
                    }
                    player.px = player.x * TILE;
                    player.py = player.y * TILE;
                    Audio.playMusic('dungeon');
                    Audio.sfx.doorEnter();
                    UI.showMessage(`Dungeon Floor ${dungeonFloor}`);
                });
                break;

            case INTERACT_TYPE.DUNGEON_EXIT:
                startTransition(() => {
                    currentMap = overworldMap;
                    player.x = DUNGEON_ENTRANCE_X;
                    player.y = DUNGEON_ENTRANCE_Y + 1;
                    player.px = player.x * TILE;
                    player.py = player.y * TILE;
                    dungeonMap = null;
                    dungeonFloor = 0;
                    Audio.playMusic('farm');
                    Audio.sfx.doorEnter();
                    SaveSystem.save(player, overworldMap, Weather.current);
                    UI.showMessage('Returned to the surface.');
                });
                break;

            case INTERACT_TYPE.STAIRS_DOWN:
                startTransition(() => {
                    dungeonFloor++;
                    dungeonMap = generateDungeon(dungeonFloor);
                    currentMap = dungeonMap;
                    if (dungeonMap.rooms.length > 0) {
                        player.x = dungeonMap.rooms[0].cx;
                        player.y = dungeonMap.rooms[0].cy + 1;
                    }
                    player.px = player.x * TILE;
                    player.py = player.y * TILE;
                    Audio.sfx.doorEnter();
                    UI.showMessage(`Dungeon Floor ${dungeonFloor}`);
                    if (dungeonFloor % 5 === 0) {
                        UI.showMessage('A powerful presence lurks nearby...');
                    }
                });
                break;
        }
    }

    function handleToolUse(fx, fy) {
        const selectedItem = player.getSelectedItemData();
        const selectedSlot = player.getSelectedItem();

        // Farming actions
        if (currentMap.type === MAP_TYPE.OVERWORLD) {
            // Check crop at facing tile
            const crop = currentMap.getCrop(fx, fy);

            // Harvest mature crop
            if (crop && crop.stage >= crop.maxStage) {
                const result = Farming.harvest(currentMap, player, fx, fy);
                if (result) {
                    const name = ITEM_DB[result]?.name || 'crop';
                    UI.showMessage(`Harvested ${name}!`);
                    particles.emit(fx * TILE + HALF_TILE, fy * TILE + HALF_TILE, 8, '#7ec88b', 2);
                    return;
                }
            }

            // Water crop
            if (crop && selectedItem && selectedItem.toolType === TOOL_TYPE.WATERING_CAN) {
                if (Farming.water(currentMap, player, fx, fy)) {
                    UI.showMessage('Watered crop.');
                    particles.emit(fx * TILE + HALF_TILE, fy * TILE + HALF_TILE, 5, '#6aaedd', 1.5);
                    return;
                }
            }

            // Plant seed
            if (selectedItem && selectedItem.type === ITEM_TYPE.SEED && currentMap.tiles[fy] && currentMap.tiles[fy][fx] === TILES.FARM_DIRT && !crop) {
                const result = Farming.plant(currentMap, player, fx, fy, selectedSlot);
                if (result === true) {
                    UI.showMessage(`Planted ${selectedItem.name}!`);
                    return;
                } else if (result === 'wrong_season') {
                    UI.showMessage(`Can't plant that in ${player.seasonName}!`);
                    Audio.sfx.error();
                    return;
                }
            }

            // Till soil
            if (selectedItem && selectedItem.toolType === TOOL_TYPE.HOE) {
                if (Farming.till(currentMap, player, fx, fy)) {
                    UI.showMessage('Tilled soil.');
                    particles.emit(fx * TILE + HALF_TILE, fy * TILE + HALF_TILE, 4, '#8a6a42', 1.5);
                    return;
                }
            }

            // Chop tree
            if (currentMap.objects[fy] && currentMap.objects[fy][fx] === OBJECTS.TREE) {
                if (Farming.chopTree(currentMap, player, fx, fy)) {
                    UI.showMessage('Chopped tree! Got wood.');
                    particles.emit(fx * TILE + HALF_TILE, fy * TILE + HALF_TILE, 8, '#6a4a2a', 2);
                    return;
                } else if (!player.hasItem(ITEM.AXE)) {
                    UI.showMessage('Need an axe to chop trees.');
                    return;
                }
            }

            // Mine rock
            if (currentMap.objects[fy] && currentMap.objects[fy][fx] === OBJECTS.ROCK) {
                if (Farming.mineRock(currentMap, player, fx, fy)) {
                    UI.showMessage('Mined rock!');
                    particles.emit(fx * TILE + HALF_TILE, fy * TILE + HALF_TILE, 6, '#8a8a9a', 2);
                    return;
                }
            }
        }
    }

    function handleUseItem() {
        const slot = player.getSelectedItem();
        if (!slot) return;
        const item = ITEM_DB[slot.id];
        if (!item) return;

        if (item.type === ITEM_TYPE.CONSUMABLE) {
            if (player.useConsumable(slot.id)) {
                UI.showMessage(`Used ${item.name}!`);
                if (item.effect === 'heal') particles.emit(player.px + HALF_TILE, player.py + HALF_TILE, 6, '#e86565', 1.5);
                else if (item.effect === 'mana') particles.emit(player.px + HALF_TILE, player.py + HALF_TILE, 6, '#6aaedd', 1.5);
                else if (item.effect === 'stamina') particles.emit(player.px + HALF_TILE, player.py + HALF_TILE, 6, '#e8c040', 1.5);
                else particles.emit(player.px + HALF_TILE, player.py + HALF_TILE, 8, '#d060e8', 2);
            }
        } else if (item.type === ITEM_TYPE.WEAPON) {
            player.equipWeapon(slot.id);
            UI.showMessage(`Equipped ${item.name}!`);
            Audio.sfx.equip();
        } else if (item.type === ITEM_TYPE.ACCESSORY) {
            player.equipAccessory(slot.id);
            UI.showMessage(`Equipped ${item.name}!`);
            Audio.sfx.equip();
        }
    }

    function handleDropItem() {
        const slot = player.getSelectedItem();
        if (!slot) return;
        const item = ITEM_DB[slot.id];
        player.removeItem(slot.id, 1);
        UI.showMessage(`Dropped ${item ? item.name : 'item'}.`);
    }

    function updateInventory() {
        const cols = 6;
        if (isJustPressed('ArrowRight') || isJustPressed('KeyD')) {
            UI.invCursor = Math.min(23, UI.invCursor + 1);
            Audio.sfx.select();
        }
        if (isJustPressed('ArrowLeft') || isJustPressed('KeyA')) {
            UI.invCursor = Math.max(0, UI.invCursor - 1);
            Audio.sfx.select();
        }
        if (isJustPressed('ArrowDown') || isJustPressed('KeyS')) {
            UI.invCursor = Math.min(23, UI.invCursor + cols);
            Audio.sfx.select();
        }
        if (isJustPressed('ArrowUp') || isJustPressed('KeyW')) {
            UI.invCursor = Math.max(0, UI.invCursor - cols);
            Audio.sfx.select();
        }

        if (isJustPressed('KeyE') || isJustPressed('Space')) {
            // Use/Equip selected item
            const oldSlot = player.selectedSlot;
            player.selectedSlot = UI.invCursor;
            handleUseItem();
            player.selectedSlot = oldSlot;
        }

        if (isJustPressed('KeyQ')) {
            const slot = player.inventory[UI.invCursor];
            if (slot) {
                const item = ITEM_DB[slot.id];
                player.inventory[UI.invCursor] = null;
                UI.showMessage(`Dropped ${item ? item.name : 'item'}.`);
            }
        }

        if (isJustPressed('KeyI') || isJustPressed('Tab') || isJustPressed('Escape')) {
            state = STATE.PLAYING;
            Audio.sfx.close();
        }
    }

    function updateShop() {
        if (isJustPressed('ArrowDown') || isJustPressed('KeyS')) {
            UI.shopScroll = Math.min(UI.shopItems.length - 1, UI.shopScroll + 1);
            Audio.sfx.select();
        }
        if (isJustPressed('ArrowUp') || isJustPressed('KeyW')) {
            UI.shopScroll = Math.max(0, UI.shopScroll - 1);
            Audio.sfx.select();
        }
        if (isJustPressed('KeyE') || isJustPressed('Enter')) {
            const itemId = UI.shopItems[UI.shopScroll];
            const item = ITEM_DB[itemId];
            if (item && player.gold >= item.price) {
                // Check if player already has the tool
                if (item.type === ITEM_TYPE.TOOL && player.hasItem(itemId)) {
                    UI.showMessage('You already have this!');
                    Audio.sfx.error();
                } else {
                    player.gold -= item.price;
                    player.addItem(itemId, 1);
                    UI.showMessage(`Bought ${item.name}!`);
                    Audio.sfx.coin();
                }
            } else if (item) {
                UI.showMessage("Can't afford that!");
                Audio.sfx.error();
            }
        }
        if (isJustPressed('Escape')) {
            state = STATE.PLAYING;
            Audio.sfx.close();
        }
    }

    function updateCrafting() {
        if (isJustPressed('ArrowDown') || isJustPressed('KeyS')) {
            UI.craftScroll = Math.min(RECIPES.length - 1, UI.craftScroll + 1);
            Audio.sfx.select();
        }
        if (isJustPressed('ArrowUp') || isJustPressed('KeyW')) {
            UI.craftScroll = Math.max(0, UI.craftScroll - 1);
            Audio.sfx.select();
        }
        if (isJustPressed('KeyE') || isJustPressed('Enter')) {
            const recipe = RECIPES[UI.craftScroll];
            if (recipe && Crafting.canCraft(recipe, player)) {
                Crafting.craft(recipe, player);
                const resultName = ITEM_DB[recipe.result]?.name || '?';
                UI.showMessage(`Crafted ${resultName}!`);
            } else {
                UI.showMessage('Not enough materials!');
                Audio.sfx.error();
            }
        }
        if (isJustPressed('Escape')) {
            state = STATE.PLAYING;
            Audio.sfx.close();
        }
    }

    function updateDialogue() {
        NPCDialogue.update();
        if (isJustPressed('KeyE') || isJustPressed('Enter')) {
            NPCDialogue.advance();
        }
        if (isJustPressed('Escape')) {
            NPCDialogue.close();
            state = STATE.PLAYING;
        }
    }

    function updateFishing() {
        const result = Fishing.update(keys);
        if (result && result.done) {
            state = STATE.PLAYING;
            if (result.fish) {
                player.addItem(result.fish.id, 1);
                const fishItem = ITEM_DB[result.fish.id];
                UI.showMessage(`Caught a ${fishItem.name}!`);
                player.gainXP(5 + result.fish.difficulty * 3);
            }
        }
        if (isJustPressed('Escape')) {
            Fishing.stop();
            state = STATE.PLAYING;
        }
    }

    // ---- CAMERA ----
    function updateCamera() {
        const targetX = player.px - CANVAS_W / 2 + HALF_TILE;
        const targetY = player.py - CANVAS_H / 2 + HALF_TILE;
        camX = lerp(camX, targetX, 0.1);
        camY = lerp(camY, targetY, 0.1);
        camX = clamp(camX, 0, currentMap.width * TILE - CANVAS_W);
        camY = clamp(camY, 0, currentMap.height * TILE - CANVAS_H);
    }

    // ---- TRANSITIONS ----
    function startTransition(callback) {
        transition = { active: true, alpha: 0, callback, phase: 'out' };
    }

    function updateTransition() {
        if (transition.phase === 'out') {
            transition.alpha += 0.05;
            if (transition.alpha >= 1) {
                transition.alpha = 1;
                if (transition.callback) transition.callback();
                transition.phase = 'in';
            }
        } else if (transition.phase === 'in') {
            transition.alpha -= 0.05;
            if (transition.alpha <= 0) {
                transition.alpha = 0;
                transition.active = false;
                transition.phase = 'none';
            }
        }
    }

    // ---- RENDER ----
    function render() {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        switch (state) {
            case STATE.TITLE:
                renderTitle();
                break;
            default:
                renderGame();
                break;
        }

        // Transition overlay
        if (transition.active) {
            ctx.fillStyle = `rgba(0, 0, 0, ${transition.alpha})`;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        }
    }

    function renderTitle() {
        titleFrame++;

        // Sky gradient
        const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
        grad.addColorStop(0, '#0a0a2a');
        grad.addColorStop(0.4, '#1a1a4a');
        grad.addColorStop(0.7, '#2a3a5a');
        grad.addColorStop(1, '#3a5a3a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Stars
        for (const star of titleStars) {
            const twinkle = Math.sin(titleFrame * 0.03 + star.twinkle) * 0.5 + 0.5;
            ctx.globalAlpha = twinkle;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(star.x, star.y, star.size, star.size);
        }
        ctx.globalAlpha = 1;

        // Moon
        ctx.fillStyle = '#e8e0c0';
        Sprites.fillCircle(ctx, 760, 80, 30);
        ctx.fillStyle = '#0a0a2a';
        Sprites.fillCircle(ctx, 770, 75, 26);

        // Hills (parallax)
        const hillOff = Math.sin(titleFrame * 0.005) * 5;
        // Far hills
        ctx.fillStyle = '#1a3a2a';
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_H);
        for (let x = 0; x <= CANVAS_W; x += 20) {
            ctx.lineTo(x, 380 + Math.sin(x * 0.008 + hillOff * 0.3) * 40);
        }
        ctx.lineTo(CANVAS_W, CANVAS_H);
        ctx.fill();

        // Near hills
        ctx.fillStyle = '#2a5a3a';
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_H);
        for (let x = 0; x <= CANVAS_W; x += 15) {
            ctx.lineTo(x, 440 + Math.sin(x * 0.012 + hillOff * 0.6) * 30);
        }
        ctx.lineTo(CANVAS_W, CANVAS_H);
        ctx.fill();

        // Ground
        ctx.fillStyle = '#3a6a3a';
        ctx.fillRect(0, 520, CANVAS_W, CANVAS_H - 520);

        // Trees
        for (let i = 0; i < 8; i++) {
            const tx = i * 130 + 30 + Math.sin(i * 2.5) * 20;
            const ty = 470 + Math.sin(i * 1.7) * 20;
            const sway = Math.sin(titleFrame * 0.02 + i) * 2;
            // Trunk
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(tx + 8 + sway, ty, 8, 50);
            // Canopy
            ctx.fillStyle = '#2a6a2a';
            Sprites.fillCircle(ctx, tx + 12 + sway, ty - 5, 18);
            ctx.fillStyle = '#3a8a3a';
            Sprites.fillCircle(ctx, tx + 10 + sway, ty - 10, 14);
            ctx.fillStyle = '#4a9a4a';
            Sprites.fillCircle(ctx, tx + 14 + sway, ty - 15, 10);
        }

        // Title text
        const titleGlow = Math.sin(titleFrame * 0.04) * 0.3 + 0.7;
        ctx.save();
        ctx.shadowColor = `rgba(90, 184, 90, ${titleGlow * 0.6})`;
        ctx.shadowBlur = 20;
        ctx.font = 'bold 52px "Nunito", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(90, 184, 90, ${titleGlow})`;
        ctx.fillText('VERDANT HOLLOW', CANVAS_W / 2, 180);
        ctx.shadowBlur = 0;
        ctx.restore();

        // Subtitle
        drawText(ctx, 'A Farming & Dungeon RPG', CANVAS_W / 2, 210, 'rgba(200, 200, 180, 0.7)', 16, 'center');

        // Menu options
        const blink = Math.floor(titleFrame / 30) % 2 === 0;
        if (blink) {
            drawTextBold(ctx, 'Press ENTER to Start', CANVAS_W / 2, 290, COLORS.UI_TEXT, 18, 'center');
        }

        if (SaveSystem.hasSave()) {
            drawText(ctx, 'Press L to Load Save', CANVAS_W / 2, 325, COLORS.UI_GOLD, 14, 'center');
        }

        // Controls
        drawText(ctx, 'WASD: Move  |  E: Interact  |  I: Inventory  |  Space: Use Item  |  1-8: Hotbar',
            CANVAS_W / 2, CANVAS_H - 30, COLORS.UI_TEXT_DIM, 11, 'center');
    }

    function renderGame() {
        const map = currentMap;

        // Calculate visible tile range
        const startX = Math.max(0, Math.floor(camX / TILE) - 1);
        const startY = Math.max(0, Math.floor(camY / TILE) - 1);
        const endX = Math.min(map.width, startX + TILES_X + 2);
        const endY = Math.min(map.height, startY + TILES_Y + 2);

        // Render tiles
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tile = map.tiles[y][x];
                const sprite = Sprites.getTileSprite(tile, x, y, frame);
                ctx.drawImage(sprite, x * TILE - camX, y * TILE - camY);
            }
        }

        // Render objects and entities sorted by Y (painter's algorithm)
        const renderList = [];

        // Objects
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const obj = map.objects[y][x];
                if (obj !== OBJECTS.NONE) {
                    renderList.push({ type: 'object', obj, x, y, sortY: y });
                }
            }
        }

        // Interactables (visual ones)
        for (const inter of map.interactables) {
            if (inter.x >= startX && inter.x < endX && inter.y >= startY && inter.y < endY) {
                renderList.push({ type: 'interactable', inter, x: inter.x, y: inter.y, sortY: inter.y });
            }
        }

        // Crops
        for (const crop of map.crops) {
            if (crop.x >= startX && crop.x < endX && crop.y >= startY && crop.y < endY) {
                renderList.push({ type: 'crop', crop, x: crop.x, y: crop.y, sortY: crop.y });
            }
        }

        // NPCs
        for (const npc of map.npcs) {
            renderList.push({ type: 'npc', npc, x: npc.x, y: npc.y, sortY: npc.y });
        }

        // Enemies
        for (const enemy of map.enemies) {
            if (enemy.hp > 0) {
                renderList.push({ type: 'enemy', enemy, x: enemy.x, y: enemy.y, sortY: enemy.y });
            }
        }

        // Player
        renderList.push({ type: 'player', x: player.x, y: player.y, sortY: player.y });

        // Sort by Y
        renderList.sort((a, b) => a.sortY - b.sortY);

        // Render sorted list
        for (const item of renderList) {
            switch (item.type) {
                case 'object':
                    renderObject(item.obj, item.x, item.y);
                    break;
                case 'interactable':
                    renderInteractable(item.inter);
                    break;
                case 'crop':
                    renderCrop(item.crop);
                    break;
                case 'npc':
                    renderNPC(item.npc);
                    break;
                case 'enemy':
                    renderEnemy(item.enemy);
                    break;
                case 'player':
                    renderPlayer();
                    break;
            }
        }

        // House interior decorations
        if (map.type === MAP_TYPE.HOUSE) {
            Sprites.drawHouseInterior(ctx, camX, camY);
            // Warm lighting overlay
            ctx.fillStyle = 'rgba(255, 200, 100, 0.06)';
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        }

        // Dungeon vignette
        if (map.type === MAP_TYPE.DUNGEON) {
            renderDungeonVignette();
        }

        // Time-of-day lighting
        if (map.type === MAP_TYPE.OVERWORLD) {
            const lighting = player.getTimeLighting();
            ctx.fillStyle = lighting.color;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        }

        // Weather
        Weather.render(ctx);

        // Particles
        particles.render(ctx, camX, camY);
        floatingTexts.render(ctx, camX, camY);

        // Death overlay
        if (player.dead) {
            const deathAlpha = Math.min(1, (DEATH_TIMER - player.deathTimer) / 30);
            ctx.fillStyle = `rgba(100, 20, 20, ${deathAlpha * 0.4})`;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
            drawTextBold(ctx, 'Defeated!', CANVAS_W / 2, CANVAS_H / 2 - 20, '#e86565', 32, 'center');
            drawText(ctx, 'Returning to farm...', CANVAS_W / 2, CANVAS_H / 2 + 20, COLORS.UI_TEXT_DIM, 16, 'center');
        }

        // UI layers
        UI.renderHUD(ctx, player);
        UI.renderHotbar(ctx, player);
        UI.renderMinimap(ctx, map, player);
        UI.renderMessages(ctx);

        // State-specific UI
        if (state === STATE.INVENTORY) UI.renderInventory(ctx, player);
        if (state === STATE.SHOP) UI.renderShop(ctx, player);
        if (state === STATE.CRAFTING) UI.renderCrafting(ctx, player);
        if (state === STATE.DIALOGUE) NPCDialogue.render(ctx);
        if (state === STATE.FISHING) Fishing.render(ctx);
    }

    function renderObject(obj, x, y) {
        const sx = x * TILE - camX;
        const sy = y * TILE - camY;

        switch (obj) {
            case OBJECTS.TREE: {
                const sprite = Sprites.getTreeSprite(tileHash(x, y));
                ctx.drawImage(sprite, sx - 16, sy - 32);
                break;
            }
            case OBJECTS.ROCK: {
                const sprite = Sprites.getRockSprite(tileHash(x, y));
                ctx.drawImage(sprite, sx, sy);
                break;
            }
            case OBJECTS.BUSH: {
                const sprite = Sprites.getBushSprite(tileHash(x, y));
                ctx.drawImage(sprite, sx, sy);
                break;
            }
            case OBJECTS.HOUSE: {
                // Only render from top-left tile of house
                if (x === HOUSE_TILE_X && y === HOUSE_TILE_Y) {
                    const sprite = Sprites.getHouseSprite();
                    ctx.drawImage(sprite, sx, sy - TILE);
                }
                break;
            }
            case OBJECTS.FENCE: {
                const sprite = Sprites.getFenceSprite();
                ctx.drawImage(sprite, sx, sy);
                break;
            }
        }
    }

    function renderInteractable(inter) {
        const sx = inter.x * TILE - camX;
        const sy = inter.y * TILE - camY;

        switch (inter.type) {
            case INTERACT_TYPE.DUNGEON_ENTRANCE: {
                const sprite = Sprites.getDungeonEntranceSprite();
                ctx.drawImage(sprite, sx - 16, sy - 16);
                break;
            }
            case INTERACT_TYPE.CRAFTING_BENCH: {
                const sprite = Sprites.getCraftingBenchSprite();
                ctx.drawImage(sprite, sx, sy);
                break;
            }
            case INTERACT_TYPE.CHEST: {
                const opened = inter.data && inter.data.opened;
                const sprite = Sprites.getChestSprite(opened);
                ctx.drawImage(sprite, sx, sy);
                break;
            }
            case INTERACT_TYPE.SHIPPING_BIN: {
                const sprite = Sprites.getShippingBinSprite();
                ctx.drawImage(sprite, sx, sy);
                break;
            }
            case INTERACT_TYPE.BED: {
                const sprite = Sprites.getBedSprite();
                ctx.drawImage(sprite, sx, sy);
                break;
            }
            case INTERACT_TYPE.FISHING_SPOT: {
                // Draw animated flag (use frame-keyed cache to avoid creating canvases every frame)
                const flagKey = `fishing_flag_${Math.floor(frame / 4) % 16}`;
                const flagSprite = createCachedSprite(flagKey, TILE, TILE, (fctx) => {
                    Sprites.drawFishingFlag(fctx, TILE, TILE, frame);
                });
                ctx.drawImage(flagSprite, sx, sy);
                break;
            }
        }
    }

    function renderCrop(crop) {
        const sprite = Sprites.getCropSprite(crop.type, crop.stage, crop.maxStage, crop.color, crop.watered);
        ctx.drawImage(sprite, crop.x * TILE - camX, crop.y * TILE - camY);
    }

    function renderNPC(npc) {
        const sprite = Sprites.getNPCSprite(npc.type);
        ctx.drawImage(sprite, npc.x * TILE - camX, npc.y * TILE - camY);

        // Name label
        drawText(ctx, npc.name, npc.x * TILE - camX + HALF_TILE, npc.y * TILE - camY - 8, COLORS.UI_GOLD, 10, 'center');
    }

    function renderEnemy(enemy) {
        if (enemy.hitFlash > 0 && enemy.hitFlash % 3 === 0) {
            ctx.globalAlpha = 0.3;
        }

        const sprite = Sprites.getEnemySprite(enemy.type, frame, 0);
        const offset = enemy.type === ENEMY_TYPE.BOSS ? -8 : 0;
        ctx.drawImage(sprite, enemy.px - camX + offset, enemy.py - camY + offset);

        ctx.globalAlpha = 1;

        // HP bar above enemy
        if (enemy.hp < enemy.maxHp) {
            const bx = enemy.px - camX + 2;
            const by = enemy.py - camY - 6;
            drawBar(ctx, bx, by, TILE - 4, 4, enemy.hp / enemy.maxHp, '#e86565');
        }
    }

    function renderPlayer() {
        if (player.dead) {
            const progress = 1 - (player.deathTimer / DEATH_TIMER);
            ctx.globalAlpha = 1 - progress * 0.7;
            ctx.save();
            const px = player.px - camX;
            const py = player.py - camY;
            ctx.translate(px + HALF_TILE, py + TILE);
            ctx.scale(1 + progress * 0.5, 1 - progress * 0.7);
            ctx.translate(-HALF_TILE, -TILE);
            const toolType = player.weapon ? 'sword' : null;
            const sprite = Sprites.getPlayerSprite(player.dir, 0, 0, null, 0);
            ctx.drawImage(sprite, 0, 0);
            ctx.restore();
            ctx.globalAlpha = 1;
            return;
        }

        const toolType = player.actionTimer > 0 ? getActiveToolType() : null;
        const sprite = Sprites.getPlayerSprite(player.dir, player.walkFrame, player.actionTimer, toolType, player.breathFrame);
        ctx.drawImage(sprite, player.px - camX, player.py - camY);
    }

    function getActiveToolType() {
        const item = player.getSelectedItemData();
        if (item) {
            if (item.toolType) return item.toolType;
            if (item.type === ITEM_TYPE.WEAPON) return 'sword';
        }
        return player.weapon ? 'sword' : null;
    }

    function renderDungeonVignette() {
        // Radial shadow vignette
        const grad = ctx.createRadialGradient(
            CANVAS_W / 2, CANVAS_H / 2, CANVAS_W * 0.2,
            CANVAS_W / 2, CANVAS_H / 2, CANVAS_W * 0.6
        );
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    // Public API
    return { init };
})();

// Start the game when DOM is ready
window.addEventListener('DOMContentLoaded', Game.init);
