// ============================================================
// VERDANT HOLLOW — World Map Generation
// ============================================================

class WorldMap {
    constructor(width, height, type) {
        this.width = width;
        this.height = height;
        this.type = type;
        this.tiles = [];
        this.objects = [];
        this.crops = [];
        this.npcs = [];
        this.interactables = [];
        this.enemies = [];
        this.rooms = [];
        this.explored = null; // For dungeon minimap

        for (let y = 0; y < height; y++) {
            this.tiles[y] = new Array(width).fill(TILES.GRASS);
            this.objects[y] = new Array(width).fill(OBJECTS.NONE);
        }
    }

    isWalkable(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
        const tile = this.tiles[y][x];
        if (tile === TILES.WATER || tile === TILES.WALL || tile === TILES.DUNGEON_WALL || tile === TILES.INTERIOR_WALL) return false;
        const obj = this.objects[y][x];
        if (obj === OBJECTS.TREE || obj === OBJECTS.ROCK || obj === OBJECTS.FENCE || obj === OBJECTS.HOUSE) return false;
        return true;
    }

    getInteractable(x, y) {
        return this.interactables.find(i => i.x === x && i.y === y);
    }

    getNPC(x, y) {
        return this.npcs.find(n => n.x === x && n.y === y);
    }

    getEnemy(x, y) {
        return this.enemies.find(e => e.x === x && e.y === y && e.hp > 0);
    }

    getCrop(x, y) {
        return this.crops.find(c => c.x === x && c.y === y);
    }
}

// ---- OVERWORLD GENERATION ----
function generateOverworld() {
    const map = new WorldMap(OVERWORLD_W, OVERWORLD_H, MAP_TYPE.OVERWORLD);
    const noise = new SimpleNoise(12345);
    const noise2 = new SimpleNoise(54321);

    // Protected zones (don't place noise terrain or objects here)
    const protectedZones = [];

    function isProtected(x, y) {
        for (const z of protectedZones) {
            if (x >= z.x - 1 && x < z.x + z.w + 1 && y >= z.y - 1 && y < z.y + z.h + 1) return true;
        }
        return false;
    }

    // Base terrain from noise
    for (let y = 0; y < OVERWORLD_H; y++) {
        for (let x = 0; x < OVERWORLD_W; x++) {
            const n = noise.fbm(x * 0.08, y * 0.08, 3);
            const n2 = noise2.fbm(x * 0.06, y * 0.06, 2);
            if (n < -0.3) map.tiles[y][x] = TILES.WATER;
            else if (n < -0.15) map.tiles[y][x] = TILES.SAND;
            else if (n2 > 0.4) map.tiles[y][x] = TILES.STONE;
            else map.tiles[y][x] = TILES.GRASS;
        }
    }

    // ---- FARM ZONE ----
    protectedZones.push({ x: FARM_X - 1, y: FARM_Y - 1, w: FARM_W + 2, h: FARM_H + 2 });
    for (let y = FARM_Y; y < FARM_Y + FARM_H; y++) {
        for (let x = FARM_X; x < FARM_X + FARM_W; x++) {
            map.tiles[y][x] = TILES.DIRT;
        }
    }
    // Fence around farm
    for (let x = FARM_X - 1; x <= FARM_X + FARM_W; x++) {
        if (x !== FARM_X + Math.floor(FARM_W / 2) && x !== FARM_X + Math.floor(FARM_W / 2) + 1) {
            map.objects[FARM_Y - 1][x] = OBJECTS.FENCE;
        }
        if (x !== FARM_X + Math.floor(FARM_W / 2) && x !== FARM_X + Math.floor(FARM_W / 2) + 1) {
            map.objects[FARM_Y + FARM_H][x] = OBJECTS.FENCE;
        }
    }
    for (let y = FARM_Y - 1; y <= FARM_Y + FARM_H; y++) {
        map.objects[y][FARM_X - 1] = OBJECTS.FENCE;
        map.objects[y][FARM_X + FARM_W] = OBJECTS.FENCE;
    }
    // Remove fence between farm and house
    for (let x = FARM_X; x <= FARM_X + FARM_W; x++) {
        map.objects[FARM_Y - 1][x] = OBJECTS.NONE;
    }

    // Shipping bin near farm
    map.interactables.push({ x: FARM_X + FARM_W + 1, y: FARM_Y + 2, type: INTERACT_TYPE.SHIPPING_BIN });
    map.tiles[FARM_Y + 2][FARM_X + FARM_W + 1] = TILES.GRASS;
    map.objects[FARM_Y + 2][FARM_X + FARM_W + 1] = OBJECTS.NONE;

    // ---- HOUSE ----
    const hx = HOUSE_TILE_X, hy = HOUSE_TILE_Y;
    protectedZones.push({ x: hx - 5, y: hy - 3, w: 13, h: 12 });

    // Clear wide area around house
    for (let y = hy - 4; y <= hy + 6; y++) {
        for (let x = hx - 5; x <= hx + 7; x++) {
            if (y >= 0 && y < OVERWORLD_H && x >= 0 && x < OVERWORLD_W) {
                map.tiles[y][x] = TILES.GRASS;
                map.objects[y][x] = OBJECTS.NONE;
            }
        }
    }

    // House object (3x2 block)
    for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 3; dx++) {
            map.objects[hy + dy][hx + dx] = OBJECTS.HOUSE;
        }
    }

    // Path from house to farm
    for (let y = hy + 2; y <= FARM_Y; y++) {
        map.tiles[y][hx + 1] = TILES.PATH;
        map.tiles[y][hx + 2] = TILES.PATH;
        map.objects[y][hx + 1] = OBJECTS.NONE;
        map.objects[y][hx + 2] = OBJECTS.NONE;
    }
    // Extra path tiles in front of house door
    map.tiles[hy + 2][hx] = TILES.PATH;
    map.tiles[hy + 2][hx + 1] = TILES.PATH;
    map.tiles[hy + 2][hx + 2] = TILES.PATH;
    map.tiles[hy + 3][hx] = TILES.PATH;
    map.tiles[hy + 3][hx + 1] = TILES.PATH;
    map.tiles[hy + 3][hx + 2] = TILES.PATH;

    // House door interactables at multiple positions for reliability
    map.interactables.push({ x: hx + 1, y: hy + 2, type: INTERACT_TYPE.HOUSE_DOOR });
    map.interactables.push({ x: hx + 1, y: hy + 3, type: INTERACT_TYPE.HOUSE_DOOR });
    map.interactables.push({ x: hx, y: hy + 2, type: INTERACT_TYPE.HOUSE_DOOR });
    map.interactables.push({ x: hx + 2, y: hy + 2, type: INTERACT_TYPE.HOUSE_DOOR });

    // ---- TOWN ----
    protectedZones.push({ x: TOWN_X - 1, y: TOWN_Y - 1, w: TOWN_W + 2, h: TOWN_H + 2 });
    for (let y = TOWN_Y; y < TOWN_Y + TOWN_H; y++) {
        for (let x = TOWN_X; x < TOWN_X + TOWN_W; x++) {
            map.tiles[y][x] = TILES.PATH;
            map.objects[y][x] = OBJECTS.NONE;
        }
    }

    // Town NPCs
    map.npcs.push({ x: TOWN_X + 3, y: TOWN_Y + 3, type: NPC_TYPE.MERCHANT, name: 'Pip', shopType: 'general' });
    map.npcs.push({ x: TOWN_X + 8, y: TOWN_Y + 3, type: NPC_TYPE.BLACKSMITH, name: 'Forge', shopType: 'blacksmith' });
    map.npcs.push({ x: TOWN_X + 5, y: TOWN_Y + 8, type: NPC_TYPE.ELDER, name: 'Elder Rowan' });
    // Farmer Gil near farm
    map.npcs.push({ x: FARM_X - 3, y: FARM_Y + 3, type: NPC_TYPE.FARMER, name: 'Farmer Gil' });

    // Crafting bench in town
    map.interactables.push({ x: TOWN_X + 6, y: TOWN_Y + 5, type: INTERACT_TYPE.CRAFTING_BENCH });

    // ---- DUNGEON ENTRANCE ----
    protectedZones.push({ x: DUNGEON_ENTRANCE_X - 3, y: DUNGEON_ENTRANCE_Y - 3, w: 7, h: 7 });
    for (let y = DUNGEON_ENTRANCE_Y - 2; y <= DUNGEON_ENTRANCE_Y + 2; y++) {
        for (let x = DUNGEON_ENTRANCE_X - 2; x <= DUNGEON_ENTRANCE_X + 2; x++) {
            if (y >= 0 && y < OVERWORLD_H && x >= 0 && x < OVERWORLD_W) {
                map.tiles[y][x] = TILES.STONE;
                map.objects[y][x] = OBJECTS.NONE;
            }
        }
    }
    map.interactables.push({ x: DUNGEON_ENTRANCE_X, y: DUNGEON_ENTRANCE_Y, type: INTERACT_TYPE.DUNGEON_ENTRANCE });

    // ---- PATHS connecting zones ----
    function clearPath(x1, y1, x2, y2) {
        // Horizontal then vertical
        const sx = Math.min(x1, x2), ex = Math.max(x1, x2);
        const sy = Math.min(y1, y2), ey = Math.max(y1, y2);
        for (let x = sx; x <= ex; x++) {
            for (let d = 0; d <= 1; d++) {
                const py = y1 + d;
                if (py >= 0 && py < OVERWORLD_H && x >= 0 && x < OVERWORLD_W) {
                    map.tiles[py][x] = TILES.PATH;
                    map.objects[py][x] = OBJECTS.NONE;
                }
            }
        }
        for (let y = sy; y <= ey; y++) {
            for (let d = 0; d <= 1; d++) {
                const px = x2 + d;
                if (y >= 0 && y < OVERWORLD_H && px >= 0 && px < OVERWORLD_W) {
                    map.tiles[y][px] = TILES.PATH;
                    map.objects[y][px] = OBJECTS.NONE;
                }
            }
        }
    }

    // Farm↔Town
    clearPath(FARM_X + FARM_W, FARM_Y + FARM_H / 2, TOWN_X, TOWN_Y + TOWN_H / 2);
    // Farm↔Dungeon
    clearPath(FARM_X, FARM_Y, DUNGEON_ENTRANCE_X + 1, DUNGEON_ENTRANCE_Y + 1);
    // House↔Town (along top)
    clearPath(hx + 3, hy + 2, TOWN_X, hy + 2);

    // ---- FISHING SPOTS ----
    let fishingSpots = 0;
    for (let y = 2; y < OVERWORLD_H - 2 && fishingSpots < 8; y++) {
        for (let x = 2; x < OVERWORLD_W - 2 && fishingSpots < 8; x++) {
            if (map.tiles[y][x] !== TILES.WATER && map.objects[y][x] === OBJECTS.NONE) {
                // Check if adjacent to water
                const adjWater = [[0,1],[0,-1],[1,0],[-1,0]].some(([dx, dy]) =>
                    map.tiles[y + dy] && map.tiles[y + dy][x + dx] === TILES.WATER
                );
                if (adjWater && !isProtected(x, y) && Math.random() < 0.15) {
                    map.interactables.push({ x, y, type: INTERACT_TYPE.FISHING_SPOT });
                    fishingSpots++;
                }
            }
        }
    }

    // ---- SCATTER OBJECTS ----
    const rng = new SeededRandom(99999);
    for (let y = 0; y < OVERWORLD_H; y++) {
        for (let x = 0; x < OVERWORLD_W; x++) {
            if (map.tiles[y][x] === TILES.GRASS && map.objects[y][x] === OBJECTS.NONE && !isProtected(x, y)) {
                const r = rng.next();
                if (r < 0.08) map.objects[y][x] = OBJECTS.TREE;
                else if (r < 0.11) map.objects[y][x] = OBJECTS.ROCK;
                else if (r < 0.14) map.objects[y][x] = OBJECTS.BUSH;
            }
        }
    }

    // Ensure spawn is walkable
    map.tiles[SPAWN_Y][SPAWN_X] = TILES.PATH;
    map.objects[SPAWN_Y][SPAWN_X] = OBJECTS.NONE;
    map.tiles[SPAWN_Y][SPAWN_X + 1] = TILES.PATH;
    map.objects[SPAWN_Y][SPAWN_X + 1] = OBJECTS.NONE;

    return map;
}

// ---- HOUSE INTERIOR ----
function generateHouseInterior() {
    const map = new WorldMap(HOUSE_W, HOUSE_H, MAP_TYPE.HOUSE);

    // Fill with walls, then carve floor
    for (let y = 0; y < HOUSE_H; y++) {
        for (let x = 0; x < HOUSE_W; x++) {
            if (y === 0 || y === HOUSE_H - 1 || x === 0 || x === HOUSE_W - 1) {
                map.tiles[y][x] = TILES.INTERIOR_WALL;
            } else {
                map.tiles[y][x] = TILES.WOOD_FLOOR;
            }
        }
    }

    // Door exit at bottom center
    const doorX = Math.floor(HOUSE_W / 2);
    map.tiles[HOUSE_H - 1][doorX] = TILES.WOOD_FLOOR;
    map.interactables.push({ x: doorX, y: HOUSE_H - 1, type: INTERACT_TYPE.HOUSE_EXIT });
    map.interactables.push({ x: doorX, y: HOUSE_H - 2, type: INTERACT_TYPE.HOUSE_EXIT });

    // Bed
    map.interactables.push({ x: 2, y: 2, type: INTERACT_TYPE.BED });
    // Chest
    map.interactables.push({ x: 9, y: 2, type: INTERACT_TYPE.CHEST, data: { opened: false } });
    // Crafting bench
    map.interactables.push({ x: 9, y: 5, type: INTERACT_TYPE.CRAFTING_BENCH });

    return map;
}

// ---- DUNGEON GENERATION ----
function generateDungeon(floor) {
    const dw = Math.min(MAX_DUNGEON_SIZE, 30 + floor * 2);
    const dh = Math.min(MAX_DUNGEON_SIZE, 25 + floor * 2);
    const map = new WorldMap(dw, dh, MAP_TYPE.DUNGEON);
    map.explored = [];
    for (let y = 0; y < dh; y++) {
        map.explored[y] = new Array(dw).fill(false);
    }

    // Fill with walls
    for (let y = 0; y < dh; y++) {
        for (let x = 0; x < dw; x++) {
            map.tiles[y][x] = TILES.DUNGEON_WALL;
        }
    }

    // Generate rooms
    const roomCount = randInt(6, 10 + floor);
    const rooms = [];
    const rng = new SeededRandom(floor * 7919 + 1337);

    for (let i = 0; i < roomCount * 3 && rooms.length < roomCount; i++) {
        const rw = rng.nextInt(4, 8);
        const rh = rng.nextInt(4, 7);
        const rx = rng.nextInt(2, dw - rw - 2);
        const ry = rng.nextInt(2, dh - rh - 2);

        // Check overlap
        let overlap = false;
        for (const r of rooms) {
            if (rx < r.x + r.w + 1 && rx + rw + 1 > r.x && ry < r.y + r.h + 1 && ry + rh + 1 > r.y) {
                overlap = true;
                break;
            }
        }
        if (!overlap) {
            rooms.push({ x: rx, y: ry, w: rw, h: rh, cx: rx + Math.floor(rw / 2), cy: ry + Math.floor(rh / 2) });
        }
    }

    // Carve rooms
    for (const r of rooms) {
        for (let y = r.y; y < r.y + r.h; y++) {
            for (let x = r.x; x < r.x + r.w; x++) {
                map.tiles[y][x] = TILES.DUNGEON_FLOOR;
            }
        }
    }

    // Connect rooms with corridors
    for (let i = 1; i < rooms.length; i++) {
        const a = rooms[i - 1];
        const b = rooms[i];
        let cx = a.cx, cy = a.cy;
        // L-shaped corridor
        while (cx !== b.cx) {
            if (cx >= 0 && cx < dw && cy >= 0 && cy < dh) {
                map.tiles[cy][cx] = TILES.DUNGEON_FLOOR;
                if (cy + 1 < dh) map.tiles[cy + 1][cx] = TILES.DUNGEON_FLOOR;
            }
            cx += cx < b.cx ? 1 : -1;
        }
        while (cy !== b.cy) {
            if (cx >= 0 && cx < dw && cy >= 0 && cy < dh) {
                map.tiles[cy][cx] = TILES.DUNGEON_FLOOR;
                if (cx + 1 < dw) map.tiles[cy][cx + 1] = TILES.DUNGEON_FLOOR;
            }
            cy += cy < b.cy ? 1 : -1;
        }
    }

    map.rooms = rooms;

    // Stairs up in first room (always present for escape)
    if (rooms.length > 0) {
        const first = rooms[0];
        map.tiles[first.cy][first.cx] = TILES.STAIRS_UP;
        map.interactables.push({ x: first.cx, y: first.cy, type: INTERACT_TYPE.DUNGEON_EXIT });
    }

    // Stairs down in last room (or exit on floor 10)
    if (rooms.length > 1) {
        const last = rooms[rooms.length - 1];
        if (floor < 10) {
            map.tiles[last.cy][last.cx] = TILES.STAIRS_DOWN;
            map.interactables.push({ x: last.cx, y: last.cy, type: INTERACT_TYPE.STAIRS_DOWN });
        } else {
            // Floor 10 — boss only, exit after victory
            map.interactables.push({ x: last.cx, y: last.cy, type: INTERACT_TYPE.DUNGEON_EXIT });
        }
    }

    // Spawn enemies in rooms (skip first room)
    const floorScale = 1 + (floor - 1) * 0.15;
    for (let i = 1; i < rooms.length; i++) {
        const room = rooms[i];
        const isBossRoom = (floor % 5 === 0) && (i === rooms.length - 2 || (rooms.length <= 2 && i === rooms.length - 1));

        if (isBossRoom) {
            // Boss spawn
            map.enemies.push(createEnemy(ENEMY_TYPE.BOSS, room.cx, room.cy, floor, floorScale));
        } else {
            // Normal enemies
            const count = randInt(1, 2 + Math.floor(floor / 2));
            for (let e = 0; e < count; e++) {
                const ex = randInt(room.x + 1, room.x + room.w - 2);
                const ey = randInt(room.y + 1, room.y + room.h - 2);
                if (map.tiles[ey][ex] === TILES.DUNGEON_FLOOR && !map.getEnemy(ex, ey)) {
                    let type;
                    if (floor <= 2) type = ENEMY_TYPE.SLIME;
                    else if (floor <= 4) type = rng.next() < 0.6 ? ENEMY_TYPE.SLIME : ENEMY_TYPE.BAT;
                    else if (floor <= 7) type = rng.next() < 0.3 ? ENEMY_TYPE.SLIME : (rng.next() < 0.5 ? ENEMY_TYPE.BAT : ENEMY_TYPE.SKELETON);
                    else type = rng.next() < 0.3 ? ENEMY_TYPE.BAT : ENEMY_TYPE.SKELETON;

                    map.enemies.push(createEnemy(type, ex, ey, floor, floorScale));
                }
            }
        }

        // Chest in some rooms
        if (rng.next() < 0.35 && !isBossRoom) {
            const cx = randInt(room.x + 1, room.x + room.w - 2);
            const cy = randInt(room.y + 1, room.y + room.h - 2);
            if (map.tiles[cy][cx] === TILES.DUNGEON_FLOOR && !map.getEnemy(cx, cy)) {
                map.interactables.push({
                    x: cx, y: cy,
                    type: INTERACT_TYPE.CHEST,
                    data: { opened: false, floor }
                });
            }
        }
    }

    return map;
}

function createEnemy(type, x, y, floor, floorScale) {
    const base = ENEMY_STATS[type];
    return {
        type,
        x, y,
        px: x * TILE, py: y * TILE,
        hp: Math.floor(base.hp * floorScale),
        maxHp: Math.floor(base.hp * floorScale),
        attack: Math.floor(base.attack * floorScale),
        defense: Math.floor(base.defense * floorScale),
        xp: Math.floor(base.xp * floorScale),
        gold: Math.floor(base.gold * floorScale),
        floor,
        moveTimer: 0,
        attackCooldown: 0,
        hitFlash: 0,
        aggroRange: 6,
        idle: true,
        wanderTimer: randInt(30, 60)
    };
}

function generateChestLoot(floor) {
    const loot = [];
    const r = Math.random();
    if (r < 0.3) {
        loot.push({ id: ITEM.HEALTH_POTION, amount: randInt(1, 2) });
    } else if (r < 0.5) {
        loot.push({ id: ITEM.IRON_ORE, amount: randInt(1, 3) });
    } else if (r < 0.65) {
        loot.push({ id: ITEM.GOLD_ORE, amount: randInt(1, 2) });
    } else if (r < 0.8) {
        loot.push({ id: floor >= 5 ? ITEM.MANA_POTION : ITEM.HEALTH_POTION, amount: randInt(1, 2) });
    } else if (r < 0.9 && floor >= 3) {
        const gems = [ITEM.RUBY, ITEM.SAPPHIRE, ITEM.EMERALD];
        loot.push({ id: gems[randInt(0, 2)], amount: 1 });
    } else {
        loot.push({ id: ITEM.IRON_ORE, amount: randInt(2, 4) });
    }
    return loot;
}
