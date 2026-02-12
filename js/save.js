// ============================================================
// VERDANT HOLLOW — Save/Load System
// ============================================================

const SaveSystem = (() => {
    const SAVE_KEY = 'verdantHollow_save_v2';

    function save(player, overworldMap, weather) {
        try {
            const data = {
                version: 2,
                timestamp: Date.now(),
                player: {
                    x: player.x, y: player.y,
                    hp: player.hp, maxHp: player.maxHp,
                    mp: player.mp, maxMp: player.maxMp,
                    stamina: player.stamina, maxStamina: player.maxStamina,
                    attack: player.attack, defense: player.defense,
                    level: player.level, xp: player.xp, xpToNext: player.xpToNext,
                    gold: player.gold,
                    inventory: player.inventory,
                    weapon: player.weapon,
                    accessory: player.accessory,
                    hour: player.hour, minute: player.minute,
                    day: player.day, season: player.season,
                    dir: player.dir
                },
                crops: overworldMap.crops.map(c => ({
                    x: c.x, y: c.y,
                    type: c.type, stage: c.stage, maxStage: c.maxStage,
                    watered: c.watered, dayPlanted: c.dayPlanted, color: c.color
                })),
                farmTiles: getFarmTileState(overworldMap),
                removedObjects: getRemovedObjects(overworldMap),
                weather: weather
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            return false;
        }
    }

    function load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            console.error('Load failed:', e);
            return null;
        }
    }

    function hasSave() {
        return !!localStorage.getItem(SAVE_KEY);
    }

    function deleteSave() {
        localStorage.removeItem(SAVE_KEY);
    }

    function getFarmTileState(map) {
        const tiles = [];
        for (let y = FARM_Y; y < FARM_Y + FARM_H; y++) {
            for (let x = FARM_X; x < FARM_X + FARM_W; x++) {
                if (map.tiles[y][x] === TILES.FARM_DIRT) {
                    tiles.push({ x, y });
                }
            }
        }
        return tiles;
    }

    function getRemovedObjects(map) {
        // Track objects that were removed (trees chopped, rocks mined)
        const removed = [];
        // We only track objects near the farm/paths that were originally placed
        // This is a simplified approach
        return removed;
    }

    function applyLoad(data, player, overworldMap) {
        const p = data.player;
        player.x = p.x; player.y = p.y;
        player.px = p.x * TILE; player.py = p.y * TILE;
        player.hp = p.hp; player.maxHp = p.maxHp;
        player.mp = p.mp; player.maxMp = p.maxMp;
        player.stamina = p.stamina; player.maxStamina = p.maxStamina;
        player.attack = p.attack; player.defense = p.defense;
        player.level = p.level; player.xp = p.xp; player.xpToNext = p.xpToNext;
        player.gold = p.gold;
        player.inventory = p.inventory;
        player.weapon = p.weapon;
        player.accessory = p.accessory;
        player.hour = p.hour; player.minute = p.minute;
        player.day = p.day; player.season = p.season;
        player.dir = p.dir || DIR.DOWN;

        // Restore crops
        overworldMap.crops = data.crops || [];

        // Restore farm tiles
        if (data.farmTiles) {
            for (const t of data.farmTiles) {
                if (t.y < overworldMap.height && t.x < overworldMap.width) {
                    overworldMap.tiles[t.y][t.x] = TILES.FARM_DIRT;
                }
            }
        }

        // Restore weather
        if (data.weather) {
            Weather.current = data.weather;
        }
    }

    return { save, load, hasSave, deleteSave, applyLoad };
})();
