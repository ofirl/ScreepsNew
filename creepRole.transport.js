"use strict";

const STATE_COLLECT = 1;
const STATE_DELIVER = 2;

function parts(energy) {
    let parts = [CARRY, MOVE];
    let extraParts = [CARRY, MOVE];
    let extraPartsNum = Math.min(Math.floor((energy - 100) / 100), 4);
    for (let i = 0; i < extraPartsNum; i++)
        parts.push(...extraParts);

    return parts;
}

function init(creep) {
    creep.memory.state = STATE_COLLECT;
}

/**
 * 
 * @param {Creep} creep 
 */
function run(creep) {
    switch (creep.memory.state) {
        case STATE_COLLECT: {
            if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
                creep.say('⚡ deliver');
                creep.memory.state = STATE_DELIVER;
                // Clear the collection point as we wish to reselect collection target for next collection.
                delete creep.memory.collectFrom;
                run(creep);
                return;
            }
            creep.collectEnergy();
            return;
        }
        case STATE_DELIVER: {
            if (creep.store[RESOURCE_ENERGY] === 0) {
                creep.say('🔄 collect');
                creep.memory.state = STATE_COLLECT;
                run(creep);
                return;
            }
            let { target, type } = creep.getTargetUnion({
                spawn: {
                    selector: () => //_.max(
                        creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                            filter: (s) => (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) &&
                                s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY)
                        })
                    //, (s) => s.store.getCapacity(RESOURCE_ENERGY) - s.store[RESOURCE_ENERGY]),
                    // validator: (s) => s.store && s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY),
                },
                tower: {
                    selector: () => creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                        filter: (s) => s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                    }),
                    // validator: (t) => t.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                },
                storage: {
                    selector: () =>
                        creep.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (s) => s.structureType === STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY)
                        }),
                    // validator: (c) => c.store[RESOURCE_ENERGY] < c.store.getCapacity(RESOURCE_ENERGY),
                },
                upgrader: {
                    selector: () => _.max(
                        creep.room.find(FIND_MY_CREEPS, {
                            filter: (c) => c.memory.role === 'upgrader' && c.store[RESOURCE_ENERGY] < c.store.getCapacity(RESOURCE_ENERGY)
                        }),
                        (c) => c.store.getCapacity(RESOURCE_ENERGY) - c.store[RESOURCE_ENERGY]),
                    // validator: (c) => c.store[RESOURCE_ENERGY] < c.store.getCapacity(RESOURCE_ENERGY),
                },
            }, 'deliverTo');
            let ret = creep.transfer(target, RESOURCE_ENERGY);
            if (ret === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                return;
            }

            delete creep.memory.deliverTo;
            return;
        }
        default: {
            creep.memory.state = STATE_COLLECT;
        }
    }
}

module.exports = {
    parts: parts,
    init: init,
    run: run,
};