"use strict";

if (!Memory.creepGen) {
    Memory.creepGen = {};
}

module.exports = {
    /**
     * 
     * @param {Room} room 
     * @param {CreepRoles} creepRoles 
     */
    run: function (room, creepRoles) {
        if (!room.memory.spawnQueue) {
            room.memory.spawnQueue = [];
            room.memory.init = true;
        }

        if (!room.memory.spawnSettings || room.memory.spwanSettingsRefresh === Game.time) {
            if (!room.memory.upgradeContainer) {
                let structures = room.controller.pos.findInRange(FIND_STRUCTURES, 3, {
                    filter: (s) => s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE
                });

                room.memory.upgradeContainer = structures && structures.length ? structures[0].id : null;
            }

            room.memory.spwanSettingsRefresh = Game.time + 100;
            room.memory.spawnSettings = {
                miner: {
                    role: 'miner',
                    min: 1,
                    max: room.find(FIND_SOURCES).length,
                },
                transport: {
                    role: 'transport',
                    min: room.find(FIND_SOURCES).length + 2,
                },
                upgrader: {
                    role: 'upgrader',
                    min: Math.min(room.controller.level, 4),
                },
                builder: {
                    role: 'builder',
                    min: Math.max(Math.floor(room.find(FIND_CONSTRUCTION_SITES).filter(c => c.structureType !== STRUCTURE_ROAD).length / 2), 2),
                }
            };
        }

        let availableSpawns = room.findAvailableSpawns();
        let spawnQueue = room.memory.spawnQueue;

        // Queue additional creeps.
        if (availableSpawns.length > 0 && spawnQueue.length === 0) {
            // Ensure min numbers first.
            for (let ruleName in room.memory.spawnSettings) {
                let rule = room.memory.spawnSettings[ruleName];
                let min = rule.min || 0;
                let creepsWithRule = room.findCreepsWithRule(ruleName);
                let required = min - creepsWithRule.length;
                for (let i = 0; i < required; i++) {
                    if (!Memory.creepGen[ruleName]) {
                        Memory.creepGen[ruleName] = 1;
                    }
                    let num = Memory.creepGen[ruleName]++;
                    spawnQueue.push({
                        force: true,
                        rule: ruleName,
                        role: rule.role,
                        name: ruleName + num,
                        opts: rule.opts,
                    });
                }
            }
            // Then spawn rest.
            for (let ruleName in room.memory.spawnSettings) {
                let rule = room.memory.spawnSettings[ruleName];
                let min = rule.min || 0;
                let max = Math.max(rule.max || 0, min);
                let creepsWithRule = room.findCreepsWithRule(ruleName);
                if (creepsWithRule.length >= min) {
                    let additional = max - creepsWithRule.length;
                    for (let i = 0; i < additional; i++) {
                        if (!Memory.creepGen[ruleName]) {
                            Memory.creepGen[ruleName] = 1;
                        }
                        let num = Memory.creepGen[ruleName]++;
                        spawnQueue.push({
                            force: false,
                            rule: ruleName,
                            role: rule.role,
                            name: ruleName + num,
                            opts: rule.opts,
                        });
                    }
                }
            }
        }

        // Spawn creeps.
        for (let i = 0, n = availableSpawns.length; i < n && spawnQueue.length > 0; i++) {
            let spawn = availableSpawns[i];
            let settings = spawnQueue[0];
            let energy = settings.force ? room.energyAvailable : room.energyCapacityAvailable;
            let opts = settings.opts || {};
            if (!opts.memory) {
                opts.memory = {};
            }
            opts.memory.rule = settings.rule || settings.role;
            opts.memory.role = settings.role || settings.rule;
            let parts = creepRoles[opts.memory.role].parts(energy);

            let ret = spawn.spawnCreep(parts, settings.name, opts);
            if (ret === OK) {
                console.log('Spawning ' + settings.name);
                spawnQueue.shift();
            }
            // TODO more spawn error handling here.
        }
    },
};