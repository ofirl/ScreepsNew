"use strict";

function parts(energy) {
    // TODO. Scale miner upto 5 work parts.
    return [WORK, WORK, CARRY, MOVE];
}

function init(creep) {
    // Find closest unassigned source.
    let source = creep.pos.findClosestByPath(FIND_SOURCES, {
        filter: (source) => _.sum(Game.creeps, (creep) => source.id === creep.memory.sourceId) === 0
    });
    if (!source) {
        // Fallback by picking the source with lowest number of miners.
        let sources = creep.room.find(FIND_SOURCES);
        if (sources.length) {
            source = _.min(sources, (s) => _.sum(Game.creeps, (c) => s.id === c.memory.sourceId));
        }
    }
    creep.memory.sourceId = source.id;
}

function run(creep) {
    let source = Game.getObjectById(creep.memory.sourceId);
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
    }
}

module.exports = {
    parts: parts,
    init: init,
    run: run,
};
