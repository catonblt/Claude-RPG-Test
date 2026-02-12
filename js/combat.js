// ============================================================
// VERDANT HOLLOW — Combat System
// ============================================================

const Combat = (() => {

    function calcDamage(attackerAtk, defenderDef) {
        return Math.max(1, attackerAtk - Math.floor(defenderDef / 2) + randInt(-2, 2));
    }

    function playerAttack(player, enemy, particles, floatingTexts) {
        const dmg = calcDamage(player.totalAttack, enemy.defense);
        enemy.hp -= dmg;
        enemy.hitFlash = 10;
        player.actionTimer = ACTION_TIMER;

        Audio.sfx.hit();

        // Floating damage text
        if (floatingTexts) {
            floatingTexts.push({
                x: enemy.px + HALF_TILE,
                y: enemy.py,
                text: `-${dmg}`,
                color: COLORS.UI_RED,
                life: 60
            });
        }

        // Hit particles
        if (particles) {
            particles.emit(enemy.px + HALF_TILE, enemy.py + HALF_TILE, 5, '#e86565', 2);
        }

        if (enemy.hp <= 0) {
            return handleEnemyDeath(player, enemy, floatingTexts);
        }
        return null;
    }

    function handleEnemyDeath(player, enemy, floatingTexts) {
        const result = { xp: enemy.xp, gold: enemy.gold, drops: [] };

        // XP
        const leveledUp = player.gainXP(enemy.xp);
        if (floatingTexts) {
            floatingTexts.push({
                x: enemy.px + HALF_TILE,
                y: enemy.py - 16,
                text: `+${enemy.xp} XP`,
                color: COLORS.UI_PURPLE,
                life: 60
            });
        }

        // Gold
        player.gold += enemy.gold;
        if (floatingTexts) {
            floatingTexts.push({
                x: enemy.px + HALF_TILE,
                y: enemy.py - 32,
                text: `+${enemy.gold}G`,
                color: COLORS.UI_GOLD,
                life: 60
            });
        }

        Audio.sfx.coin();

        // Drops
        const dropTable = ENEMY_DROPS[enemy.type];
        if (dropTable) {
            for (const drop of dropTable) {
                if (Math.random() < drop.chance) {
                    player.addItem(drop.id, 1);
                    result.drops.push(drop.id);
                }
            }
        }

        result.leveledUp = leveledUp;
        return result;
    }

    function enemyAttackPlayer(enemy, player, floatingTexts) {
        if (player.dead) return;
        if (enemy.attackCooldown > 0) return;

        const dmg = calcDamage(enemy.attack, player.totalDefense);
        player.hp -= dmg;
        enemy.attackCooldown = 40;

        Audio.sfx.playerHit();

        if (floatingTexts) {
            floatingTexts.push({
                x: player.px + HALF_TILE,
                y: player.py,
                text: `-${dmg}`,
                color: '#ff4444',
                life: 60
            });
        }

        if (player.hp <= 0) {
            player.hp = 0;
            player.die();
            Audio.sfx.death();
        }
    }

    function updateEnemies(map, player, particles, floatingTexts) {
        // CRITICAL: Skip ALL enemy AI when player is dead
        if (player.dead) return;

        for (const enemy of map.enemies) {
            if (enemy.hp <= 0) continue;

            // Smooth position interpolation
            enemy.px = lerp(enemy.px, enemy.x * TILE, 0.2);
            enemy.py = lerp(enemy.py, enemy.y * TILE, 0.2);

            if (enemy.hitFlash > 0) enemy.hitFlash--;
            if (enemy.attackCooldown > 0) enemy.attackCooldown--;
            if (enemy.moveTimer > 0) { enemy.moveTimer--; continue; }

            const distToPlayer = manhattan(enemy.x, enemy.y, player.x, player.y);

            if (distToPlayer <= 1) {
                // Adjacent — attack
                enemyAttackPlayer(enemy, player, floatingTexts);
                enemy.moveTimer = 10;
            } else if (distToPlayer <= enemy.aggroRange) {
                // Chase player
                enemy.idle = false;
                let dx = 0, dy = 0;
                if (player.x < enemy.x) dx = -1;
                else if (player.x > enemy.x) dx = 1;
                if (player.y < enemy.y) dy = -1;
                else if (player.y > enemy.y) dy = 1;

                // Try to move toward player
                let moved = false;
                // Prefer axis with greater distance
                if (Math.abs(player.x - enemy.x) >= Math.abs(player.y - enemy.y)) {
                    if (dx !== 0 && canEnemyMove(map, enemy.x + dx, enemy.y)) {
                        enemy.x += dx;
                        moved = true;
                    } else if (dy !== 0 && canEnemyMove(map, enemy.x, enemy.y + dy)) {
                        enemy.y += dy;
                        moved = true;
                    }
                } else {
                    if (dy !== 0 && canEnemyMove(map, enemy.x, enemy.y + dy)) {
                        enemy.y += dy;
                        moved = true;
                    } else if (dx !== 0 && canEnemyMove(map, enemy.x + dx, enemy.y)) {
                        enemy.x += dx;
                        moved = true;
                    }
                }
                enemy.moveTimer = moved ? 12 : 20;
            } else {
                // Idle wander
                enemy.idle = true;
                enemy.wanderTimer--;
                if (enemy.wanderTimer <= 0) {
                    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
                    const [dx, dy] = dirs[randInt(0, 3)];
                    if (canEnemyMove(map, enemy.x + dx, enemy.y + dy)) {
                        enemy.x += dx;
                        enemy.y += dy;
                    }
                    enemy.wanderTimer = randInt(30, 60);
                    enemy.moveTimer = 15;
                }
            }
        }
    }

    function canEnemyMove(map, x, y) {
        if (!map.isWalkable(x, y)) return false;
        // Don't move onto other enemies
        for (const e of map.enemies) {
            if (e.hp > 0 && e.x === x && e.y === y) return false;
        }
        return true;
    }

    return { playerAttack, updateEnemies, calcDamage };
})();
