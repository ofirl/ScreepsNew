/**
 * Collects energy in the following priority:
 * 1) dropped energy
 * 2) miner creep
 */

Creep.prototype.collectEnergy = function () {
    // Collect energy.
    let {target, type} = this.getTargetUnion({
        energy: {
            selector: () => this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter: (resource) => resource.resourceType === RESOURCE_ENERGY && resource.amount >= this.store.getFreeCapacity[RESOURCE_ENERGY]
            }),
        },
        energy2: {
            selector: () => _.max(this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter: (resource) => resource.resourceType === RESOURCE_ENERGY
            }), 'amount'),
        },
        miner: {
            selector: () => _.max(this.room.find(FIND_MY_CREEPS, {
                filter: (creep) => creep.memory.role === 'miner' && creep.carry.energy > 0
            }), (creep) => creep.carry.energy),
            validator: (creep) => creep.carry.energy > 0,
        },
    }, 'collectFrom');
    if (target) {
        switch (type) {
            case 'energy':
            case 'energy2': {
                if (this.pickup(target) === ERR_NOT_IN_RANGE) {
                    this.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                break;
            }
            case 'miner': {
                if (target.transfer(this) === ERR_NOT_IN_RANGE) {
                    this.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                break;
            }
        }
    }
};