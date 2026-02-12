// ============================================================
// VERDANT HOLLOW — Sprite Rendering (All Procedural Pixel Art)
// ============================================================

const Sprites = (() => {

    // ---- TILE SPRITES ----
    function drawGrassTile(ctx, w, h, variant) {
        ctx.fillStyle = COLORS.GRASS;
        ctx.fillRect(0, 0, w, h);
        // Blade details
        const rng = new SeededRandom(variant * 137 + 42);
        for (let i = 0; i < 6; i++) {
            ctx.fillStyle = rng.next() > 0.5 ? COLORS.GRASS_DARK : COLORS.GRASS_LIGHT;
            const bx = rng.nextInt(2, w - 4);
            const by = rng.nextInt(2, h - 4);
            ctx.fillRect(bx, by, 2, 2);
        }
        // Occasional flower
        if (variant === 2) {
            ctx.fillStyle = '#e8e85a';
            ctx.fillRect(14, 14, 3, 3);
            ctx.fillStyle = '#ea6a4a';
            ctx.fillRect(15, 13, 1, 1);
        }
        if (variant === 3) {
            ctx.fillStyle = '#d87ae0';
            ctx.fillRect(8, 22, 3, 3);
            ctx.fillStyle = '#f0f060';
            ctx.fillRect(9, 23, 1, 1);
        }
    }

    function drawDirtTile(ctx, w, h, variant) {
        ctx.fillStyle = COLORS.DIRT;
        ctx.fillRect(0, 0, w, h);
        const rng = new SeededRandom(variant * 97 + 11);
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = shadeColor(COLORS.DIRT, rng.nextInt(-15, 10));
            ctx.fillRect(rng.nextInt(1, w - 3), rng.nextInt(1, h - 3), 2, 2);
        }
    }

    function drawFarmDirtTile(ctx, w, h, variant) {
        ctx.fillStyle = COLORS.FARM_DIRT;
        ctx.fillRect(0, 0, w, h);
        // Furrow lines
        ctx.fillStyle = shadeColor(COLORS.FARM_DIRT, -12);
        for (let y = 6; y < h; y += 8) {
            ctx.fillRect(0, y, w, 1);
        }
        ctx.fillStyle = shadeColor(COLORS.FARM_DIRT, 10);
        for (let y = 10; y < h; y += 8) {
            ctx.fillRect(0, y, w, 1);
        }
    }

    function drawWaterTile(ctx, w, h, variant, frame) {
        frame = frame || 0;
        ctx.fillStyle = COLORS.WATER;
        ctx.fillRect(0, 0, w, h);
        // Animated highlights
        ctx.fillStyle = COLORS.WATER_LIGHT;
        const off = (frame >> 3) % 4;
        for (let i = 0; i < 3; i++) {
            const wx = ((i * 11 + off * 8 + variant * 5) % (w + 4)) - 2;
            const wy = ((i * 7 + variant * 3) % h);
            ctx.fillRect(wx, wy, 6, 1);
            ctx.fillRect(wx + 2, wy + 1, 4, 1);
        }
    }

    function drawStoneTile(ctx, w, h, variant) {
        ctx.fillStyle = COLORS.STONE;
        ctx.fillRect(0, 0, w, h);
        const rng = new SeededRandom(variant * 53 + 7);
        ctx.fillStyle = shadeColor(COLORS.STONE, -10);
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(rng.nextInt(2, w - 6), rng.nextInt(2, h - 2), rng.nextInt(3, 8), 1);
        }
        ctx.fillStyle = shadeColor(COLORS.STONE, 15);
        ctx.fillRect(rng.nextInt(4, w - 6), rng.nextInt(4, h - 6), 2, 2);
    }

    function drawSandTile(ctx, w, h, variant) {
        ctx.fillStyle = COLORS.SAND;
        ctx.fillRect(0, 0, w, h);
        const rng = new SeededRandom(variant * 71 + 19);
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = shadeColor(COLORS.SAND, rng.nextInt(-8, 8));
            ctx.fillRect(rng.nextInt(0, w - 2), rng.nextInt(0, h - 2), 1, 1);
        }
    }

    function drawPathTile(ctx, w, h, variant) {
        ctx.fillStyle = COLORS.PATH;
        ctx.fillRect(0, 0, w, h);
        // Darker edges
        ctx.fillStyle = COLORS.PATH_DARK;
        ctx.fillRect(0, 0, w, 2);
        ctx.fillRect(0, 0, 2, h);
        ctx.fillRect(0, h - 2, w, 2);
        ctx.fillRect(w - 2, 0, 2, h);
        // Pebbles
        const rng = new SeededRandom(variant * 43 + 3);
        ctx.fillStyle = shadeColor(COLORS.PATH, -10);
        for (let i = 0; i < 2; i++) {
            ctx.fillRect(rng.nextInt(4, w - 6), rng.nextInt(4, h - 6), 2, 2);
        }
    }

    function drawBridgeTile(ctx, w, h) {
        ctx.fillStyle = COLORS.WATER;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = COLORS.BRIDGE;
        ctx.fillRect(2, 0, w - 4, h);
        ctx.fillStyle = shadeColor(COLORS.BRIDGE, -15);
        for (let y = 0; y < h; y += 8) {
            ctx.fillRect(2, y, w - 4, 1);
        }
        ctx.fillStyle = shadeColor(COLORS.BRIDGE, 10);
        for (let y = 4; y < h; y += 8) {
            ctx.fillRect(4, y, w - 8, 1);
        }
    }

    function drawDungeonFloorTile(ctx, w, h, variant) {
        ctx.fillStyle = COLORS.DUNGEON_FLOOR;
        ctx.fillRect(0, 0, w, h);
        const rng = new SeededRandom(variant * 67 + 23);
        // Moss dots
        if (variant === 1) {
            ctx.fillStyle = '#3a5535';
            ctx.fillRect(rng.nextInt(4, 24), rng.nextInt(4, 24), 2, 2);
        }
        // Crack
        ctx.fillStyle = shadeColor(COLORS.DUNGEON_FLOOR, -10);
        if (variant === 3) {
            ctx.fillRect(rng.nextInt(4, 20), rng.nextInt(4, 20), rng.nextInt(4, 10), 1);
        }
    }

    function drawDungeonWallTile(ctx, w, h, variant) {
        ctx.fillStyle = COLORS.DUNGEON_WALL;
        ctx.fillRect(0, 0, w, h);
        // Stone block pattern
        ctx.fillStyle = shadeColor(COLORS.DUNGEON_WALL, 8);
        ctx.fillRect(1, 1, 14, 14);
        ctx.fillRect(17, 1, 14, 14);
        ctx.fillRect(1, 17, 14, 14);
        ctx.fillRect(17, 17, 14, 14);
        // Mortar lines
        ctx.fillStyle = shadeColor(COLORS.DUNGEON_WALL, -8);
        ctx.fillRect(0, 15, w, 2);
        ctx.fillRect(15, 0, 2, h);
    }

    function drawStairsDownTile(ctx, w, h) {
        ctx.fillStyle = COLORS.DUNGEON_FLOOR;
        ctx.fillRect(0, 0, w, h);
        // Descending steps
        for (let i = 0; i < 5; i++) {
            const shade = 20 - i * 8;
            ctx.fillStyle = shadeColor(COLORS.DUNGEON_FLOOR, shade);
            ctx.fillRect(4 + i * 2, 4 + i * 5, w - 8 - i * 4, 5);
        }
        // Arrow down
        ctx.fillStyle = '#8a6aaa';
        ctx.fillRect(14, 12, 4, 10);
        ctx.fillRect(12, 20, 8, 2);
        ctx.fillRect(14, 22, 4, 2);
    }

    function drawStairsUpTile(ctx, w, h) {
        ctx.fillStyle = COLORS.DUNGEON_FLOOR;
        ctx.fillRect(0, 0, w, h);
        // Ascending steps
        for (let i = 0; i < 5; i++) {
            const shade = -20 + i * 10;
            ctx.fillStyle = shadeColor(COLORS.DUNGEON_FLOOR, shade);
            ctx.fillRect(4 + i * 2, 22 - i * 5, w - 8 - i * 4, 5);
        }
        // Green tint glow
        ctx.fillStyle = 'rgba(90, 200, 90, 0.15)';
        ctx.fillRect(0, 0, w, h);
        // Arrow up
        ctx.fillStyle = '#7ec88b';
        ctx.fillRect(14, 10, 4, 10);
        ctx.fillRect(12, 10, 8, 2);
        ctx.fillRect(14, 8, 4, 2);
    }

    function drawWoodFloorTile(ctx, w, h, variant) {
        ctx.fillStyle = COLORS.WOOD_FLOOR;
        ctx.fillRect(0, 0, w, h);
        // Plank lines
        ctx.fillStyle = shadeColor(COLORS.WOOD_FLOOR, -8);
        const off = (variant & 1) * 16;
        ctx.fillRect(off, 0, 1, h);
        ctx.fillRect(off + 16, 0, 1, h);
        // Grain
        ctx.fillStyle = shadeColor(COLORS.WOOD_FLOOR, 6);
        const rng = new SeededRandom(variant * 31 + 5);
        for (let i = 0; i < 2; i++) {
            ctx.fillRect(rng.nextInt(2, w - 4), rng.nextInt(2, h - 2), rng.nextInt(3, 8), 1);
        }
    }

    function drawInteriorWallTile(ctx, w, h, variant) {
        ctx.fillStyle = COLORS.INTERIOR_WALL;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = shadeColor(COLORS.INTERIOR_WALL, -6);
        ctx.fillRect(0, h - 2, w, 2);
        if (variant === 2) {
            ctx.fillStyle = shadeColor(COLORS.INTERIOR_WALL, -3);
            ctx.fillRect(8, 8, 16, 1);
        }
    }

    function getTileSprite(type, x, y, frame) {
        const variant = tileHash(x, y);
        // Water is animated, don't cache by frame
        if (type === TILES.WATER) {
            const fkey = (frame >> 3) % 4;
            const key = `tile_${type}_${variant}_${fkey}`;
            return createCachedSprite(key, TILE, TILE, (ctx, w, h) => drawWaterTile(ctx, w, h, variant, frame));
        }
        const key = `tile_${type}_${variant}`;
        return createCachedSprite(key, TILE, TILE, (ctx, w, h) => {
            switch (type) {
                case TILES.GRASS: drawGrassTile(ctx, w, h, variant); break;
                case TILES.DIRT: drawDirtTile(ctx, w, h, variant); break;
                case TILES.FARM_DIRT: drawFarmDirtTile(ctx, w, h, variant); break;
                case TILES.STONE: drawStoneTile(ctx, w, h, variant); break;
                case TILES.SAND: drawSandTile(ctx, w, h, variant); break;
                case TILES.PATH: drawPathTile(ctx, w, h, variant); break;
                case TILES.BRIDGE: drawBridgeTile(ctx, w, h); break;
                case TILES.DUNGEON_FLOOR: drawDungeonFloorTile(ctx, w, h, variant); break;
                case TILES.DUNGEON_WALL: drawDungeonWallTile(ctx, w, h, variant); break;
                case TILES.STAIRS_DOWN: drawStairsDownTile(ctx, w, h); break;
                case TILES.STAIRS_UP: drawStairsUpTile(ctx, w, h); break;
                case TILES.WOOD_FLOOR: drawWoodFloorTile(ctx, w, h, variant); break;
                case TILES.INTERIOR_WALL: drawInteriorWallTile(ctx, w, h, variant); break;
                case TILES.WALL: drawStoneTile(ctx, w, h, variant); break;
                default: ctx.fillStyle = '#ff00ff'; ctx.fillRect(0, 0, w, h);
            }
        });
    }

    // ---- OBJECT SPRITES ----
    function drawTreeSprite(ctx, w, h, variant) {
        // Trunk
        ctx.fillStyle = '#6a4a2a';
        ctx.fillRect(26, 34, 12, 28);
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(26, 34, 3, 28);
        ctx.fillStyle = '#7a5a3a';
        ctx.fillRect(35, 36, 2, 24);

        // Canopy layers (3 overlapping circles)
        const greens = ['#3a7a2a', '#4a9a3a', '#5aaa4a', '#3a8a30'];
        const cx = 32, cy = 24;
        // Back shadow
        ctx.fillStyle = '#2a5a1a';
        fillCircle(ctx, cx + 2, cy + 2, 18);
        // Main canopy
        ctx.fillStyle = greens[0];
        fillCircle(ctx, cx - 6, cy + 4, 14);
        ctx.fillStyle = greens[1];
        fillCircle(ctx, cx + 8, cy + 2, 13);
        ctx.fillStyle = greens[2];
        fillCircle(ctx, cx, cy - 4, 16);
        // Highlight
        ctx.fillStyle = greens[3];
        fillCircle(ctx, cx - 2, cy - 8, 10);
        ctx.fillStyle = '#6aba5a';
        fillCircle(ctx, cx - 4, cy - 10, 6);

        // Leaf detail dots
        const rng = new SeededRandom(variant * 77 + 33);
        for (let i = 0; i < 8; i++) {
            ctx.fillStyle = rng.next() > 0.5 ? '#6aba5a' : '#3a7a2a';
            ctx.fillRect(cx + rng.nextInt(-14, 14), cy + rng.nextInt(-14, 8), 2, 2);
        }
    }

    function fillCircle(ctx, cx, cy, r) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
    }

    function getTreeSprite(variant) {
        const key = `tree_${variant % 3}`;
        return createCachedSprite(key, 64, 64, (ctx, w, h) => drawTreeSprite(ctx, w, h, variant));
    }

    function drawRockSprite(ctx, w, h, variant) {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(16, 28, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Main body
        ctx.fillStyle = '#7a7a8a';
        ctx.beginPath();
        ctx.moveTo(4, 26);
        ctx.quadraticCurveTo(2, 14, 10, 8);
        ctx.quadraticCurveTo(16, 4, 24, 8);
        ctx.quadraticCurveTo(30, 12, 28, 26);
        ctx.closePath();
        ctx.fill();
        // Highlight
        ctx.fillStyle = '#9a9aaa';
        ctx.beginPath();
        ctx.moveTo(8, 20);
        ctx.quadraticCurveTo(8, 12, 14, 10);
        ctx.quadraticCurveTo(18, 8, 20, 12);
        ctx.quadraticCurveTo(16, 18, 8, 20);
        ctx.fill();
        // Crack
        ctx.strokeStyle = '#5a5a6a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(16, 10);
        ctx.lineTo(18, 16);
        ctx.lineTo(14, 22);
        ctx.stroke();
    }

    function getRockSprite(variant) {
        const key = `rock_${variant % 2}`;
        return createCachedSprite(key, TILE, TILE, (ctx, w, h) => drawRockSprite(ctx, w, h, variant));
    }

    function drawBushSprite(ctx, w, h, variant) {
        ctx.fillStyle = '#3a7a3a';
        fillCircle(ctx, 16, 20, 10);
        ctx.fillStyle = '#4a9a4a';
        fillCircle(ctx, 14, 17, 8);
        ctx.fillStyle = '#5aaa5a';
        fillCircle(ctx, 18, 15, 7);
        // Berries
        if (variant % 2 === 0) {
            ctx.fillStyle = '#e85a5a';
            ctx.fillRect(10, 18, 3, 3);
            ctx.fillRect(20, 16, 3, 3);
            ctx.fillRect(14, 22, 3, 3);
        }
    }

    function getBushSprite(variant) {
        const key = `bush_${variant % 2}`;
        return createCachedSprite(key, TILE, TILE, (ctx, w, h) => drawBushSprite(ctx, w, h, variant));
    }

    function drawFenceSprite(ctx, w, h) {
        ctx.fillStyle = '#8a6a42';
        // Posts
        ctx.fillRect(2, 8, 4, 24);
        ctx.fillRect(26, 8, 4, 24);
        // Rails
        ctx.fillStyle = '#9a7a52';
        ctx.fillRect(0, 12, 32, 3);
        ctx.fillRect(0, 22, 32, 3);
        // Post tops
        ctx.fillStyle = '#aa8a62';
        ctx.fillRect(2, 6, 4, 3);
        ctx.fillRect(26, 6, 4, 3);
    }

    function getFenceSprite() {
        return createCachedSprite('fence', TILE, TILE, (ctx, w, h) => drawFenceSprite(ctx, w, h));
    }

    function drawHouseSprite(ctx, w, h) {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(6, 50, 84, 10);

        // Walls
        ctx.fillStyle = '#e8d8b8';
        ctx.fillRect(8, 24, 80, 38);
        // Wall shading
        ctx.fillStyle = '#d8c8a8';
        ctx.fillRect(8, 24, 4, 38);
        ctx.fillRect(84, 24, 4, 38);

        // Roof
        ctx.fillStyle = '#a85a3a';
        ctx.beginPath();
        ctx.moveTo(2, 28);
        ctx.lineTo(48, 2);
        ctx.lineTo(94, 28);
        ctx.closePath();
        ctx.fill();
        // Roof shading
        ctx.fillStyle = '#983a2a';
        ctx.beginPath();
        ctx.moveTo(2, 28);
        ctx.lineTo(48, 2);
        ctx.lineTo(48, 28);
        ctx.closePath();
        ctx.fill();
        // Roof highlight
        ctx.fillStyle = '#b86a4a';
        ctx.beginPath();
        ctx.moveTo(48, 5);
        ctx.lineTo(90, 26);
        ctx.lineTo(48, 26);
        ctx.closePath();
        ctx.fill();

        // Chimney
        ctx.fillStyle = '#7a6a5a';
        ctx.fillRect(70, 6, 10, 18);
        ctx.fillStyle = '#8a7a6a';
        ctx.fillRect(68, 4, 14, 4);

        // Door
        ctx.fillStyle = '#6a4a2a';
        ctx.fillRect(38, 38, 20, 24);
        ctx.fillStyle = '#7a5a3a';
        ctx.fillRect(40, 40, 16, 20);
        // Door knob
        ctx.fillStyle = '#d4a840';
        ctx.fillRect(52, 50, 3, 3);
        // Door frame
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(38, 36, 20, 3);

        // Windows
        ctx.fillStyle = '#8ac8e8';
        ctx.fillRect(14, 34, 14, 12);
        ctx.fillRect(68, 34, 14, 12);
        // Window frames
        ctx.strokeStyle = '#5a3a1a';
        ctx.lineWidth = 2;
        ctx.strokeRect(14, 34, 14, 12);
        ctx.strokeRect(68, 34, 14, 12);
        // Window cross
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(20, 34, 2, 12);
        ctx.fillRect(14, 39, 14, 2);
        ctx.fillRect(74, 34, 2, 12);
        ctx.fillRect(68, 39, 14, 2);
        // Window glow
        ctx.fillStyle = 'rgba(255, 230, 150, 0.3)';
        ctx.fillRect(15, 35, 6, 4);
        ctx.fillRect(69, 35, 6, 4);
    }

    function getHouseSprite() {
        return createCachedSprite('house', 96, 64, (ctx, w, h) => drawHouseSprite(ctx, w, h));
    }

    // ---- DUNGEON ENTRANCE ----
    function drawDungeonEntrance(ctx, w, h) {
        // Stone base
        ctx.fillStyle = '#5a5a6a';
        ctx.fillRect(4, 8, 56, 52);

        // Dark interior
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(12, 16, 40, 44);

        // Arch
        ctx.fillStyle = '#6a6a7a';
        ctx.beginPath();
        ctx.moveTo(8, 60);
        ctx.lineTo(8, 20);
        ctx.quadraticCurveTo(8, 4, 32, 4);
        ctx.quadraticCurveTo(56, 4, 56, 20);
        ctx.lineTo(56, 60);
        ctx.lineTo(48, 60);
        ctx.lineTo(48, 20);
        ctx.quadraticCurveTo(48, 12, 32, 12);
        ctx.quadraticCurveTo(16, 12, 16, 20);
        ctx.lineTo(16, 60);
        ctx.closePath();
        ctx.fill();

        // Purple rune glow
        const runes = [[14, 28], [48, 28], [14, 42], [48, 42], [31, 8]];
        for (const [rx, ry] of runes) {
            ctx.fillStyle = 'rgba(160, 80, 220, 0.8)';
            ctx.fillRect(rx, ry, 3, 3);
            ctx.fillStyle = 'rgba(180, 100, 240, 0.3)';
            ctx.fillRect(rx - 1, ry - 1, 5, 5);
        }

        // Steps
        ctx.fillStyle = '#4a4a5a';
        ctx.fillRect(12, 52, 40, 4);
        ctx.fillStyle = '#3a3a4a';
        ctx.fillRect(10, 56, 44, 4);
    }

    function getDungeonEntranceSprite() {
        return createCachedSprite('dungeon_entrance', 64, 64, (ctx, w, h) => drawDungeonEntrance(ctx, w, h));
    }

    // ---- CRAFTING BENCH ----
    function drawCraftingBench(ctx, w, h) {
        // Legs
        ctx.fillStyle = '#6a4a2a';
        ctx.fillRect(4, 20, 4, 12);
        ctx.fillRect(24, 20, 4, 12);
        // Table top
        ctx.fillStyle = '#8a6a42';
        ctx.fillRect(2, 16, 28, 6);
        ctx.fillStyle = '#9a7a52';
        ctx.fillRect(2, 16, 28, 2);
        // Anvil / tools on top
        ctx.fillStyle = '#5a5a6a';
        ctx.fillRect(6, 10, 10, 6);
        ctx.fillStyle = '#7a7a8a';
        ctx.fillRect(4, 12, 14, 2);
        // Hammer
        ctx.fillStyle = '#7a5a3a';
        ctx.fillRect(20, 8, 2, 8);
        ctx.fillStyle = '#5a5a6a';
        ctx.fillRect(18, 6, 6, 4);
    }

    function getCraftingBenchSprite() {
        return createCachedSprite('crafting_bench', TILE, TILE, (ctx, w, h) => drawCraftingBench(ctx, w, h));
    }

    // ---- CHEST ----
    function drawChest(ctx, w, h, opened) {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(6, 26, 22, 4);
        // Body
        ctx.fillStyle = '#8a6a32';
        ctx.fillRect(4, 12, 24, 16);
        // Lid
        if (!opened) {
            ctx.fillStyle = '#9a7a42';
            ctx.fillRect(4, 10, 24, 6);
            ctx.fillStyle = '#aa8a52';
            ctx.fillRect(4, 10, 24, 2);
        } else {
            ctx.fillStyle = '#1a1a2a';
            ctx.fillRect(6, 14, 20, 12);
            ctx.fillStyle = '#9a7a42';
            ctx.fillRect(4, 4, 24, 8);
            ctx.fillStyle = '#aa8a52';
            ctx.fillRect(4, 4, 24, 2);
        }
        // Clasp
        ctx.fillStyle = '#d4a840';
        ctx.fillRect(14, 14, 4, 4);
        ctx.fillStyle = '#e8c060';
        ctx.fillRect(15, 15, 2, 2);
    }

    function getChestSprite(opened) {
        const key = opened ? 'chest_open' : 'chest_closed';
        return createCachedSprite(key, TILE, TILE, (ctx, w, h) => drawChest(ctx, w, h, opened));
    }

    // ---- SHIPPING BIN ----
    function drawShippingBin(ctx, w, h) {
        ctx.fillStyle = '#6a4a2a';
        ctx.fillRect(2, 10, 28, 20);
        ctx.fillStyle = '#7a5a3a';
        ctx.fillRect(2, 10, 28, 4);
        ctx.fillStyle = '#8a6a4a';
        ctx.fillRect(4, 8, 24, 4);
        // Metal bands
        ctx.fillStyle = '#5a5a6a';
        ctx.fillRect(2, 16, 28, 2);
        ctx.fillRect(2, 24, 28, 2);
        // Arrow on front
        ctx.fillStyle = '#d4a840';
        ctx.fillRect(14, 18, 4, 6);
        ctx.fillRect(12, 22, 8, 2);
    }

    function getShippingBinSprite() {
        return createCachedSprite('shipping_bin', TILE, TILE, (ctx, w, h) => drawShippingBin(ctx, w, h));
    }

    // ---- FISHING SPOT FLAG ----
    function drawFishingFlag(ctx, w, h, frame) {
        const bob = Math.sin((frame || 0) * 0.06) * 2;
        // Post
        ctx.fillStyle = '#6a4a2a';
        ctx.fillRect(14, 10 + bob, 4, 22);
        // Flag
        ctx.fillStyle = '#4a8ebf';
        ctx.fillRect(18, 10 + bob, 12, 8);
        ctx.fillStyle = '#3a7eaf';
        ctx.fillRect(18, 16 + bob, 12, 2);
        // Fish icon on flag
        ctx.fillStyle = '#e8e8f0';
        ctx.fillRect(21, 12 + bob, 6, 3);
        ctx.fillRect(20, 13 + bob, 2, 1);
        ctx.fillRect(27, 12 + bob, 2, 1);
    }

    // ---- BED ----
    function drawBed(ctx, w, h) {
        // Frame
        ctx.fillStyle = '#6a4a2a';
        ctx.fillRect(2, 4, 28, 24);
        // Mattress
        ctx.fillStyle = '#e8e0d0';
        ctx.fillRect(4, 6, 24, 18);
        // Pillow
        ctx.fillStyle = '#f0ece0';
        ctx.fillRect(6, 6, 10, 6);
        // Blanket
        ctx.fillStyle = '#4a7aaa';
        ctx.fillRect(4, 14, 24, 10);
        ctx.fillStyle = '#5a8aba';
        ctx.fillRect(4, 14, 24, 3);
    }

    function getBedSprite() {
        return createCachedSprite('bed', TILE, TILE, (ctx, w, h) => drawBed(ctx, w, h));
    }

    // ---- PLAYER SPRITE ----
    function drawPlayer(ctx, dir, frame, actionTimer, toolType, breathing) {
        const w = TILE, h = TILE;
        const walkFrame = frame % 4;
        const isWalking = frame > 0;
        const breath = breathing ? Math.sin(breathing * 0.05) * 0.5 : 0;

        // Determine leg offset for walking
        const legOff = isWalking ? Math.sin(walkFrame * Math.PI) * 3 : 0;
        const bounce = isWalking ? Math.abs(Math.sin(walkFrame * Math.PI * 0.5)) * 1.5 : 0;
        const by = -bounce + breath;

        // Cape (behind body)
        if (dir !== DIR.UP) {
            ctx.fillStyle = COLORS.PLAYER_CAPE;
            ctx.fillRect(10, 8 + by, 12, 14);
            ctx.fillStyle = shadeColor(COLORS.PLAYER_CAPE, -10);
            ctx.fillRect(10, 18 + by, 12, 4);
            // Cape sway
            if (isWalking) {
                ctx.fillRect(10 + Math.sin(walkFrame) * 2, 20 + by, 12, 2);
            }
        }

        // Boots
        ctx.fillStyle = COLORS.PLAYER_BOOTS;
        ctx.fillRect(10, 26 + by, 5, 5);
        ctx.fillRect(17, 26 + by, 5, 5);
        // Walking leg animation
        if (isWalking) {
            ctx.fillRect(10, 26 + by + legOff, 5, 5);
            ctx.fillRect(17, 26 + by - legOff, 5, 5);
        }
        // Heel detail
        ctx.fillStyle = shadeColor(COLORS.PLAYER_BOOTS, -15);
        ctx.fillRect(10, 30 + by, 5, 1);
        ctx.fillRect(17, 30 + by, 5, 1);

        // Body / tunic
        ctx.fillStyle = COLORS.PLAYER_TUNIC;
        ctx.fillRect(9, 12 + by, 14, 14);
        // Tunic shading
        ctx.fillStyle = shadeColor(COLORS.PLAYER_TUNIC, -10);
        ctx.fillRect(9, 12 + by, 3, 14);
        ctx.fillStyle = shadeColor(COLORS.PLAYER_TUNIC, 8);
        ctx.fillRect(20, 12 + by, 3, 14);

        // Belt
        ctx.fillStyle = COLORS.PLAYER_BELT;
        ctx.fillRect(9, 21 + by, 14, 3);
        // Buckle
        ctx.fillStyle = COLORS.PLAYER_BUCKLE;
        ctx.fillRect(14, 21 + by, 4, 3);

        // Arms / gloves
        ctx.fillStyle = COLORS.PLAYER_GLOVES;
        if (dir === DIR.LEFT) {
            ctx.fillRect(6, 16 + by, 4, 6);
        } else if (dir === DIR.RIGHT) {
            ctx.fillRect(22, 16 + by, 4, 6);
        } else {
            ctx.fillRect(6, 16 + by, 4, 6);
            ctx.fillRect(22, 16 + by, 4, 6);
        }

        // Head
        ctx.fillStyle = COLORS.PLAYER_SKIN;
        ctx.fillRect(10, 4 + by, 12, 10);

        // Hair
        ctx.fillStyle = COLORS.PLAYER_HAIR;
        ctx.fillRect(9, 2 + by, 14, 5);
        ctx.fillRect(8, 4 + by, 2, 4);
        ctx.fillRect(22, 4 + by, 2, 4);
        // Messy tufts
        ctx.fillRect(10, 1 + by, 3, 2);
        ctx.fillRect(18, 1 + by, 3, 2);
        ctx.fillRect(14, 0 + by, 4, 2);

        // Eyes (direction-aware)
        ctx.fillStyle = '#ffffff';
        let eyeOffX = 0, eyeOffY = 0;
        if (dir === DIR.LEFT) eyeOffX = -1;
        if (dir === DIR.RIGHT) eyeOffX = 1;
        if (dir === DIR.UP) eyeOffY = -1;

        if (dir !== DIR.UP) {
            ctx.fillRect(12 + eyeOffX, 7 + by + eyeOffY, 3, 3);
            ctx.fillRect(18 + eyeOffX, 7 + by + eyeOffY, 3, 3);
            // Pupils
            ctx.fillStyle = '#2a2a3a';
            ctx.fillRect(13 + eyeOffX, 8 + by + eyeOffY, 2, 2);
            ctx.fillRect(19 + eyeOffX, 8 + by + eyeOffY, 2, 2);
            // Eye highlights
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(13 + eyeOffX, 7 + by + eyeOffY, 1, 1);
            ctx.fillRect(19 + eyeOffX, 7 + by + eyeOffY, 1, 1);
        }

        // Tool animation
        if (actionTimer > 0 && toolType) {
            drawToolSwing(ctx, dir, actionTimer, toolType, by);
        }
    }

    function drawToolSwing(ctx, dir, timer, toolType, by) {
        const progress = 1 - (timer / ACTION_TIMER);
        const angle = progress * Math.PI * 0.7;

        let toolColor = '#8a8a9a';
        let handleColor = '#6a4a2a';

        if (toolType === 'sword' || toolType === TOOL_TYPE.AXE) {
            toolColor = '#c0c0d0';
        } else if (toolType === TOOL_TYPE.WATERING_CAN) {
            toolColor = '#6aaedd';
            handleColor = '#5a5a6a';
        } else if (toolType === TOOL_TYPE.FISHING_ROD) {
            toolColor = '#6a4a2a';
            handleColor = '#5a3a1a';
        }

        ctx.save();
        let tx = 16, ty = 16 + by;
        if (dir === DIR.RIGHT) tx = 26;
        if (dir === DIR.LEFT) tx = 6;
        if (dir === DIR.UP) ty = 6 + by;
        if (dir === DIR.DOWN) ty = 24 + by;

        ctx.translate(tx, ty);
        const rotDir = (dir === DIR.LEFT) ? -1 : 1;
        ctx.rotate((-0.5 + angle) * rotDir);

        // Handle
        ctx.fillStyle = handleColor;
        ctx.fillRect(-1, 0, 3, 14);
        // Head
        ctx.fillStyle = toolColor;
        ctx.fillRect(-3, 12, 7, 5);
        ctx.restore();
    }

    function getPlayerSprite(dir, walkFrame, actionTimer, toolType, breathFrame) {
        // Don't cache player sprite - it's animated every frame
        const c = document.createElement('canvas');
        c.width = TILE;
        c.height = TILE;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        drawPlayer(ctx, dir, walkFrame, actionTimer, toolType, breathFrame);
        return c;
    }

    // ---- ENEMY SPRITES ----
    function drawSlime(ctx, frame, variant) {
        const squash = Math.sin((frame || 0) * 0.15) * 2;
        const baseColor = variant ? shadeColor(COLORS.SLIME, variant * 10) : COLORS.SLIME;
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(16, 28 + squash, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Body
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.ellipse(16, 20 - squash, 10 + squash * 0.5, 10 - squash * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Lighter top
        ctx.fillStyle = shadeColor(baseColor, 20);
        ctx.beginPath();
        ctx.ellipse(14, 16 - squash, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(12, 14 - squash, 3, 3);
        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(11, 18 - squash, 4, 4);
        ctx.fillRect(18, 18 - squash, 4, 4);
        ctx.fillStyle = '#1a1a2a';
        ctx.fillRect(12, 19 - squash, 2, 2);
        ctx.fillRect(19, 19 - squash, 2, 2);
    }

    function drawBat(ctx, frame) {
        const flap = Math.sin((frame || 0) * 0.3) * 8;
        const bob = Math.sin((frame || 0) * 0.1) * 2;
        // Wings
        ctx.fillStyle = COLORS.BAT;
        // Left wing
        ctx.beginPath();
        ctx.moveTo(16, 16 + bob);
        ctx.lineTo(2, 10 + bob + flap);
        ctx.lineTo(4, 20 + bob + flap * 0.5);
        ctx.lineTo(10, 18 + bob);
        ctx.closePath();
        ctx.fill();
        // Right wing
        ctx.beginPath();
        ctx.moveTo(16, 16 + bob);
        ctx.lineTo(30, 10 + bob - flap);
        ctx.lineTo(28, 20 + bob - flap * 0.5);
        ctx.lineTo(22, 18 + bob);
        ctx.closePath();
        ctx.fill();
        // Body
        ctx.fillStyle = COLORS.BAT_DARK;
        ctx.beginPath();
        ctx.ellipse(16, 18 + bob, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#e83838';
        ctx.fillRect(13, 16 + bob, 2, 2);
        ctx.fillRect(18, 16 + bob, 2, 2);
        // Ears
        ctx.fillStyle = COLORS.BAT;
        ctx.beginPath();
        ctx.moveTo(12, 14 + bob);
        ctx.lineTo(10, 8 + bob);
        ctx.lineTo(14, 12 + bob);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(20, 14 + bob);
        ctx.lineTo(22, 8 + bob);
        ctx.lineTo(18, 12 + bob);
        ctx.fill();
    }

    function drawSkeleton(ctx, frame) {
        const sway = Math.sin((frame || 0) * 0.08) * 1;
        // Legs
        ctx.fillStyle = COLORS.SKELETON;
        ctx.fillRect(11 + sway, 24, 3, 8);
        ctx.fillRect(18 + sway, 24, 3, 8);
        // Ribcage
        ctx.fillStyle = COLORS.SKELETON;
        ctx.fillRect(10 + sway, 12, 12, 12);
        ctx.fillStyle = COLORS.SKELETON_DARK;
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(11 + sway, 14 + i * 3, 10, 1);
        }
        // Arms
        ctx.fillStyle = COLORS.SKELETON;
        ctx.fillRect(6 + sway, 14, 4, 2);
        ctx.fillRect(22 + sway, 14, 4, 2);
        ctx.fillRect(4 + sway, 14, 3, 8);
        ctx.fillRect(24 + sway, 14, 3, 8);
        // Skull
        ctx.fillStyle = COLORS.SKELETON;
        ctx.fillRect(10 + sway, 2, 12, 12);
        ctx.fillStyle = '#000000';
        ctx.fillRect(12 + sway, 6, 3, 3);
        ctx.fillRect(18 + sway, 6, 3, 3);
        // Red eyes
        ctx.fillStyle = '#e83838';
        ctx.fillRect(13 + sway, 7, 1, 1);
        ctx.fillRect(19 + sway, 7, 1, 1);
        // Jaw
        ctx.fillStyle = COLORS.SKELETON_DARK;
        ctx.fillRect(12 + sway, 10, 8, 2);
        ctx.fillRect(13 + sway, 11, 2, 1);
        ctx.fillRect(17 + sway, 11, 2, 1);
    }

    function drawBoss(ctx, frame) {
        const pulse = Math.sin((frame || 0) * 0.08) * 2;
        const orbAngle = ((frame || 0) * 0.03) % (Math.PI * 2);
        const scale = 1.5;

        ctx.save();
        ctx.translate(24, 24);

        // Aura
        ctx.fillStyle = 'rgba(100, 30, 160, 0.15)';
        fillCircle(ctx, 0, 0, 20 + pulse);

        // Body
        ctx.fillStyle = COLORS.BOSS_BODY;
        ctx.beginPath();
        ctx.moveTo(-12, 16);
        ctx.quadraticCurveTo(-14, 0, -8, -12);
        ctx.quadraticCurveTo(0, -18, 8, -12);
        ctx.quadraticCurveTo(14, 0, 12, 16);
        ctx.closePath();
        ctx.fill();

        // Inner glow
        ctx.fillStyle = 'rgba(160, 50, 220, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 2, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = COLORS.BOSS_CORE;
        fillCircle(ctx, 0, 0, 4 + pulse * 0.5);
        ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
        fillCircle(ctx, 0, 0, 6 + pulse);

        // Eyes
        ctx.fillStyle = '#e83838';
        ctx.fillRect(-6, -6, 3, 3);
        ctx.fillRect(3, -6, 3, 3);
        ctx.fillStyle = '#ff6060';
        ctx.fillRect(-5, -5, 1, 1);
        ctx.fillRect(4, -5, 1, 1);

        // Orbiting crystals
        for (let i = 0; i < 3; i++) {
            const a = orbAngle + (i * Math.PI * 2 / 3);
            const ox = Math.cos(a) * 14;
            const oy = Math.sin(a) * 10;
            ctx.fillStyle = ['#aa4ae8', '#4a8ae8', '#e84a8a'][i];
            ctx.fillRect(ox - 2, oy - 3, 4, 6);
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fillRect(ox - 1, oy - 2, 2, 2);
        }

        ctx.restore();
    }

    function getEnemySprite(type, frame, variant) {
        // Enemies are animated, generate fresh each frame
        const size = type === ENEMY_TYPE.BOSS ? 48 : TILE;
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        switch (type) {
            case ENEMY_TYPE.SLIME: drawSlime(ctx, frame, variant); break;
            case ENEMY_TYPE.BAT: drawBat(ctx, frame); break;
            case ENEMY_TYPE.SKELETON: drawSkeleton(ctx, frame); break;
            case ENEMY_TYPE.BOSS: drawBoss(ctx, frame); break;
        }
        return c;
    }

    // ---- NPC SPRITES ----
    function drawMerchantNPC(ctx) {
        // Body
        ctx.fillStyle = COLORS.MERCHANT_GREEN;
        ctx.fillRect(9, 14, 14, 14);
        // Apron
        ctx.fillStyle = '#5aaa6a';
        ctx.fillRect(10, 18, 12, 10);
        // Head
        ctx.fillStyle = '#e8c8a0';
        ctx.fillRect(10, 4, 12, 10);
        // Hat
        ctx.fillStyle = COLORS.MERCHANT_GREEN;
        ctx.fillRect(8, 2, 16, 5);
        ctx.fillRect(10, 0, 12, 3);
        // Eyes
        ctx.fillStyle = '#2a2a3a';
        ctx.fillRect(12, 8, 2, 2);
        ctx.fillRect(18, 8, 2, 2);
        // Smile
        ctx.fillStyle = '#c0a080';
        ctx.fillRect(13, 11, 6, 1);
        ctx.fillRect(12, 10, 1, 1);
        ctx.fillRect(19, 10, 1, 1);
        // Legs
        ctx.fillStyle = '#6a5040';
        ctx.fillRect(11, 28, 4, 4);
        ctx.fillRect(17, 28, 4, 4);
    }

    function drawBlacksmithNPC(ctx) {
        // Body (muscular)
        ctx.fillStyle = '#4a4a5a';
        ctx.fillRect(8, 12, 16, 16);
        // Apron
        ctx.fillStyle = COLORS.BLACKSMITH_RED;
        ctx.fillRect(10, 16, 12, 12);
        // Arms
        ctx.fillStyle = '#e0b890';
        ctx.fillRect(5, 14, 4, 8);
        ctx.fillRect(23, 14, 4, 8);
        // Head
        ctx.fillStyle = '#d8b888';
        ctx.fillRect(10, 2, 12, 11);
        // Beard
        ctx.fillStyle = '#5a4030';
        ctx.fillRect(11, 9, 10, 4);
        // Eyes
        ctx.fillStyle = '#2a2a3a';
        ctx.fillRect(12, 6, 2, 2);
        ctx.fillRect(18, 6, 2, 2);
        // Frown
        ctx.fillStyle = '#c0a080';
        ctx.fillRect(13, 8, 6, 1);
        // Hammer in hand
        ctx.fillStyle = '#6a4a2a';
        ctx.fillRect(24, 16, 2, 10);
        ctx.fillStyle = '#7a7a8a';
        ctx.fillRect(22, 24, 6, 4);
        // Legs
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(10, 28, 5, 4);
        ctx.fillRect(17, 28, 5, 4);
    }

    function drawElderNPC(ctx) {
        // Robe
        ctx.fillStyle = COLORS.ELDER_BLUE;
        ctx.fillRect(9, 10, 14, 18);
        ctx.fillStyle = shadeColor(COLORS.ELDER_BLUE, 10);
        ctx.fillRect(9, 10, 14, 4);
        // Head
        ctx.fillStyle = '#e8d0b0';
        ctx.fillRect(10, 2, 12, 10);
        // White beard
        ctx.fillStyle = '#e8e8e8';
        ctx.fillRect(11, 8, 10, 6);
        ctx.fillRect(13, 14, 6, 3);
        // Eyes
        ctx.fillStyle = '#2a2a3a';
        ctx.fillRect(12, 5, 2, 2);
        ctx.fillRect(18, 5, 2, 2);
        // White hair
        ctx.fillStyle = '#e8e8e8';
        ctx.fillRect(9, 1, 14, 4);
        // Staff
        ctx.fillStyle = '#7a5a3a';
        ctx.fillRect(5, 4, 3, 28);
        ctx.fillStyle = '#5ab85a';
        ctx.fillRect(4, 2, 5, 4);
        // Legs/feet
        ctx.fillStyle = COLORS.ELDER_BLUE;
        ctx.fillRect(11, 28, 4, 3);
        ctx.fillRect(17, 28, 4, 3);
    }

    function drawFarmerNPC(ctx) {
        // Overalls
        ctx.fillStyle = '#5a7aaa';
        ctx.fillRect(9, 14, 14, 14);
        // Shirt
        ctx.fillStyle = '#c85a4a';
        ctx.fillRect(9, 10, 14, 6);
        // Straps
        ctx.fillStyle = '#5a7aaa';
        ctx.fillRect(11, 10, 3, 4);
        ctx.fillRect(18, 10, 3, 4);
        // Head
        ctx.fillStyle = '#d8a878';
        ctx.fillRect(10, 2, 12, 10);
        // Straw hat
        ctx.fillStyle = '#d4b878';
        ctx.fillRect(7, 0, 18, 4);
        ctx.fillRect(10, -1, 12, 3);
        // Eyes
        ctx.fillStyle = '#2a2a3a';
        ctx.fillRect(12, 6, 2, 2);
        ctx.fillRect(18, 6, 2, 2);
        // Ruddy cheeks
        ctx.fillStyle = 'rgba(220, 120, 100, 0.4)';
        ctx.fillRect(11, 8, 3, 2);
        ctx.fillRect(18, 8, 3, 2);
        // Legs
        ctx.fillStyle = '#5a7aaa';
        ctx.fillRect(11, 28, 4, 4);
        ctx.fillRect(17, 28, 4, 4);
        // Boots
        ctx.fillStyle = '#5a4030';
        ctx.fillRect(10, 30, 5, 2);
        ctx.fillRect(17, 30, 5, 2);
    }

    function getNPCSprite(type) {
        const key = `npc_${type}`;
        return createCachedSprite(key, TILE, TILE, (ctx) => {
            switch (type) {
                case NPC_TYPE.MERCHANT: drawMerchantNPC(ctx); break;
                case NPC_TYPE.BLACKSMITH: drawBlacksmithNPC(ctx); break;
                case NPC_TYPE.ELDER: drawElderNPC(ctx); break;
                case NPC_TYPE.FARMER: drawFarmerNPC(ctx); break;
            }
        });
    }

    // ---- ITEM ICONS ----
    function drawItemIcon(ctx, item, size) {
        const s = size || TILE;
        const color = item.color || '#aaaaaa';
        const hs = s / 2;

        switch (item.iconType || item.type) {
            case 'seed':
                ctx.fillStyle = '#8a6a42';
                ctx.fillRect(s * 0.3, s * 0.6, s * 0.4, s * 0.15);
                ctx.fillStyle = color;
                ctx.fillRect(s * 0.35, s * 0.35, s * 0.12, s * 0.25);
                ctx.fillRect(s * 0.52, s * 0.4, s * 0.12, s * 0.2);
                break;
            case 'crop':
                ctx.fillStyle = '#5a8a3a';
                ctx.fillRect(s * 0.45, s * 0.2, s * 0.1, s * 0.35);
                ctx.fillStyle = color;
                fillCircle(ctx, hs, s * 0.65, s * 0.2);
                ctx.fillStyle = shadeColor(color, 20);
                fillCircle(ctx, hs - 1, s * 0.6, s * 0.1);
                break;
            case 'fish':
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.ellipse(hs, hs, s * 0.3, s * 0.15, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = shadeColor(color, 20);
                ctx.beginPath();
                ctx.ellipse(hs - 2, hs - 2, s * 0.2, s * 0.08, 0, 0, Math.PI * 2);
                ctx.fill();
                // Tail
                ctx.fillStyle = shadeColor(color, -15);
                ctx.beginPath();
                ctx.moveTo(s * 0.75, hs);
                ctx.lineTo(s * 0.9, hs - s * 0.12);
                ctx.lineTo(s * 0.9, hs + s * 0.12);
                ctx.fill();
                // Eye
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(s * 0.25, hs - 2, 3, 3);
                ctx.fillStyle = '#1a1a2a';
                ctx.fillRect(s * 0.27, hs - 1, 1, 1);
                break;
            case 'hoe':
                ctx.fillStyle = '#6a4a2a';
                ctx.fillRect(s * 0.45, s * 0.15, s * 0.1, s * 0.6);
                ctx.fillStyle = '#8a8a9a';
                ctx.fillRect(s * 0.3, s * 0.7, s * 0.4, s * 0.12);
                break;
            case 'wateringCan':
                ctx.fillStyle = '#6aaedd';
                ctx.fillRect(s * 0.25, s * 0.35, s * 0.4, s * 0.35);
                ctx.fillRect(s * 0.55, s * 0.25, s * 0.2, s * 0.1);
                ctx.fillStyle = '#5a9ecd';
                ctx.fillRect(s * 0.2, s * 0.3, s * 0.5, s * 0.08);
                break;
            case 'pickaxe':
                ctx.fillStyle = '#6a4a2a';
                ctx.fillRect(s * 0.45, s * 0.15, s * 0.1, s * 0.6);
                ctx.fillStyle = '#8a8a9a';
                ctx.fillRect(s * 0.25, s * 0.12, s * 0.5, s * 0.12);
                ctx.fillStyle = '#7a7a8a';
                ctx.fillRect(s * 0.2, s * 0.15, s * 0.15, s * 0.08);
                break;
            case 'axe':
                ctx.fillStyle = '#6a4a2a';
                ctx.fillRect(s * 0.45, s * 0.2, s * 0.1, s * 0.6);
                ctx.fillStyle = '#8a8a9a';
                ctx.beginPath();
                ctx.moveTo(s * 0.3, s * 0.15);
                ctx.lineTo(s * 0.55, s * 0.15);
                ctx.lineTo(s * 0.55, s * 0.35);
                ctx.lineTo(s * 0.3, s * 0.25);
                ctx.fill();
                break;
            case 'fishingRod':
                ctx.fillStyle = '#6a4a2a';
                ctx.fillRect(s * 0.45, s * 0.1, s * 0.08, s * 0.7);
                ctx.strokeStyle = '#c0c0c0';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(s * 0.49, s * 0.1);
                ctx.lineTo(s * 0.7, s * 0.3);
                ctx.stroke();
                break;
            case 'sword':
            case 'weapon':
                ctx.fillStyle = '#6a4a2a';
                ctx.fillRect(s * 0.42, s * 0.6, s * 0.16, s * 0.25);
                ctx.fillStyle = '#d4a840';
                ctx.fillRect(s * 0.3, s * 0.55, s * 0.4, s * 0.08);
                ctx.fillStyle = color;
                ctx.fillRect(s * 0.4, s * 0.1, s * 0.2, s * 0.48);
                ctx.fillStyle = shadeColor(color, 30);
                ctx.fillRect(s * 0.42, s * 0.12, s * 0.08, s * 0.4);
                break;
            case 'potion':
            case 'consumable':
                ctx.fillStyle = shadeColor(color, -20);
                ctx.fillRect(s * 0.35, s * 0.35, s * 0.3, s * 0.4);
                roundRect(ctx, s * 0.32, s * 0.4, s * 0.36, s * 0.35, 3);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.fillStyle = shadeColor(color, 30);
                ctx.fillRect(s * 0.38, s * 0.42, s * 0.1, s * 0.2);
                // Neck
                ctx.fillStyle = '#8a8a8a';
                ctx.fillRect(s * 0.4, s * 0.28, s * 0.2, s * 0.12);
                // Cork
                ctx.fillStyle = '#a88860';
                ctx.fillRect(s * 0.42, s * 0.22, s * 0.16, s * 0.08);
                break;
            case 'food':
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.ellipse(hs, hs + 2, s * 0.25, s * 0.2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = shadeColor(color, 15);
                ctx.beginPath();
                ctx.ellipse(hs - 2, hs, s * 0.15, s * 0.12, 0, 0, Math.PI * 2);
                ctx.fill();
                // Steam
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.fillRect(hs - 1, hs - s * 0.2, 2, 3);
                ctx.fillRect(hs + 3, hs - s * 0.25, 2, 3);
                break;
            case 'wood':
            case 'material':
                ctx.fillStyle = color;
                ctx.fillRect(s * 0.2, s * 0.3, s * 0.6, s * 0.15);
                ctx.fillRect(s * 0.25, s * 0.5, s * 0.55, s * 0.15);
                ctx.fillStyle = shadeColor(color, -10);
                ctx.fillRect(s * 0.2, s * 0.3, s * 0.6, s * 0.03);
                ctx.fillRect(s * 0.25, s * 0.5, s * 0.55, s * 0.03);
                break;
            case 'ore':
                ctx.fillStyle = '#7a7a8a';
                ctx.beginPath();
                ctx.moveTo(s * 0.2, s * 0.7);
                ctx.lineTo(s * 0.15, s * 0.4);
                ctx.lineTo(s * 0.4, s * 0.2);
                ctx.lineTo(s * 0.7, s * 0.3);
                ctx.lineTo(s * 0.8, s * 0.6);
                ctx.lineTo(s * 0.5, s * 0.75);
                ctx.closePath();
                ctx.fill();
                // Ore veins
                ctx.fillStyle = color;
                ctx.fillRect(s * 0.35, s * 0.4, s * 0.12, s * 0.12);
                ctx.fillRect(s * 0.5, s * 0.5, s * 0.1, s * 0.1);
                ctx.fillRect(s * 0.3, s * 0.55, s * 0.08, s * 0.08);
                break;
            case 'gem':
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(hs, s * 0.2);
                ctx.lineTo(s * 0.7, s * 0.4);
                ctx.lineTo(s * 0.65, s * 0.7);
                ctx.lineTo(s * 0.35, s * 0.7);
                ctx.lineTo(s * 0.3, s * 0.4);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = shadeColor(color, 30);
                ctx.beginPath();
                ctx.moveTo(hs, s * 0.25);
                ctx.lineTo(s * 0.6, s * 0.4);
                ctx.lineTo(hs, s * 0.5);
                ctx.lineTo(s * 0.4, s * 0.4);
                ctx.closePath();
                ctx.fill();
                // Sparkle
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.fillRect(hs - 1, s * 0.3, 2, 2);
                break;
            case 'ring':
            case 'accessory':
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(hs, hs, s * 0.25, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = shadeColor(color, -30);
                ctx.beginPath();
                ctx.arc(hs, hs, s * 0.15, 0, Math.PI * 2);
                ctx.fill();
                // Gem on ring
                ctx.fillStyle = shadeColor(color, 40);
                ctx.fillRect(hs - 3, s * 0.2, 6, 5);
                break;
            case 'fiber':
                ctx.fillStyle = color;
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(s * 0.3 + i * 4, s * 0.2, 2, s * 0.6);
                }
                ctx.fillRect(s * 0.25, s * 0.45, s * 0.5, 2);
                break;
            default:
                ctx.fillStyle = color;
                ctx.fillRect(s * 0.25, s * 0.25, s * 0.5, s * 0.5);
        }
    }

    function getItemIcon(item) {
        const key = `item_${item.id}`;
        return createCachedSprite(key, TILE, TILE, (ctx) => {
            drawItemIcon(ctx, item, TILE);
        });
    }

    // ---- CROP SPRITES ----
    function drawCropStage(ctx, cropType, stage, maxStage, color) {
        const w = TILE, h = TILE;
        switch (stage) {
            case 0: // Bare soil with seed
                ctx.fillStyle = '#5a4030';
                ctx.fillRect(12, 24, 8, 2);
                ctx.fillStyle = '#8a6a42';
                ctx.fillRect(14, 22, 4, 3);
                break;
            case 1: // Small sprout
                ctx.fillStyle = '#5a8a3a';
                ctx.fillRect(15, 20, 2, 8);
                ctx.fillRect(13, 20, 6, 2);
                break;
            case 2: // Medium plant
                ctx.fillStyle = '#4a7a2a';
                ctx.fillRect(14, 14, 4, 14);
                ctx.fillStyle = '#5a9a3a';
                ctx.fillRect(10, 16, 6, 3);
                ctx.fillRect(16, 14, 6, 3);
                break;
            case 3: // Tall plant
                ctx.fillStyle = '#3a6a1a';
                ctx.fillRect(14, 8, 4, 20);
                ctx.fillStyle = '#4a8a2a';
                ctx.fillRect(8, 12, 8, 4);
                ctx.fillRect(16, 10, 8, 4);
                ctx.fillRect(9, 18, 6, 3);
                ctx.fillRect(17, 16, 7, 3);
                break;
            default: // Max stage - fruiting
                ctx.fillStyle = '#3a6a1a';
                ctx.fillRect(14, 6, 4, 22);
                ctx.fillStyle = '#4a8a2a';
                ctx.fillRect(8, 10, 8, 4);
                ctx.fillRect(16, 8, 8, 4);
                ctx.fillRect(8, 18, 7, 3);
                ctx.fillRect(17, 16, 7, 3);
                // Fruit
                ctx.fillStyle = color;
                fillCircle(ctx, 10, 20, 4);
                fillCircle(ctx, 22, 18, 4);
                fillCircle(ctx, 14, 24, 3);
                ctx.fillStyle = shadeColor(color, 25);
                ctx.fillRect(9, 19, 2, 2);
                ctx.fillRect(21, 17, 2, 2);
                break;
        }
    }

    function getCropSprite(cropType, stage, maxStage, color, watered) {
        const key = `crop_${cropType}_${stage}_${watered ? 1 : 0}`;
        return createCachedSprite(key, TILE, TILE, (ctx) => {
            // Soil base
            if (watered) {
                ctx.fillStyle = '#5a4030';
                ctx.fillRect(0, 26, TILE, 6);
            }
            drawCropStage(ctx, cropType, stage, maxStage, color);
        });
    }

    // ---- HOUSE INTERIOR DECORATIONS ----
    function drawHouseInterior(ctx, camX, camY) {
        // Rug (center of room)
        const rugX = 4 * TILE - camX;
        const rugY = 4 * TILE - camY;
        ctx.fillStyle = '#8a3a3a';
        ctx.fillRect(rugX, rugY, TILE * 4, TILE * 3);
        ctx.fillStyle = '#aa5a4a';
        ctx.fillRect(rugX + 4, rugY + 4, TILE * 4 - 8, TILE * 3 - 8);
        ctx.fillStyle = '#d4a840';
        ctx.fillRect(rugX + 8, rugY + 8, TILE * 4 - 16, TILE * 3 - 16);
        ctx.fillStyle = '#aa5a4a';
        ctx.fillRect(rugX + 12, rugY + 12, TILE * 4 - 24, TILE * 3 - 24);

        // Bookshelf (left wall)
        const bsX = 1 * TILE - camX;
        const bsY = 1 * TILE - camY;
        ctx.fillStyle = '#6a4a2a';
        ctx.fillRect(bsX, bsY, TILE * 2, TILE);
        ctx.fillStyle = '#7a5a3a';
        ctx.fillRect(bsX + 2, bsY + 2, TILE * 2 - 4, 4);
        ctx.fillRect(bsX + 2, bsY + 10, TILE * 2 - 4, 4);
        ctx.fillRect(bsX + 2, bsY + 18, TILE * 2 - 4, 4);
        // Books
        const bookColors = ['#e83838', '#3838e8', '#38a838', '#d4a840', '#8a3a8a'];
        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = bookColors[i % bookColors.length];
            const shelf = Math.floor(i / 4);
            ctx.fillRect(bsX + 4 + (i % 4) * 14, bsY + 4 + shelf * 8, 10, 5);
        }

        // Window (top wall) with light
        const winX = 5 * TILE - camX;
        const winY = 0 * TILE - camY + 8;
        ctx.fillStyle = '#8ac8e8';
        ctx.fillRect(winX, winY, TILE * 2, TILE - 8);
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(winX + TILE - 1, winY, 2, TILE - 8);
        ctx.fillRect(winX, winY + 10, TILE * 2, 2);
        ctx.strokeStyle = '#5a3a1a';
        ctx.lineWidth = 2;
        ctx.strokeRect(winX, winY, TILE * 2, TILE - 8);
        // Light beam
        ctx.fillStyle = 'rgba(255, 230, 150, 0.08)';
        ctx.beginPath();
        ctx.moveTo(winX, winY + TILE);
        ctx.lineTo(winX + TILE * 2, winY + TILE);
        ctx.lineTo(winX + TILE * 3, winY + TILE * 5);
        ctx.lineTo(winX - TILE, winY + TILE * 5);
        ctx.closePath();
        ctx.fill();
    }

    return {
        getTileSprite,
        getTreeSprite,
        getRockSprite,
        getBushSprite,
        getFenceSprite,
        getHouseSprite,
        getDungeonEntranceSprite,
        getCraftingBenchSprite,
        getChestSprite,
        getShippingBinSprite,
        getBedSprite,
        getPlayerSprite,
        getEnemySprite,
        getNPCSprite,
        getItemIcon,
        getCropSprite,
        drawItemIcon,
        drawFishingFlag,
        drawHouseInterior,
        fillCircle
    };
})();
