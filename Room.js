"use strict";

Room.prototype.findCreepsWithRule = function(rule) {
    return this.find(FIND_MY_CREEPS, {
        filter: (creep) => creep.memory.rule === rule
    });
};

Room.prototype.findAvailableSpawns = function() {
    return this.find(FIND_MY_SPAWNS, {
       filter: (spawn) => !spawn.spawning
    });
};
