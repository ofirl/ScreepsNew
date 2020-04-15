"use strict";

const STATE_MOVING = 1;
const STATE_COLLECTING = 2;
const STATE_UPGRADING = 3;

function parts(energy) {
    // TODO. Scale upgrader.
    return [WORK, WORK, CARRY, MOVE];
}

function init(creep) {
    let containers = creep.room.controller.pos.findInRange(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE
    }, 3);
    if (containers.length > 0) {
        let container = _.max(containers, (c) => c.store.energy);
        creep.memory.tid = container.id;
    }
    creep.memory.state = STATE_MOVING;
}

function run(creep) {
    switch (creep.memory.state) {
        case STATE_MOVING:
            // Move to controller even without energy, as we have transport deliver it.
            let target = Game.getObjectById(creep.memory.tid);
            if (!target) {
                // The target was destroyed.
                delete creep.memory.tid;
            }
            if (target) {
                if (!creep.isNearTo(target)) {
                    // Move so we adjacent to storage.
                    creep.moveTo(target);
                } else {
                    creep.memory.state = STATE_COLLECTING;
                }
            } else {
                if (creep.pos.getRangeTo(creep.room.controller) > 3) {
                    creep.moveTo(creep.room.controller);
                } else {
                    creep.memory.state = STATE_COLLECTING;
                }
            }
            return;
        case STATE_COLLECTING:
            if (_.sum(creep.carry) === creep.carryCapacity) {
                creep.memory.state = STATE_UPGRADING;
                creep.say('⚡ upgrade');
                run(creep);
                return;
            }

            let collectFrom = Game.getObjectById(creep.memory.tid);
            if (collectFrom) {
                creep.withdraw(collectFrom, RESOURCE_ENERGY);
            } else {
                // The target was destroyed.
                delete creep.memory.tid;

                // We wait for someone to fill us up.
            }
            return;
        case STATE_UPGRADING:
            if (creep.carry.energy === 0) {
                creep.memory.state = STATE_COLLECTING;
                creep.say('🔄 collect');
                run(creep);
                return;
            }

            creep.upgradeController(creep.room.controller);
            return;
    }
}

module.exports = {
    parts: parts,
    init: init,
    run: run,
};