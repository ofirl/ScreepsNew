function run(tower) {
    let hostiles = tower.room.find(FIND_HOSTILE_CREEPS);
    console.log(hostiles ? 'no hostiles' : hostiles.length);
    if (hostiles.length > 0) {
        let username = hostiles[0].owner.username;
        Game.notify(`User ${username} spotted in room ${tower.room.name}`);
        tower.attack(hostiles[0]);
    }
};

module.exports = {
    run
};