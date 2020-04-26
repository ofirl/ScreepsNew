"use strict";

const STATE_MOVING = 1;
const STATE_COLLECTING = 2;
const STATE_UPGRADING = 3;

function parts(energy) {
    let parts = [WORK, WORK, CARRY, MOVE];
    let extraParts = [WORK];
    let extraPartsNum = Math.min(Math.floor((energy - 300) / 100), 4);
    for (let i = 0; i < extraPartsNum; i++)
        parts.push(...extraParts);

    return parts;
}

function init(creep) {
    // let containers = creep.room.controller.pos.findInRange(FIND_STRUCTURES, 4, {
    //     filter: (s) => s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE
    // });
    // if (containers.length > 0) {
    //     let container = _.max(containers, (c) => c.store.energy);
    //     creep.memory.tid = container.id;
    // }

    creep.memory.state = STATE_MOVING;

    let flag = creep.room.find(FIND_FLAGS, {
        filter: (f) => f.color === COLOR_YELLOW && f.secondaryColor === COLOR_GREEN && (!f.memory.creep || !Game.getObjectById(f.memory.creep))
    });

    if (flag && flag.length > 0) {
        creep.memory.tid = flag[0].name
        flag[0].memory.creep = creep.id
    }
}

function run(creep) {
    switch (creep.memory.state) {
        case STATE_MOVING:
            // Move to controller even without energy, as we have transport deliver it.
            let target;
            if (creep.memory.tid)
                target = Game.flags[creep.memory.tid];

            // if (!target) {
            //     // The target was destroyed.
            //     delete creep.memory.tid;
            // }
            if (target) {
                // if (creep.pos !== target.pos) {
                if (!creep.pos.inRangeTo(target, 0)) {
                    // Move so we adjacent to storage.
                    creep.moveTo(target.pos);
                } else {
                    creep.memory.state = STATE_COLLECTING;
                }
            }
            else {
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

            let collectFrom = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
            });
            if (collectFrom && collectFrom.length) {
                collectFrom = collectFrom[0];
            }
            else
                collectFrom = null;

            // let collectFrom = Game.getObjectById(creep.memory.tid);
            if (collectFrom) {
                creep.withdraw(collectFrom, RESOURCE_ENERGY);
            }
            // else {
            //     // The target was destroyed.
            //     delete creep.memory.tid;

            //     // We wait for someone to fill us up.
            // }
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
        default:
            init(creep);
            return;
    }
}

module.exports = {
    parts: parts,
    init: init,
    run: run,
};