// ============================================================
// VERDANT HOLLOW — Player System
// ============================================================

class Player {
    constructor() {
        this.x = SPAWN_X;
        this.y = SPAWN_Y;
        this.px = SPAWN_X * TILE;
        this.py = SPAWN_Y * TILE;
        this.dir = DIR.DOWN;
        this.walkFrame = 0;
        this.moveTimer = 0;
        this.actionTimer = 0;
        this.breathFrame = 0;

        // Stats
        this.hp = 100;
        this.maxHp = 100;
        this.mp = 50;
        this.maxMp = 50;
        this.stamina = 100;
        this.maxStamina = 100;
        this.attack = 10;
        this.defense = 5;
        this.level = 1;
        this.xp = 0;
        this.xpToNext = 100;
        this.gold = 50;

        // Inventory (24 slots)
        this.inventory = new Array(24).fill(null);
        this.selectedSlot = 0;

        // Equipment
        this.weapon = null; // item id
        this.accessory = null; // item id

        // Time
        this.hour = 8;
        this.minute = 0;
        this.day = 1;
        this.season = 0; // index into SEASONS
        this.timeTick = 0;

        // State
        this.dead = false;
        this.deathTimer = 0;

        // Starting items
        this.addItem(ITEM.HOE, 1);
        this.addItem(ITEM.WATERING_CAN, 1);
        this.addItem(ITEM.PICKAXE, 1);
        this.addItem(ITEM.WOOD_SWORD, 1);
        this.equipWeapon(ITEM.WOOD_SWORD);
    }

    get totalAttack() {
        let atk = this.attack;
        if (this.weapon) {
            const w = ITEM_DB[this.weapon];
            if (w && w.attack) atk += w.attack;
        }
        if (this.accessory) {
            const a = ITEM_DB[this.accessory];
            if (a && a.attack) atk += a.attack;
        }
        return atk;
    }

    get totalDefense() {
        let def = this.defense;
        if (this.accessory) {
            const a = ITEM_DB[this.accessory];
            if (a && a.defense) def += a.defense;
        }
        return def;
    }

    get seasonName() {
        return SEASONS[this.season];
    }

    get timeString() {
        return `${this.hour.toString().padStart(2, '0')}:${this.minute.toString().padStart(2, '0')}`;
    }

    addItem(itemId, amount) {
        amount = amount || 1;
        // Stack with existing
        for (let i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i] && this.inventory[i].id === itemId) {
                this.inventory[i].amount += amount;
                return true;
            }
        }
        // Find empty slot
        for (let i = 0; i < this.inventory.length; i++) {
            if (!this.inventory[i]) {
                this.inventory[i] = { id: itemId, amount };
                return true;
            }
        }
        return false; // Inventory full
    }

    removeItem(itemId, amount) {
        amount = amount || 1;
        for (let i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i] && this.inventory[i].id === itemId) {
                this.inventory[i].amount -= amount;
                if (this.inventory[i].amount <= 0) {
                    this.inventory[i] = null;
                }
                return true;
            }
        }
        return false;
    }

    hasItem(itemId, amount) {
        amount = amount || 1;
        for (const slot of this.inventory) {
            if (slot && slot.id === itemId && slot.amount >= amount) return true;
        }
        return false;
    }

    countItem(itemId) {
        let count = 0;
        for (const slot of this.inventory) {
            if (slot && slot.id === itemId) count += slot.amount;
        }
        return count;
    }

    getSelectedItem() {
        return this.inventory[this.selectedSlot];
    }

    getSelectedItemData() {
        const slot = this.inventory[this.selectedSlot];
        if (!slot) return null;
        return ITEM_DB[slot.id];
    }

    equipWeapon(itemId) {
        this.weapon = itemId;
    }

    equipAccessory(itemId) {
        this.accessory = itemId;
    }

    useConsumable(itemId) {
        const item = ITEM_DB[itemId];
        if (!item) return false;
        switch (item.effect) {
            case 'heal':
                this.hp = Math.min(this.maxHp, this.hp + item.value);
                break;
            case 'mana':
                this.mp = Math.min(this.maxMp, this.mp + item.value);
                break;
            case 'stamina':
                this.stamina = Math.min(this.maxStamina, this.stamina + item.value);
                break;
            case 'fullRestore':
                this.hp = this.maxHp;
                this.mp = this.maxMp;
                this.stamina = this.maxStamina;
                break;
            default:
                return false;
        }
        this.removeItem(itemId, 1);
        return true;
    }

    gainXP(amount) {
        this.xp += amount;
        while (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.level++;
            this.maxHp += 10;
            this.maxMp += 5;
            this.maxStamina += 10;
            this.attack += 2;
            this.defense += 1;
            this.hp = this.maxHp;
            this.mp = this.maxMp;
            this.stamina = this.maxStamina;
            this.xpToNext = Math.floor(100 * Math.pow(1.5, this.level - 1));
            return true; // Level up occurred
        }
        return false;
    }

    advanceTime() {
        this.timeTick++;
        if (this.timeTick >= TIME_TICK_FRAMES) {
            this.timeTick = 0;
            this.minute += 5;
            if (this.minute >= 60) {
                this.minute = 0;
                this.hour++;
                if (this.hour >= 24) {
                    this.hour = 0;
                }
            }
        }
    }

    sleep() {
        this.hour = 8;
        this.minute = 0;
        this.day++;
        if (this.day > DAYS_PER_SEASON) {
            this.day = 1;
            this.season = (this.season + 1) % 4;
        }
        this.hp = this.maxHp;
        this.mp = this.maxMp;
        this.stamina = this.maxStamina;
    }

    getTimeLighting() {
        if (this.hour >= 5 && this.hour < 7) return { color: 'rgba(255, 180, 100, 0.12)', name: 'dawn' };
        if (this.hour >= 7 && this.hour < 11) return { color: 'rgba(255, 220, 150, 0.05)', name: 'morning' };
        if (this.hour >= 11 && this.hour < 16) return { color: 'rgba(255, 230, 180, 0.08)', name: 'afternoon' };
        if (this.hour >= 16 && this.hour < 19) return { color: 'rgba(255, 150, 50, 0.18)', name: 'evening' };
        if (this.hour >= 19 && this.hour < 21) return { color: 'rgba(50, 50, 150, 0.20)', name: 'dusk' };
        return { color: 'rgba(20, 20, 80, 0.35)', name: 'night' };
    }

    die() {
        this.dead = true;
        this.deathTimer = DEATH_TIMER;
    }

    respawn() {
        this.dead = false;
        this.deathTimer = 0;
        this.x = SPAWN_X;
        this.y = SPAWN_Y;
        this.px = SPAWN_X * TILE;
        this.py = SPAWN_Y * TILE;
        this.hp = Math.floor(this.maxHp * 0.5);
        this.gold = Math.floor(this.gold * 0.8);
    }

    getFacingTile() {
        let fx = this.x, fy = this.y;
        if (this.dir === DIR.UP) fy--;
        else if (this.dir === DIR.DOWN) fy++;
        else if (this.dir === DIR.LEFT) fx--;
        else if (this.dir === DIR.RIGHT) fx++;
        return { x: fx, y: fy };
    }
}
