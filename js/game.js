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

    // Screen shake
    let shakeTimer = 0, shakeIntensity = 0;
    function triggerShake(intensity, duration) {
        shakeIntensity = intensity || 4;
        shakeTimer = duration || 10;
    }

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
            case STATE.PAUSED:
                updatePaused();
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

        // Pause
        if (isJustPressed('Escape')) {
            state = STATE.PAUSED;
            Audio.sfx.open();
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
            const hpBefore = player.hp;
            Combat.updateEnemies(currentMap, player, particles, floatingTexts);
            if (player.hp < hpBefore) {
                triggerShake(4, 8);
            }
            if (player.dead && hpBefore > 0) {
                triggerShake(8, 20);
            }
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
                triggerShake(3, 6);
                if (result) {
                    triggerShake(6, 12);
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
                triggerShake(3, 6);
                if (result) {
                    triggerShake(6, 12);
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
                if (player.stamina < 2) {
                    UI.showMessage('Too tired! Rest or use a tonic.');
                    Audio.sfx.error();
                    return;
                }
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

            // Till soil (only in farm zone)
            if (selectedItem && selectedItem.toolType === TOOL_TYPE.HOE) {
                const inFarmZone = fx >= FARM_X && fx < FARM_X + FARM_W && fy >= FARM_Y && fy < FARM_Y + FARM_H;
                if (!inFarmZone && currentMap.tiles[fy] && currentMap.tiles[fy][fx] === TILES.DIRT) {
                    UI.showMessage('Can only till soil in the farm area.');
                    Audio.sfx.error();
                    return;
                }
                if (player.stamina < 3) {
                    UI.showMessage('Too tired! Rest or use a tonic.');
                    Audio.sfx.error();
                    return;
                }
                if (Farming.till(currentMap, player, fx, fy)) {
                    UI.showMessage('Tilled soil.');
                    particles.emit(fx * TILE + HALF_TILE, fy * TILE + HALF_TILE, 4, '#8a6a42', 1.5);
                    return;
                }
            }

            // Chop tree
            if (currentMap.objects[fy] && currentMap.objects[fy][fx] === OBJECTS.TREE) {
                if (!player.hasItem(ITEM.AXE)) {
                    UI.showMessage('Need an axe to chop trees.');
                    return;
                }
                if (player.stamina < 5) {
                    UI.showMessage('Too tired! Rest or use a tonic.');
                    Audio.sfx.error();
                    return;
                }
                if (Farming.chopTree(currentMap, player, fx, fy)) {
                    UI.showMessage('Chopped tree! Got wood.');
                    particles.emit(fx * TILE + HALF_TILE, fy * TILE + HALF_TILE, 8, '#6a4a2a', 2);
                    return;
                }
            }

            // Mine rock
            if (currentMap.objects[fy] && currentMap.objects[fy][fx] === OBJECTS.ROCK) {
                if (player.stamina < 5) {
                    UI.showMessage('Too tired! Rest or use a tonic.');
                    Audio.sfx.error();
                    return;
                }
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

    function updatePaused() {
        if (isJustPressed('Escape') || isJustPressed('KeyP')) {
            state = STATE.PLAYING;
            Audio.sfx.close();
        }
        if (isJustPressed('KeyS') || isJustPressed('Digit1')) {
            if (currentMap.type !== MAP_TYPE.DUNGEON) {
                if (SaveSystem.save(player, overworldMap, Weather.current)) {
                    UI.showMessage('Game saved!');
                }
            } else {
                UI.showMessage("Can't save in the dungeon!");
                Audio.sfx.error();
            }
        }
        if (isJustPressed('KeyQ')) {
            startTransition(() => {
                state = STATE.TITLE;
                Audio.stopMusic();
                Audio.playMusic('title');
            });
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

        // Animated player character on ground
        const playerTitleX = 180;
        const playerTitleY = 490;
        const walkDir = Math.floor(titleFrame / 40) % 4;
        const walkAnimFrame = Math.floor(titleFrame / 10);
        const playerSprite = Sprites.getPlayerSprite(DIR.DOWN, walkAnimFrame, 0, null, titleFrame);
        ctx.save();
        ctx.translate(playerTitleX, playerTitleY);
        ctx.scale(2.5, 2.5);
        ctx.drawImage(playerSprite, 0, 0);
        ctx.restore();

        // Small house near player
        const houseSprite = Sprites.getHouseSprite();
        ctx.save();
        ctx.translate(70, 468);
        ctx.scale(0.8, 0.8);
        ctx.drawImage(houseSprite, 0, 0);
        ctx.restore();

        // Title text
        const titleGlow = Math.sin(titleFrame * 0.04) * 0.3 + 0.7;
        ctx.save();
        ctx.shadowColor = `rgba(90, 184, 90, ${titleGlow * 0.6})`;
        ctx.shadowBlur = 20;
        ctx.font = 'bold 52px "Nunito", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(90, 184, 90, ${titleGlow})`;
        ctx.fillText('VERDANT HOLLOW', CANVAS_W / 2, 160);
        ctx.shadowBlur = 0;
        ctx.restore();

        // Subtitle
        drawText(ctx, 'A Farming & Dungeon RPG', CANVAS_W / 2, 195, 'rgba(200, 200, 180, 0.7)', 16, 'center');

        // Menu options
        const blink = Math.floor(titleFrame / 30) % 2 === 0;
        const menuY = 260;
        if (blink) {
            drawTextBold(ctx, 'Press ENTER to Start', CANVAS_W / 2, menuY, COLORS.UI_TEXT, 18, 'center');
        }

        if (SaveSystem.hasSave()) {
            drawText(ctx, 'Press L to Load Save', CANVAS_W / 2, menuY + 35, COLORS.UI_GOLD, 14, 'center');
        }

        // Feature highlights
        const featureY = menuY + 80;
        const features = [
            { icon: 'Farm', color: '#5ab85a' },
            { icon: 'Fish', color: '#6aaedd' },
            { icon: 'Craft', color: '#e8c040' },
            { icon: 'Fight', color: '#e86565' }
        ];
        const fGap = 100;
        const fStartX = CANVAS_W / 2 - (features.length - 1) * fGap / 2;
        for (let i = 0; i < features.length; i++) {
            const fx = fStartX + i * fGap;
            const bounce = Math.sin(titleFrame * 0.05 + i * 1.5) * 3;
            ctx.fillStyle = features[i].color;
            Sprites.fillCircle(ctx, fx, featureY + bounce, 18);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            Sprites.fillCircle(ctx, fx, featureY + bounce, 14);
            drawTextBold(ctx, features[i].icon, fx, featureY + bounce - 6, features[i].color, 11, 'center');
        }

        // Controls panel
        ctx.fillStyle = 'rgba(20, 18, 30, 0.7)';
        roundRect(ctx, CANVAS_W / 2 - 280, CANVAS_H - 52, 560, 44, 6);
        ctx.fill();
        drawText(ctx, 'Arrows/WASD: Move  |  E: Interact  |  I: Inventory  |  Space: Use  |  1-8: Hotbar  |  ESC: Pause',
            CANVAS_W / 2, CANVAS_H - 38, COLORS.UI_TEXT_DIM, 11, 'center');
        drawText(ctx, 'Q: Drop  |  P: Quick Save  |  Hold Space: Fishing',
            CANVAS_W / 2, CANVAS_H - 22, COLORS.UI_TEXT_DIM, 10, 'center');
    }

    function renderGame() {
        const map = currentMap;

        // Apply screen shake
        ctx.save();
        if (shakeTimer > 0) {
            shakeTimer--;
            const sx = (Math.random() - 0.5) * shakeIntensity * 2;
            const sy = (Math.random() - 0.5) * shakeIntensity * 2;
            ctx.translate(sx, sy);
        }

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
            ctx.fillStyle = `rgba(80, 10, 10, ${deathAlpha * 0.55})`;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

            // Vignette effect
            const vigGrad = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H / 2, 50, CANVAS_W / 2, CANVAS_H / 2, CANVAS_W * 0.5);
            vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
            vigGrad.addColorStop(1, `rgba(80, 0, 0, ${deathAlpha * 0.6})`);
            ctx.fillStyle = vigGrad;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

            drawTextBold(ctx, 'Defeated!', CANVAS_W / 2, CANVAS_H / 2 - 30, '#e86565', 36, 'center');
            const goldLost = Math.floor(player.gold * 0.2);
            if (goldLost > 0) {
                drawText(ctx, `Lost ${goldLost}G...`, CANVAS_W / 2, CANVAS_H / 2 + 10, COLORS.UI_GOLD, 14, 'center');
            }
            drawText(ctx, 'Returning to farm...', CANVAS_W / 2, CANVAS_H / 2 + 35, COLORS.UI_TEXT_DIM, 14, 'center');
        }

        // UI layers
        UI.setHudExtra({
            weather: Weather.current,
            mapType: currentMap.type,
            dungeonFloor: dungeonFloor
        });
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
        if (state === STATE.PAUSED) renderPaused();

        // Interaction prompt (when playing, near interactable)
        if (state === STATE.PLAYING && !player.dead) {
            renderInteractionPrompt();
        }

        // Hotbar tooltip
        if (state === STATE.PLAYING) {
            renderHotbarTooltip();
        }

        // Close screen shake transform
        ctx.restore();
    }

    function renderPaused() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        const pw = 280, ph = 220;
        const px = (CANVAS_W - pw) / 2, py = (CANVAS_H - ph) / 2;

        ctx.fillStyle = 'rgba(25, 22, 40, 0.95)';
        roundRect(ctx, px, py, pw, ph, 10);
        ctx.fill();
        ctx.strokeStyle = COLORS.UI_BORDER;
        ctx.lineWidth = 2;
        roundRect(ctx, px, py, pw, ph, 10);
        ctx.stroke();

        drawTextBold(ctx, 'PAUSED', CANVAS_W / 2, py + 18, COLORS.UI_TEXT, 24, 'center');

        const opts = [
            { key: 'ESC', label: 'Resume Game' },
            { key: 'S', label: 'Save Game' },
            { key: 'Q', label: 'Return to Title' }
        ];
        for (let i = 0; i < opts.length; i++) {
            const oy = py + 70 + i * 40;
            ctx.fillStyle = 'rgba(90, 138, 74, 0.15)';
            roundRect(ctx, px + 20, oy, pw - 40, 32, 6);
            ctx.fill();
            drawTextBold(ctx, opts[i].key, px + 36, oy + 8, COLORS.UI_GOLD, 14, 'left');
            drawText(ctx, opts[i].label, px + 80, oy + 9, COLORS.UI_TEXT, 14, 'left', false);
        }

        // Stats display
        drawText(ctx, `Lv${player.level} | Day ${player.day} ${player.seasonName} | ${player.gold}G`,
            CANVAS_W / 2, py + ph - 28, COLORS.UI_TEXT_DIM, 11, 'center');
    }

    function renderInteractionPrompt() {
        const facing = player.getFacingTile();
        const fx = facing.x, fy = facing.y;

        let promptText = null;
        let promptY = fy;
        let promptX = fx;

        // Check interactable at facing tile
        let inter = currentMap.getInteractable(fx, fy) || currentMap.getInteractable(player.x, player.y);

        // Proximity house door
        if (!inter && currentMap.type === MAP_TYPE.OVERWORLD) {
            for (const ia of currentMap.interactables) {
                if (ia.type === INTERACT_TYPE.HOUSE_DOOR && manhattan(player.x, player.y, ia.x, ia.y) <= 2) {
                    inter = ia;
                    promptX = ia.x;
                    promptY = ia.y;
                    break;
                }
            }
        }

        // NPC
        const npc = currentMap.getNPC(fx, fy);
        if (npc) {
            promptText = npc.shopType ? '[E] Shop' : '[E] Talk';
        } else if (inter) {
            switch (inter.type) {
                case INTERACT_TYPE.HOUSE_DOOR: promptText = '[E] Enter'; break;
                case INTERACT_TYPE.HOUSE_EXIT: promptText = '[E] Exit'; break;
                case INTERACT_TYPE.BED: promptText = '[E] Sleep'; break;
                case INTERACT_TYPE.CHEST:
                    promptText = inter.data && inter.data.opened ? '[E] (Opened)' : '[E] Open'; break;
                case INTERACT_TYPE.CRAFTING_BENCH: promptText = '[E] Craft'; break;
                case INTERACT_TYPE.SHIPPING_BIN: promptText = '[E] Sell'; break;
                case INTERACT_TYPE.FISHING_SPOT: promptText = '[E] Fish'; break;
                case INTERACT_TYPE.DUNGEON_ENTRANCE: promptText = '[E] Enter Dungeon'; break;
                case INTERACT_TYPE.DUNGEON_EXIT: promptText = '[E] Leave Dungeon'; break;
                case INTERACT_TYPE.STAIRS_DOWN: promptText = '[E] Go Deeper'; break;
            }
        }

        // Enemy
        if (!promptText && currentMap.type === MAP_TYPE.DUNGEON) {
            const enemy = currentMap.getEnemy(fx, fy);
            if (enemy && enemy.hp > 0) {
                promptText = '[E] Attack';
            }
        }

        if (promptText) {
            const sx = promptX * TILE - camX + HALF_TILE;
            const sy = promptY * TILE - camY - 14;
            const bob = Math.sin(frame * 0.1) * 2;
            ctx.font = '11px "Nunito", sans-serif';
            const tw = ctx.measureText(promptText).width;
            ctx.fillStyle = 'rgba(20, 18, 30, 0.8)';
            roundRect(ctx, sx - tw / 2 - 6, sy - 4 + bob, tw + 12, 18, 4);
            ctx.fill();
            drawText(ctx, promptText, sx, sy + bob, COLORS.UI_HIGHLIGHT, 11, 'center', false);
        }
    }

    function renderHotbarTooltip() {
        const slot = player.getSelectedItem();
        if (!slot) return;
        const item = ITEM_DB[slot.id];
        if (!item) return;

        // Position above selected hotbar slot
        const slots = 8, slotSize = 38, gap = 4;
        const totalW = slots * slotSize + (slots - 1) * gap;
        const hx = (CANVAS_W - totalW) / 2;
        const sx = hx + player.selectedSlot * (slotSize + gap) + slotSize / 2;
        const sy = CANVAS_H - slotSize - 30;

        ctx.font = '11px "Nunito", sans-serif';
        const tw = ctx.measureText(item.name).width;
        ctx.fillStyle = 'rgba(20, 18, 30, 0.85)';
        roundRect(ctx, sx - tw / 2 - 6, sy - 4, tw + 12, 18, 4);
        ctx.fill();
        drawText(ctx, item.name, sx, sy, COLORS.UI_TEXT, 11, 'center', false);
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
