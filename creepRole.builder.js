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
                creep.memory.state = STATE_COLLECTING;
                run(creep);
            }
            else {
                if (!creep.inRangeTo(target, 2)) {
                    // Move so we adjacent to storage.
                    creep.moveTo(target);
                } else {
                    if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity())
                        creep.memory.state = STATE_BUILDING;
                    else
                        creep.memory.state = STATE_COLLECTING;

                    run(creep);
                }
            }
            return;
        case STATE_BUILDING:
            if (creep.store[RESOURCE_ENERGY] === 0) {
                creep.say('🔄 collect');
                creep.memory.state = STATE_COLLECTING;
                run(creep);
                return;
            }
            let constructSite = Game.getObjectById(creep.memory.tid);
            if (constructSite) {
                if (creep.build(constructSite) == ERR_NOT_IN_RANGE) {
                    creep.memory.tid = constructSite.id;
                    creep.memory.state = STATE_MOVING;
                    run(creep);
                    return;
                }
            }
            else {
                delete creep.memory.tid;
                // Find next target
                constructSite = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                if (constructSite) {
                    creep.say('⚡ deliver');
                    creep.memory.tid = constructSite.id;
                    creep.memory.state = STATE_MOVING;
                }
                else {
                    creep.say('🔄 collect');
                    creep.memory.state = STATE_COLLECTING;
                }

                run(creep);
                return;
            }

            return;
    }
}

module.exports = {
    parts: parts,
    init: init,
    run: run,
};