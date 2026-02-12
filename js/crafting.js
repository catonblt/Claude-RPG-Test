// ============================================================
// VERDANT HOLLOW — Crafting System
// ============================================================

const RECIPES = [
    { result: ITEM.IRON_BAR, amount: 1, ingredients: [{ id: ITEM.IRON_ORE, amount: 3 }], category: 'Smelting' },
    { result: ITEM.GOLD_BAR, amount: 1, ingredients: [{ id: ITEM.GOLD_ORE, amount: 3 }], category: 'Smelting' },
    { result: ITEM.IRON_SWORD, amount: 1, ingredients: [{ id: ITEM.IRON_BAR, amount: 3 }, { id: ITEM.WOOD, amount: 2 }], category: 'Weapon' },
    { result: ITEM.STEEL_SWORD, amount: 1, ingredients: [{ id: ITEM.IRON_BAR, amount: 5 }, { id: ITEM.GOLD_BAR, amount: 1 }], category: 'Weapon' },
    { result: ITEM.ENCHANTED_BLADE, amount: 1, ingredients: [{ id: ITEM.IRON_BAR, amount: 3 }, { id: ITEM.DARK_CRYSTAL, amount: 2 }, { id: ITEM.EMERALD, amount: 1 }], category: 'Weapon' },
    { result: ITEM.HEALTH_POTION, amount: 1, ingredients: [{ id: ITEM.SLIME_GEL, amount: 2 }, { id: ITEM.FIBER, amount: 1 }], category: 'Potion' },
    { result: ITEM.MANA_POTION, amount: 1, ingredients: [{ id: ITEM.BAT_WING, amount: 2 }, { id: ITEM.FIBER, amount: 1 }], category: 'Potion' },
    { result: ITEM.ELIXIR, amount: 1, ingredients: [{ id: ITEM.HEALTH_POTION, amount: 1 }, { id: ITEM.MANA_POTION, amount: 1 }, { id: ITEM.DARK_CRYSTAL, amount: 1 }], category: 'Potion' },
    { result: ITEM.COOKED_MEAL, amount: 1, ingredients: [{ id: ITEM.TURNIP, amount: 1 }, { id: ITEM.WOOD, amount: 1 }], category: 'Food' },
    { result: ITEM.HEARTY_STEW, amount: 3, ingredients: [{ id: ITEM.TOMATO, amount: 1 }, { id: ITEM.CARROT, amount: 1 }, { id: ITEM.WOOD, amount: 1 }], category: 'Food' },
    { result: ITEM.IRON_RING, amount: 1, ingredients: [{ id: ITEM.IRON_BAR, amount: 2 }], category: 'Accessory' },
    { result: ITEM.GOLD_RING, amount: 1, ingredients: [{ id: ITEM.GOLD_BAR, amount: 2 }, { id: ITEM.RUBY, amount: 1 }], category: 'Accessory' },
    { result: ITEM.POWER_RING, amount: 1, ingredients: [{ id: ITEM.GOLD_BAR, amount: 1 }, { id: ITEM.DARK_CRYSTAL, amount: 1 }, { id: ITEM.RUBY, amount: 1 }], category: 'Accessory' },
    { result: ITEM.SHIELD_RING, amount: 1, ingredients: [{ id: ITEM.GOLD_BAR, amount: 1 }, { id: ITEM.DARK_CRYSTAL, amount: 1 }, { id: ITEM.SAPPHIRE, amount: 1 }], category: 'Accessory' },
    { result: ITEM.AXE, amount: 1, ingredients: [{ id: ITEM.IRON_BAR, amount: 2 }, { id: ITEM.WOOD, amount: 3 }], category: 'Tool' }
];

const Crafting = (() => {

    function canCraft(recipe, player) {
        for (const ing of recipe.ingredients) {
            if (player.countItem(ing.id) < ing.amount) return false;
        }
        return true;
    }

    function craft(recipe, player) {
        if (!canCraft(recipe, player)) return false;
        for (const ing of recipe.ingredients) {
            player.removeItem(ing.id, ing.amount);
        }
        player.addItem(recipe.result, recipe.amount);
        Audio.sfx.craft();
        return true;
    }

    return { canCraft, craft, RECIPES };
})();
