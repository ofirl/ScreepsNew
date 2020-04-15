"use strict";

const STATE_COLLECT = 1;
const STATE_DELIVER = 2;

function parts(energy) {
    return [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE];
}

function init(creep) {
    creep.memory.state = STATE_COLLECT;
}

function run(creep) {
    switch (creep.memory.state) {
        case STATE_COLLECT: {
            if (_.sum(creep.carry) === creep.carryCapacity) {
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
            if (creep.carry.energy === 0) {
                creep.say('🔄 collect');
                creep.memory.state = STATE_COLLECT;
                run(creep);
                return;
            }
            let {target, type} = creep.getTargetUnion({
                spawn: {
                    selector: () => _.max(
                        creep.room.find(FIND_MY_STRUCTURES, {
                            filter: (s) => (s.structureType === STRUCTURE_SPAWN ||
                                s.structureType === STRUCTURE_EXTENSION) && s.energy < s.energyCapacity
                        }),
                        (s) => s.energyCapacity - s.energy),
                    validator: (s) => s.energy < s.energyCapacity,
                },
                upgrader: {
                    selector: () => _.max(
                        creep.room.find(FIND_MY_CREEPS, {
                            filter: (c) => c.memory.role === 'upgrader' && _.sum(c.carry) < c.carryCapacity
                        }),
                        (c) => c.carryCapacity - _.sum(c.carry)),
                    validator: (c) => _.sum(c.carry) < c.carryCapacity,
                },
            }, 'deliverTo');
            let ret = creep.transfer(target, RESOURCE_ENERGY);
            if (ret === OK) {
                // We transferred all we could, pick a new target.
                delete creep.memory.deliverTo;
            } else if (ret === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            return;
        }
    }
}

module.exports = {
    parts: parts,
    init: init,
    run: run,
};