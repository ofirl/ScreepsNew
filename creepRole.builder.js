"use strict";

const STATE_COLLECTING = 1;
const STATE_MOVING = 2;
const STATE_BUILDING = 3;

function parts(energy) {
    // TODO. Scale miner upto 5 work parts.
    return [WORK, CARRY, MOVE];
}

function init(creep) {
    creep.memory.state = STATE_COLLECTING;
}

function run(creep) {
    switch (creep.memory.state) {
        case STATE_COLLECTING:
            if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
                creep.say('⚡ deliver');
                creep.memory.state = STATE_BUILDING;
                // Clear the collection point as we wish to reselect collection target for next collection.
                delete creep.memory.collectFrom;
                run(creep);
                return;
            }
            creep.collectEnergy();
            return;
        case STATE_MOVING:
            let target = Game.getObjectById(creep.memory.tid);
            if (!target) {
                // The target was destroyed.
                delete creep.memory.tid;

                // Find next target
                target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                if (target)
                    creep.memory.tid = target.id;
                else
                    return;
            }
            if (target) {
                if (!creep.isNearTo(target)) {
                    // Move so we adjacent to storage.
                    creep.moveTo(target);
                } else {
                    creep.memory.state = STATE_BUILDING;
                }
            } else {
                // Should not reach here
                return;
            }
            return;
        case STATE_BUILDING:
            let target = Game.getObjectById(creep.memory.tid);
            if (target) {
                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
            if (!target) {
                delete creep.memory.tid;
                creep.memory.state = STATE_COLLECT;
            }

            return;
    }
}

module.exports = {
    parts: parts,
    init: init,
    run: run,
};