function run(tower) {
    let hostiles = tower.room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
        let username = hostiles[0].owner.username;
        Game.notify(`User ${username} spotted in room ${roomName}`);
        // var towers = Game.rooms[roomName].find(
        //     FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        tower.attack(hostiles[0]);
    }
};

module.exports = {
    run
};