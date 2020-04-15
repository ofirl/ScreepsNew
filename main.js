require('memory');
require('target');
require('Room');
require('Creep');

const creepRoles = {
    miner: require('creepRole.miner'),
    upgrader: require('creepRole.upgrader'),
    transport: require('creepRole.transport'),
};

const roomControllers = {
    base: require('roomController.base'),
};

/**
 * 
 * @param {Room} creep 
 */
function getRole(creep) {
    if (!creep.memory.role) {
        console.log('Creep ' + creep.name + ' is missing role');
        return;
    }
    if (creep.memory.role in creepRoles) {
        return creepRoles[creep.memory.role];
    } else {
        console.log('Missing role ' + creep.memory.role);
    }
}

module.exports.loop = function () {
    // Cleanup memory.
    // This doesn't need to be done every tick, but for starting purpose clear memory each tick for debugging purposes.
    GCCreepMemory();
    GCStructureMemory();

    // Visualize spawn.
    for (let name in Game.spawns) {
        let spawn = Game.spawns[name];
        if (spawn.spawning) {
            let spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                spawn.pos.x + 1,
                spawn.pos.y,
                {align: 'left', opacity: 0.8});
        }
    }

    // Control rooms.
    for (let name in Game.rooms) {
        let room = Game.rooms[name];
        let roomController = false;
        if (room.memory.controller) {
            roomController = roomControllers[room.memory.controller];
        }
        if (!roomController) {
            roomController = roomControllers.base;
        }
        roomController.run(room, creepRoles);
    }

    // Control creeps.
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        let role = getRole(creep);
        if (!role) {
            continue;
        }
        if (creep.spawning) {
            // Creep is still spawning.
            if (!creep.memory.init) {
                if (role.init) {
                    role.init(creep);
                }
                creep.memory.init = true;
            }
        } else {
            role.run(creep);
        }
    }
};