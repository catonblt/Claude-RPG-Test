// ============================================================
// VERDANT HOLLOW — Item Database, Crops, Fish, Shops
// ============================================================

// Item IDs (used as keys)
const ITEM = {
    // Seeds (100-106)
    TURNIP_SEED: 100, TOMATO_SEED: 101, CORN_SEED: 102, MELON_SEED: 103,
    PUMPKIN_SEED: 104, CARROT_SEED: 105, SNOWPEA_SEED: 106,
    // Crops (200-206)
    TURNIP: 200, TOMATO: 201, CORN: 202, MELON: 203,
    PUMPKIN: 204, CARROT: 205, SNOWPEA: 206,
    // Fish (300-309)
    BLUEGILL: 300, LARGEMOUTH_BASS: 301, CATFISH: 302, RAINBOW_TROUT: 303,
    SALMON: 304, NORTHERN_PIKE: 305, GOLDEN_KOI: 306, STURGEON: 307,
    GHOST_FISH: 308, DRAGON_FISH: 309,
    // Tools (400-404)
    HOE: 400, WATERING_CAN: 401, PICKAXE: 402, AXE: 403, FISHING_ROD: 404,
    // Weapons (500-503)
    WOOD_SWORD: 500, IRON_SWORD: 501, STEEL_SWORD: 502, ENCHANTED_BLADE: 503,
    // Consumables (600-604)
    HEALTH_POTION: 600, MANA_POTION: 601, ENERGY_TONIC: 602, ELIXIR: 603, COOKED_MEAL: 604,
    HEARTY_STEW: 605,
    // Materials (700-710)
    WOOD: 700, STONE: 701, IRON_ORE: 702, GOLD_ORE: 703, FIBER: 704,
    IRON_BAR: 705, GOLD_BAR: 706, SLIME_GEL: 707, BAT_WING: 708, BONE: 709, DARK_CRYSTAL: 710,
    // Gems (800-802)
    RUBY: 800, SAPPHIRE: 801, EMERALD: 802,
    // Accessories (900-903)
    IRON_RING: 900, GOLD_RING: 901, POWER_RING: 902, SHIELD_RING: 903
};

const ITEM_DB = {
    // === SEEDS ===
    [ITEM.TURNIP_SEED]: { id: ITEM.TURNIP_SEED, name: 'Turnip Seeds', type: ITEM_TYPE.SEED, iconType: 'seed', color: '#e8e8e0', price: 10, desc: 'Plant in Spring. Grows in 3 days.', crop: 'turnip', season: 'Spring' },
    [ITEM.TOMATO_SEED]: { id: ITEM.TOMATO_SEED, name: 'Tomato Seeds', type: ITEM_TYPE.SEED, iconType: 'seed', color: '#e86050', price: 15, desc: 'Plant in Spring. Grows in 4 days.', crop: 'tomato', season: 'Spring' },
    [ITEM.CORN_SEED]: { id: ITEM.CORN_SEED, name: 'Corn Seeds', type: ITEM_TYPE.SEED, iconType: 'seed', color: '#e8c840', price: 20, desc: 'Plant in Summer. Grows in 5 days.', crop: 'corn', season: 'Summer' },
    [ITEM.MELON_SEED]: { id: ITEM.MELON_SEED, name: 'Melon Seeds', type: ITEM_TYPE.SEED, iconType: 'seed', color: '#5aba5a', price: 35, desc: 'Plant in Summer. Grows in 6 days.', crop: 'melon', season: 'Summer' },
    [ITEM.PUMPKIN_SEED]: { id: ITEM.PUMPKIN_SEED, name: 'Pumpkin Seeds', type: ITEM_TYPE.SEED, iconType: 'seed', color: '#d88030', price: 25, desc: 'Plant in Autumn. Grows in 5 days.', crop: 'pumpkin', season: 'Autumn' },
    [ITEM.CARROT_SEED]: { id: ITEM.CARROT_SEED, name: 'Carrot Seeds', type: ITEM_TYPE.SEED, iconType: 'seed', color: '#e8a040', price: 12, desc: 'Plant in Autumn. Grows in 3 days.', crop: 'carrot', season: 'Autumn' },
    [ITEM.SNOWPEA_SEED]: { id: ITEM.SNOWPEA_SEED, name: 'Snow Pea Seeds', type: ITEM_TYPE.SEED, iconType: 'seed', color: '#a0d8a0', price: 20, desc: 'Plant in Winter. Grows in 4 days.', crop: 'snowpea', season: 'Winter' },

    // === CROPS ===
    [ITEM.TURNIP]: { id: ITEM.TURNIP, name: 'Turnip', type: ITEM_TYPE.CROP, iconType: 'crop', color: '#e8e8e0', price: 30, desc: 'A fresh turnip. Sell at the shipping bin.' },
    [ITEM.TOMATO]: { id: ITEM.TOMATO, name: 'Tomato', type: ITEM_TYPE.CROP, iconType: 'crop', color: '#e86050', price: 45, desc: 'A ripe tomato. Sell at the shipping bin.' },
    [ITEM.CORN]: { id: ITEM.CORN, name: 'Corn', type: ITEM_TYPE.CROP, iconType: 'crop', color: '#e8c840', price: 60, desc: 'Golden corn. Sell at the shipping bin.' },
    [ITEM.MELON]: { id: ITEM.MELON, name: 'Melon', type: ITEM_TYPE.CROP, iconType: 'crop', color: '#5aba5a', price: 100, desc: 'A juicy melon. Sell at the shipping bin.' },
    [ITEM.PUMPKIN]: { id: ITEM.PUMPKIN, name: 'Pumpkin', type: ITEM_TYPE.CROP, iconType: 'crop', color: '#d88030', price: 80, desc: 'A large pumpkin. Sell at the shipping bin.' },
    [ITEM.CARROT]: { id: ITEM.CARROT, name: 'Carrot', type: ITEM_TYPE.CROP, iconType: 'crop', color: '#e8a040', price: 35, desc: 'A crunchy carrot. Sell at the shipping bin.' },
    [ITEM.SNOWPEA]: { id: ITEM.SNOWPEA, name: 'Snow Pea', type: ITEM_TYPE.CROP, iconType: 'crop', color: '#a0d8a0', price: 55, desc: 'Crisp snow peas. Sell at the shipping bin.' },

    // === FISH ===
    [ITEM.BLUEGILL]: { id: ITEM.BLUEGILL, name: 'Bluegill', type: ITEM_TYPE.FISH, iconType: 'fish', color: '#6a8ac0', price: 15, desc: 'A common pond fish.', rarity: 'Common' },
    [ITEM.LARGEMOUTH_BASS]: { id: ITEM.LARGEMOUTH_BASS, name: 'Largemouth Bass', type: ITEM_TYPE.FISH, iconType: 'fish', color: '#5a8a4a', price: 25, desc: 'A decent-sized bass.', rarity: 'Common' },
    [ITEM.CATFISH]: { id: ITEM.CATFISH, name: 'Catfish', type: ITEM_TYPE.FISH, iconType: 'fish', color: '#8a7a5a', price: 30, desc: 'A whiskered bottom-feeder.', rarity: 'Common' },
    [ITEM.RAINBOW_TROUT]: { id: ITEM.RAINBOW_TROUT, name: 'Rainbow Trout', type: ITEM_TYPE.FISH, iconType: 'fish', color: '#e88a8a', price: 55, desc: 'A beautiful iridescent fish.', rarity: 'Uncommon' },
    [ITEM.SALMON]: { id: ITEM.SALMON, name: 'Salmon', type: ITEM_TYPE.FISH, iconType: 'fish', color: '#e8a088', price: 65, desc: 'A strong swimmer.', rarity: 'Uncommon' },
    [ITEM.NORTHERN_PIKE]: { id: ITEM.NORTHERN_PIKE, name: 'Northern Pike', type: ITEM_TYPE.FISH, iconType: 'fish', color: '#5aaa6a', price: 100, desc: 'A fierce freshwater predator.', rarity: 'Rare' },
    [ITEM.GOLDEN_KOI]: { id: ITEM.GOLDEN_KOI, name: 'Golden Koi', type: ITEM_TYPE.FISH, iconType: 'fish', color: '#f0c040', price: 150, desc: 'A shimmering golden fish.', rarity: 'Rare' },
    [ITEM.STURGEON]: { id: ITEM.STURGEON, name: 'Sturgeon', type: ITEM_TYPE.FISH, iconType: 'fish', color: '#6a6a7a', price: 250, desc: 'An ancient bottom-dweller.', rarity: 'Epic' },
    [ITEM.GHOST_FISH]: { id: ITEM.GHOST_FISH, name: 'Ghost Fish', type: ITEM_TYPE.FISH, iconType: 'fish', color: '#c0c0e8', price: 300, desc: 'A translucent, eerie fish.', rarity: 'Epic' },
    [ITEM.DRAGON_FISH]: { id: ITEM.DRAGON_FISH, name: 'Dragon Fish', type: ITEM_TYPE.FISH, iconType: 'fish', color: '#e84040', price: 500, desc: 'Legendary! Scales like fire.', rarity: 'Legendary' },

    // === TOOLS ===
    [ITEM.HOE]: { id: ITEM.HOE, name: 'Hoe', type: ITEM_TYPE.TOOL, iconType: 'hoe', color: '#8a8a9a', price: 0, desc: 'Tills soil for planting.', toolType: TOOL_TYPE.HOE },
    [ITEM.WATERING_CAN]: { id: ITEM.WATERING_CAN, name: 'Watering Can', type: ITEM_TYPE.TOOL, iconType: 'wateringCan', color: '#6aaedd', price: 0, desc: 'Waters your crops.', toolType: TOOL_TYPE.WATERING_CAN },
    [ITEM.PICKAXE]: { id: ITEM.PICKAXE, name: 'Pickaxe', type: ITEM_TYPE.TOOL, iconType: 'pickaxe', color: '#8a8a9a', price: 0, desc: 'Breaks rocks. May find ore.', toolType: TOOL_TYPE.PICKAXE },
    [ITEM.AXE]: { id: ITEM.AXE, name: 'Axe', type: ITEM_TYPE.TOOL, iconType: 'axe', color: '#8a8a9a', price: 50, desc: 'Chops trees for wood.', toolType: TOOL_TYPE.AXE },
    [ITEM.FISHING_ROD]: { id: ITEM.FISHING_ROD, name: 'Fishing Rod', type: ITEM_TYPE.TOOL, iconType: 'fishingRod', color: '#6a4a2a', price: 50, desc: 'Cast at fishing spots to catch fish.' , toolType: TOOL_TYPE.FISHING_ROD },

    // === WEAPONS ===
    [ITEM.WOOD_SWORD]: { id: ITEM.WOOD_SWORD, name: 'Wood Sword', type: ITEM_TYPE.WEAPON, iconType: 'sword', color: '#8a6a42', price: 25, desc: 'A basic wooden sword.', attack: 5 },
    [ITEM.IRON_SWORD]: { id: ITEM.IRON_SWORD, name: 'Iron Sword', type: ITEM_TYPE.WEAPON, iconType: 'sword', color: '#a0a0b0', price: 120, desc: 'A sturdy iron blade.', attack: 12 },
    [ITEM.STEEL_SWORD]: { id: ITEM.STEEL_SWORD, name: 'Steel Sword', type: ITEM_TYPE.WEAPON, iconType: 'sword', color: '#c0c0d0', price: 350, desc: 'A sharp steel sword.', attack: 22 },
    [ITEM.ENCHANTED_BLADE]: { id: ITEM.ENCHANTED_BLADE, name: 'Enchanted Blade', type: ITEM_TYPE.WEAPON, iconType: 'sword', color: '#8a6ae8', price: 800, desc: 'Glows with arcane power.', attack: 35 },

    // === CONSUMABLES ===
    [ITEM.HEALTH_POTION]: { id: ITEM.HEALTH_POTION, name: 'Health Potion', type: ITEM_TYPE.CONSUMABLE, iconType: 'potion', color: '#e86565', price: 30, desc: 'Restores 50 HP.', effect: 'heal', value: 50 },
    [ITEM.MANA_POTION]: { id: ITEM.MANA_POTION, name: 'Mana Potion', type: ITEM_TYPE.CONSUMABLE, iconType: 'potion', color: '#6a8ae8', price: 30, desc: 'Restores 30 MP.', effect: 'mana', value: 30 },
    [ITEM.ENERGY_TONIC]: { id: ITEM.ENERGY_TONIC, name: 'Energy Tonic', type: ITEM_TYPE.CONSUMABLE, iconType: 'potion', color: '#e8c040', price: 25, desc: 'Restores 40 Stamina.', effect: 'stamina', value: 40 },
    [ITEM.ELIXIR]: { id: ITEM.ELIXIR, name: 'Elixir', type: ITEM_TYPE.CONSUMABLE, iconType: 'potion', color: '#d060e8', price: 200, desc: 'Fully restores HP, MP, and Stamina.', effect: 'fullRestore', value: 0 },
    [ITEM.COOKED_MEAL]: { id: ITEM.COOKED_MEAL, name: 'Cooked Meal', type: ITEM_TYPE.CONSUMABLE, iconType: 'food', color: '#c89050', price: 20, desc: 'Restores 30 HP.', effect: 'heal', value: 30 },
    [ITEM.HEARTY_STEW]: { id: ITEM.HEARTY_STEW, name: 'Hearty Stew', type: ITEM_TYPE.CONSUMABLE, iconType: 'food', color: '#b87040', price: 50, desc: 'Restores 90 HP.', effect: 'heal', value: 90 },

    // === MATERIALS ===
    [ITEM.WOOD]: { id: ITEM.WOOD, name: 'Wood', type: ITEM_TYPE.MATERIAL, iconType: 'wood', color: '#8a6a42', price: 5, desc: 'Basic building material.' },
    [ITEM.STONE]: { id: ITEM.STONE, name: 'Stone', type: ITEM_TYPE.MATERIAL, iconType: 'material', color: '#8a8a8a', price: 5, desc: 'A chunk of stone.' },
    [ITEM.IRON_ORE]: { id: ITEM.IRON_ORE, name: 'Iron Ore', type: ITEM_TYPE.MATERIAL, iconType: 'ore', color: '#b0a090', price: 15, desc: 'Smelt into iron bars.' },
    [ITEM.GOLD_ORE]: { id: ITEM.GOLD_ORE, name: 'Gold Ore', type: ITEM_TYPE.MATERIAL, iconType: 'ore', color: '#e8c040', price: 30, desc: 'Smelt into gold bars.' },
    [ITEM.FIBER]: { id: ITEM.FIBER, name: 'Fiber', type: ITEM_TYPE.MATERIAL, iconType: 'fiber', color: '#7aaa5a', price: 3, desc: 'Plant fiber. Used in crafting.' },
    [ITEM.IRON_BAR]: { id: ITEM.IRON_BAR, name: 'Iron Bar', type: ITEM_TYPE.MATERIAL, iconType: 'material', color: '#b0b0c0', price: 50, desc: 'A refined iron ingot.' },
    [ITEM.GOLD_BAR]: { id: ITEM.GOLD_BAR, name: 'Gold Bar', type: ITEM_TYPE.MATERIAL, iconType: 'material', color: '#f0c040', price: 100, desc: 'A gleaming gold ingot.' },
    [ITEM.SLIME_GEL]: { id: ITEM.SLIME_GEL, name: 'Slime Gel', type: ITEM_TYPE.MATERIAL, iconType: 'material', color: '#5aba5a', price: 10, desc: 'Gooey slime residue.' },
    [ITEM.BAT_WING]: { id: ITEM.BAT_WING, name: 'Bat Wing', type: ITEM_TYPE.MATERIAL, iconType: 'material', color: '#8a5aaa', price: 12, desc: 'A leathery bat wing.' },
    [ITEM.BONE]: { id: ITEM.BONE, name: 'Bone', type: ITEM_TYPE.MATERIAL, iconType: 'material', color: '#d8d0c0', price: 15, desc: 'Skeleton remains.' },
    [ITEM.DARK_CRYSTAL]: { id: ITEM.DARK_CRYSTAL, name: 'Dark Crystal', type: ITEM_TYPE.MATERIAL, iconType: 'gem', color: '#6a3a8a', price: 100, desc: 'Pulses with dark energy.' },

    // === GEMS ===
    [ITEM.RUBY]: { id: ITEM.RUBY, name: 'Ruby', type: ITEM_TYPE.GEM, iconType: 'gem', color: '#e83838', price: 150, desc: 'A brilliant red gem.' },
    [ITEM.SAPPHIRE]: { id: ITEM.SAPPHIRE, name: 'Sapphire', type: ITEM_TYPE.GEM, iconType: 'gem', color: '#3858e8', price: 150, desc: 'A deep blue gem.' },
    [ITEM.EMERALD]: { id: ITEM.EMERALD, name: 'Emerald', type: ITEM_TYPE.GEM, iconType: 'gem', color: '#38b838', price: 200, desc: 'A vivid green gem.' },

    // === ACCESSORIES ===
    [ITEM.IRON_RING]: { id: ITEM.IRON_RING, name: 'Iron Ring', type: ITEM_TYPE.ACCESSORY, iconType: 'ring', color: '#b0b0c0', price: 100, desc: 'DEF +3', defense: 3 },
    [ITEM.GOLD_RING]: { id: ITEM.GOLD_RING, name: 'Gold Ring', type: ITEM_TYPE.ACCESSORY, iconType: 'ring', color: '#f0c040', price: 300, desc: 'DEF +5, ATK +2', defense: 5, attack: 2 },
    [ITEM.POWER_RING]: { id: ITEM.POWER_RING, name: 'Power Ring', type: ITEM_TYPE.ACCESSORY, iconType: 'ring', color: '#e84040', price: 500, desc: 'ATK +8', attack: 8 },
    [ITEM.SHIELD_RING]: { id: ITEM.SHIELD_RING, name: 'Shield Ring', type: ITEM_TYPE.ACCESSORY, iconType: 'ring', color: '#4070e8', price: 500, desc: 'DEF +10', defense: 10 }
};

// Crop data
const CROP_DATA = {
    turnip:  { seedId: ITEM.TURNIP_SEED,  cropId: ITEM.TURNIP,  season: 'Spring', growDays: 3, stages: 4, color: '#e8e8e0' },
    tomato:  { seedId: ITEM.TOMATO_SEED,  cropId: ITEM.TOMATO,  season: 'Spring', growDays: 4, stages: 4, color: '#e86050' },
    corn:    { seedId: ITEM.CORN_SEED,    cropId: ITEM.CORN,    season: 'Summer', growDays: 5, stages: 5, color: '#e8c840' },
    melon:   { seedId: ITEM.MELON_SEED,   cropId: ITEM.MELON,   season: 'Summer', growDays: 6, stages: 5, color: '#5aba5a' },
    pumpkin: { seedId: ITEM.PUMPKIN_SEED, cropId: ITEM.PUMPKIN, season: 'Autumn', growDays: 5, stages: 5, color: '#d88030' },
    carrot:  { seedId: ITEM.CARROT_SEED,  cropId: ITEM.CARROT,  season: 'Autumn', growDays: 3, stages: 4, color: '#e8a040' },
    snowpea: { seedId: ITEM.SNOWPEA_SEED, cropId: ITEM.SNOWPEA, season: 'Winter', growDays: 4, stages: 4, color: '#a0d8a0' }
};

// Fish data (for fishing system)
const FISH_DATA = [
    { id: ITEM.BLUEGILL,        difficulty: 1, speed: 1.0, rarity: 'Common',    weight: 40 },
    { id: ITEM.LARGEMOUTH_BASS, difficulty: 2, speed: 1.3, rarity: 'Common',    weight: 30 },
    { id: ITEM.CATFISH,         difficulty: 2, speed: 1.1, rarity: 'Common',    weight: 20 },
    { id: ITEM.RAINBOW_TROUT,   difficulty: 3, speed: 1.6, rarity: 'Uncommon',  weight: 12 },
    { id: ITEM.SALMON,          difficulty: 3, speed: 1.5, rarity: 'Uncommon',  weight: 10 },
    { id: ITEM.NORTHERN_PIKE,   difficulty: 4, speed: 1.8, rarity: 'Rare',      weight: 5 },
    { id: ITEM.GOLDEN_KOI,      difficulty: 4, speed: 2.0, rarity: 'Rare',      weight: 4 },
    { id: ITEM.STURGEON,        difficulty: 5, speed: 2.2, rarity: 'Epic',      weight: 2 },
    { id: ITEM.GHOST_FISH,      difficulty: 5, speed: 2.5, rarity: 'Epic',      weight: 1.5 },
    { id: ITEM.DRAGON_FISH,     difficulty: 6, speed: 3.0, rarity: 'Legendary', weight: 0.5 }
];

// Shop inventories
const SHOP_INVENTORY = {
    general: [
        ITEM.TURNIP_SEED, ITEM.TOMATO_SEED, ITEM.CORN_SEED, ITEM.MELON_SEED,
        ITEM.PUMPKIN_SEED, ITEM.CARROT_SEED, ITEM.SNOWPEA_SEED,
        ITEM.HEALTH_POTION, ITEM.MANA_POTION, ITEM.ENERGY_TONIC,
        ITEM.FISHING_ROD
    ],
    blacksmith: [
        ITEM.WOOD_SWORD, ITEM.IRON_SWORD, ITEM.STEEL_SWORD,
        ITEM.IRON_RING, ITEM.GOLD_RING, ITEM.AXE
    ]
};

// Enemy drop tables
const ENEMY_DROPS = {
    [ENEMY_TYPE.SLIME]: [
        { id: ITEM.SLIME_GEL, chance: 0.7 },
        { id: ITEM.FIBER, chance: 0.3 }
    ],
    [ENEMY_TYPE.BAT]: [
        { id: ITEM.BAT_WING, chance: 0.7 },
        { id: ITEM.FIBER, chance: 0.2 }
    ],
    [ENEMY_TYPE.SKELETON]: [
        { id: ITEM.BONE, chance: 0.7 },
        { id: ITEM.IRON_ORE, chance: 0.3 }
    ],
    [ENEMY_TYPE.BOSS]: [
        { id: ITEM.DARK_CRYSTAL, chance: 1.0 },
        { id: ITEM.RUBY, chance: 0.5 },
        { id: ITEM.SAPPHIRE, chance: 0.5 },
        { id: ITEM.EMERALD, chance: 0.3 },
        { id: ITEM.GOLD_ORE, chance: 0.8 }
    ]
};

// Enemy base stats
const ENEMY_STATS = {
    [ENEMY_TYPE.SLIME]:    { hp: 20, attack: 5, defense: 2, xp: 15, gold: 5, floorMin: 1, floorMax: 7 },
    [ENEMY_TYPE.BAT]:      { hp: 15, attack: 8, defense: 1, xp: 20, gold: 8, floorMin: 3, floorMax: 10 },
    [ENEMY_TYPE.SKELETON]: { hp: 35, attack: 12, defense: 5, xp: 35, gold: 15, floorMin: 5, floorMax: 10 },
    [ENEMY_TYPE.BOSS]:     { hp: 100, attack: 18, defense: 8, xp: 150, gold: 100, floorMin: 5, floorMax: 10 }
};
