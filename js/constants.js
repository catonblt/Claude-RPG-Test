// ============================================================
// VERDANT HOLLOW — Constants & Configuration
// ============================================================

const CANVAS_W = 960;
const CANVAS_H = 640;
const TILE = 32;
const HALF_TILE = 16;
const TILES_X = Math.ceil(CANVAS_W / TILE) + 2;
const TILES_Y = Math.ceil(CANVAS_H / TILE) + 2;

// Map sizes
const OVERWORLD_W = 60;
const OVERWORLD_H = 50;
const HOUSE_W = 12;
const HOUSE_H = 10;
const MAX_DUNGEON_SIZE = 50;

// Player starting position (in front of house)
const SPAWN_X = 26;
const SPAWN_Y = 18;
const HOUSE_TILE_X = 25;
const HOUSE_TILE_Y = 13;

// Zone definitions
const FARM_X = 20, FARM_Y = 18, FARM_W = 12, FARM_H = 10;
const TOWN_X = 38, TOWN_Y = 14, TOWN_W = 12, TOWN_H = 12;
const DUNGEON_ENTRANCE_X = 10, DUNGEON_ENTRANCE_Y = 8;

// Tile types
const TILES = {
    GRASS: 0,
    DIRT: 1,
    WATER: 2,
    STONE: 3,
    SAND: 4,
    PATH: 5,
    FARM_DIRT: 6,
    BRIDGE: 7,
    WALL: 8,
    DUNGEON_FLOOR: 9,
    DUNGEON_WALL: 10,
    STAIRS_DOWN: 11,
    WOOD_FLOOR: 12,
    INTERIOR_WALL: 13,
    STAIRS_UP: 14
};

// Object types
const OBJECTS = {
    NONE: 0,
    TREE: 1,
    ROCK: 2,
    BUSH: 3,
    HOUSE: 4,
    FENCE: 5
};

// Game states
const STATE = {
    TITLE: 'title',
    PLAYING: 'playing',
    INVENTORY: 'inventory',
    SHOP: 'shop',
    CRAFTING: 'crafting',
    DIALOGUE: 'dialogue',
    FISHING: 'fishing',
    PAUSED: 'paused'
};

// Map types
const MAP_TYPE = {
    OVERWORLD: 'overworld',
    HOUSE: 'house',
    DUNGEON: 'dungeon'
};

// Directions
const DIR = {
    DOWN: 0,
    LEFT: 1,
    UP: 2,
    RIGHT: 3
};

// Item types
const ITEM_TYPE = {
    SEED: 'seed',
    CROP: 'crop',
    FISH: 'fish',
    TOOL: 'tool',
    WEAPON: 'weapon',
    CONSUMABLE: 'consumable',
    MATERIAL: 'material',
    GEM: 'gem',
    ACCESSORY: 'accessory'
};

// Tool types
const TOOL_TYPE = {
    HOE: 'hoe',
    WATERING_CAN: 'wateringCan',
    PICKAXE: 'pickaxe',
    AXE: 'axe',
    FISHING_ROD: 'fishingRod'
};

// NPC types
const NPC_TYPE = {
    MERCHANT: 'merchant',
    BLACKSMITH: 'blacksmith',
    ELDER: 'elder',
    FARMER: 'farmer'
};

// Interactable types
const INTERACT_TYPE = {
    HOUSE_DOOR: 'house_door',
    HOUSE_EXIT: 'house_exit',
    BED: 'bed',
    CHEST: 'chest',
    CRAFTING_BENCH: 'crafting_bench',
    SHIPPING_BIN: 'shipping_bin',
    FISHING_SPOT: 'fishing_spot',
    DUNGEON_ENTRANCE: 'dungeon_entrance',
    DUNGEON_EXIT: 'dungeon_exit',
    STAIRS_DOWN: 'stairs_down'
};

// Enemy types
const ENEMY_TYPE = {
    SLIME: 'slime',
    BAT: 'bat',
    SKELETON: 'skeleton',
    BOSS: 'boss'
};

// Seasons
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
const DAYS_PER_SEASON = 28;

// Weather types
const WEATHER = {
    CLEAR: 'clear',
    CLOUDY: 'cloudy',
    RAIN: 'rain',
    STORM: 'storm'
};

// Colors
const COLORS = {
    // Tiles
    GRASS: '#5a9e4b',
    GRASS_DARK: '#4a8e3b',
    GRASS_LIGHT: '#6aae5b',
    DIRT: '#9b7d5a',
    FARM_DIRT: '#7a5a3a',
    WATER: '#4a8ebf',
    WATER_LIGHT: '#6aaedd',
    STONE: '#7a7a8a',
    SAND: '#d4b878',
    PATH: '#c4a870',
    PATH_DARK: '#a48850',
    DUNGEON_FLOOR: '#3a3545',
    DUNGEON_WALL: '#2a2535',
    WOOD_FLOOR: '#a08058',
    INTERIOR_WALL: '#c8b898',
    BRIDGE: '#8b6b42',

    // UI
    UI_BG: 'rgba(20, 18, 30, 0.85)',
    UI_BORDER: '#5a8a4a',
    UI_HIGHLIGHT: '#7ec88b',
    UI_TEXT: '#f0e8d8',
    UI_TEXT_DIM: '#a0a098',
    UI_GOLD: '#f0c75e',
    UI_RED: '#e86565',
    UI_BLUE: '#6aaedd',
    UI_PURPLE: '#b68edb',
    UI_GREEN: '#5ab85a',

    // Rarity
    COMMON: '#a0a0a8',
    UNCOMMON: '#5ab85a',
    RARE: '#4a90d0',
    EPIC: '#b060d0',
    LEGENDARY: '#f0a030',

    // Player
    PLAYER_TUNIC: '#3a8a9a',
    PLAYER_CAPE: '#2a6a7a',
    PLAYER_HAIR: '#7a5a3a',
    PLAYER_SKIN: '#e8c8a0',
    PLAYER_BOOTS: '#5a4030',
    PLAYER_BELT: '#6a5040',
    PLAYER_BUCKLE: '#d4a840',
    PLAYER_GLOVES: '#b8956a',

    // Enemies
    SLIME: '#5aba5a',
    SLIME_DARK: '#3a8a3a',
    BAT: '#8a5aaa',
    BAT_DARK: '#6a3a8a',
    SKELETON: '#d8d0c0',
    SKELETON_DARK: '#b8b0a0',
    BOSS_BODY: '#4a2868',
    BOSS_CORE: '#e83838',

    // NPCs
    MERCHANT_GREEN: '#4a9a5a',
    BLACKSMITH_RED: '#a85a3a',
    ELDER_BLUE: '#4a6aaa',
    FARMER_BROWN: '#8a7050'
};

// Timing
const MOVE_COOLDOWN = 6;
const ACTION_TIMER = 20;
const TIME_TICK_FRAMES = 180; // 5 min game time per ~3s real time at 60fps
const DEATH_TIMER = 90;

// Sprite cache
const spriteCache = {};
