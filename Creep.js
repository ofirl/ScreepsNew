/**
 * Collects energy in the following priority:
 * 1) dropped energy
 * 2) miner creep
 */

Creep.prototype.collectEnergy = function () {
    // Collect energy.
    let targetU;
    if (this.memory.collectFrom) {
        targetU = this.memory.collectFrom;
        targetU.target = Game.getObjectById(targetU.target);
        if (!targetU.target)
            delete this.memory.collectFrom;
    }
    else
        targetU = this.getTargetUnion({
            energy: {
                selector: () => this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                    filter: (resource) => resource.resourceType === RESOURCE_ENERGY && resource.amount >= this.store.getFreeCapacity[RESOURCE_ENERGY]
                }),
            },
            energy2: {
                selector: () => this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                    filter: (resource) => resource.resourceType === RESOURCE_ENERGY
                }),
            },
            // miner: {
            //     selector: () => _.max(this.room.find(FIND_MY_CREEPS, {
            //         filter: (creep) => creep.memory.role === 'miner' && creep.store[RESOURCE_ENERGY] > 0
            //     }), (creep) => creep.carry.energy),
            //     // validator: (creep) => creep.carry.energy > 0,
            // },
            container: {
                selector: () => this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (structure) => structure.structureType === STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] >= this.store.getFreeCapacity[RESOURCE_ENERGY]
                }),
                // validator: (creep) => creep.carry.energy > 0,
            },
            container2: {
                selector: () => _.max(this.room.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => structure.structureType === STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0
                }), (structure) => structure.store[RESOURCE_ENERGY]),
                // validator: (creep) => creep.carry.energy > 0,
            },
        }, 'collectFrom');
    if (targetU.target) {
        this.memory.collectFrom = { target: target.id, type: targetU.type };
        let { target, type } = targetU;
        switch (type) {
            case 'energy':
            case 'energy2':
                if (this.pickup(target) === ERR_NOT_IN_RANGE) {
                    this.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
                break;
            case 'miner':
                if (target.transfer(this) === ERR_NOT_IN_RANGE) {
                    this.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
                break;
            case 'container':
            case 'container2':
                if (this.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.moveTo(target);
                }
                break;
        }
    }
};