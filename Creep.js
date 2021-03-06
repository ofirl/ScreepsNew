/**
 * Collects energy in the following priority:
 * 1) dropped energy
 * 2) miner creep
 */

Creep.prototype.collectEnergy = function () {
    // Collect energy.
    let { target, type } = this.getTargetUnion({
        energy: {
            selector: () => this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter: (resource) => resource.resourceType === RESOURCE_ENERGY && resource.amount >= this.store.getFreeCapacity(RESOURCE_ENERGY)
            }),
        },
        // miner: {
        //     selector: () => _.max(this.room.find(FIND_MY_CREEPS, {
        //         filter: (creep) => creep.memory.role === 'miner' && creep.store[RESOURCE_ENERGY] > 0
        //     }), (creep) => creep.carry.energy),
        //     // validator: (creep) => creep.carry.energy > 0,
        // },
        container: {
            selector: () => this.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.id !== this.room.memory.upgradeContainer && s.store[RESOURCE_ENERGY] > 0 && s.store[RESOURCE_ENERGY] >= this.store.getFreeCapacity(RESOURCE_ENERGY)
            }),
            // validator: s => s.store[RESOURCE_ENERGY] > 0
        },
        energy2: {
            selector: () => this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter: (resource) => resource.resourceType === RESOURCE_ENERGY
            }),
        },
        container2: {
            //         selector: () => this.pos.findClosestByPath(FIND_STRUCTURES, {
            //             filter: (i) => i.structureType == STRUCTURE_CONTAINER &&
            //                 i.store[RESOURCE_ENERGY] > 0
            //         }),
            // // validator: (creep) => creep.carry.energy > 0,
            selector: () => _.max(this.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.id !== this.room.memory.upgradeContainer && s.store[RESOURCE_ENERGY] > 0
            }), (structure) => structure.store[RESOURCE_ENERGY]),
            // validator: s => s.store[RESOURCE_ENERGY] > 0
        },
    }, 'collectFrom');

    if (target) {
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