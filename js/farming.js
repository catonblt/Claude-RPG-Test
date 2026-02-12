// ============================================================
// VERDANT HOLLOW — Farming System
// ============================================================

const Farming = (() => {

    function till(map, player, x, y) {
        if (map.type !== MAP_TYPE.OVERWORLD) return false;
        if (map.tiles[y][x] !== TILES.DIRT) return false;
        if (player.stamina < 3) return false;

        map.tiles[y][x] = TILES.FARM_DIRT;
        player.stamina -= 3;
        player.actionTimer = ACTION_TIMER;
        Audio.sfx.hoe();
        return true;
    }

    function plant(map, player, x, y, seedItem) {
        if (map.tiles[y][x] !== TILES.FARM_DIRT) return false;
        if (map.getCrop(x, y)) return false;

        const seedData = ITEM_DB[seedItem.id];
        if (!seedData || seedData.type !== ITEM_TYPE.SEED) return false;

        // Season check
        if (seedData.season !== player.seasonName) {
            return 'wrong_season';
        }

        const cropKey = seedData.crop;
        const cropData = CROP_DATA[cropKey];
        if (!cropData) return false;

        map.crops.push({
            x, y,
            type: cropKey,
            stage: 0,
            maxStage: cropData.stages,
            watered: false,
            dayPlanted: player.day + (player.season * DAYS_PER_SEASON),
            color: cropData.color
        });

        player.removeItem(seedItem.id, 1);
        player.actionTimer = ACTION_TIMER;
        Audio.sfx.plant();
        return true;
    }

    function water(map, player, x, y) {
        const crop = map.getCrop(x, y);
        if (!crop) return false;
        if (crop.watered) return false;
        if (player.stamina < 2) return false;

        crop.watered = true;
        player.stamina -= 2;
        player.actionTimer = ACTION_TIMER;
        Audio.sfx.water();
        return true;
    }

    function harvest(map, player, x, y) {
        const crop = map.getCrop(x, y);
        if (!crop) return false;
        if (crop.stage < crop.maxStage) return false;

        const cropData = CROP_DATA[crop.type];
        if (!cropData) return false;

        if (player.addItem(cropData.cropId, 1)) {
            // Remove crop
            const idx = map.crops.indexOf(crop);
            if (idx >= 0) map.crops.splice(idx, 1);
            // Reset tile to farm dirt
            map.tiles[y][x] = TILES.FARM_DIRT;
            player.gainXP(10);
            Audio.sfx.harvest();
            return cropData.cropId;
        }
        return false;
    }

    function dailyGrowth(map, weather) {
        for (const crop of map.crops) {
            if (crop.watered || weather === WEATHER.RAIN || weather === WEATHER.STORM) {
                if (crop.stage < crop.maxStage) {
                    crop.stage++;
                }
            }
            crop.watered = false;
        }
    }

    function sellCropsAndFish(player) {
        let total = 0;
        for (let i = 0; i < player.inventory.length; i++) {
            const slot = player.inventory[i];
            if (!slot) continue;
            const item = ITEM_DB[slot.id];
            if (item && (item.type === ITEM_TYPE.CROP || item.type === ITEM_TYPE.FISH)) {
                total += item.price * slot.amount;
                player.inventory[i] = null;
            }
        }
        if (total > 0) {
            player.gold += total;
            Audio.sfx.sell();
        }
        return total;
    }

    function chopTree(map, player, x, y) {
        if (map.objects[y][x] !== OBJECTS.TREE) return false;
        if (!player.hasItem(ITEM.AXE)) return false;
        if (player.stamina < 5) return false;

        map.objects[y][x] = OBJECTS.NONE;
        player.stamina -= 5;
        player.actionTimer = ACTION_TIMER;
        player.addItem(ITEM.WOOD, randInt(2, 4));
        if (Math.random() < 0.3) player.addItem(ITEM.FIBER, 1);
        Audio.sfx.hoe();
        return true;
    }

    function mineRock(map, player, x, y) {
        if (map.objects[y][x] !== OBJECTS.ROCK) return false;
        if (player.stamina < 5) return false;

        map.objects[y][x] = OBJECTS.NONE;
        player.stamina -= 5;
        player.actionTimer = ACTION_TIMER;
        player.addItem(ITEM.STONE, randInt(1, 3));
        if (Math.random() < 0.25) player.addItem(ITEM.IRON_ORE, 1);
        if (Math.random() < 0.08) player.addItem(ITEM.GOLD_ORE, 1);
        Audio.sfx.hoe();
        return true;
    }

    return { till, plant, water, harvest, dailyGrowth, sellCropsAndFish, chopTree, mineRock };
})();
