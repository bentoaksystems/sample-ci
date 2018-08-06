
const Address = require('../../../infrastructure/db/models/address.model');
const Person = require('../../../infrastructure/db/models/person.model');
const Staff = require('../../../infrastructure/db/models/staff.model');
const Role = require('../../../infrastructure/db/models/role.model');
const User = require('../../../infrastructure/db/models/user.model');

const db = require('../../../infrastructure/db');
const bycript = require('../../../utils/bcrypt');

const IPerson = require('../write-side/aggregates/person');

class PersonRepository {
    /**
     * QUERY RELATED REPOSOTIROES:
     */

    async showOnePersonDetails(id) {
        return Person.model().findOne({
            where: {id},
            include: [{
                model: Address.model(),
            }, {
                model: User.model(),
                attributes: [
                    'id',
                    'username',
                ]
            }, {
                model: Staff.model(),
                required: true,
                include: [{
                    model: Role.model(),
                    required: true,
                }]
            }]
        })
    };

    async searchPerson(search) {
        return Person.model().findAll({
            attributes: [
                'id',
                'firstname',
                'surname',
            ],
            include: [{
                model: Staff.model(),
                required: true,
                include: [{
                    model: Role.model(),
                    required: true,
                    attributes: [
                        'name',
                    ],
                    where: {
                        name: {
                            $like: `${search.role}%`
                        }
                    }
                }],
            }, {
                model: User.model(),
                attributes: [
                    'username',
                ]
            }],
            limit: search.limit,
            offset: search.offset,
            subQuery: false,
            where: db.sequelize().where(
                db.sequelize().fn("concat", db.sequelize().col("firstname"), ' ', db.sequelize().col("surname")),
                {
                    ilike: `%${search.name}%`
                }
            )
        })
    }


    /** COMMAND RELATED REPOSITORIES:
     * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IPerson())
     * e.g: IPerson  = require ('../write-side/aggregates/person.js')
     * 
     * **/

    async getById(person_id) {
        const person = await Person.model().findById(person_id);
        return new IPerson(person ? person.id : person_id);
    };

    async personCreated(person_info, pid) {
        if (!pid) {
            let person = await Person.model().create(person_info);
            pid = person.id;
        } else {
            // person_info['id'] = pid;
            await Person.model().update(person_info, {
                where: {id: pid}
            });
        }
        return Promise.resolve(pid);
    };

    async addressAssignedToPerson(address, person_id) {
        // Used to work, but now it doesn't !!!
        // let newAddress = await Address.model()
        //     .findOrCreate({
        //         where: address,
        //         defaults: {person_id}
        //     })
        //     .spread((newAddress, created) => {
        //         if (created)
        //             return Promise.resolve(newAddress);

        //         return newAddress.update(address, {
        //             where: {id: newAddress.id}
        //         });
        //     });
        // return Promise.resolve(newAddress.get({plain: true}));
        let newAddress = await Address.model().findAll({
            where: {person_id}
        });
        newAddress = newAddress[0];
        if (!newAddress) {
            Object.assign(address, {person_id});
            newAddress = await Address.model().create(address);
        }
        else
            newAddress = await Address.model().update(address, {
                where: {id: newAddress.id}
            });
        return Promise.resolve(newAddress);
    };

    async personRolesRemoved(person_id) {
        return Staff.model().destroy({where: {person_id}});
    };

    async personRolesAssigned(roles, person_id) {
        // looks for user_id
        const staff = await Staff.model().findOne({where: {person_id}});

        let newData = [];
        roles.forEach(role => newData.push({role_id: role.id, person_id}));
        return Staff.model().bulkCreate(newData);
    };

    async userAssignedToStaff(user_info, person_id) {
        user_info.password = await bycript.genSalt(user_info.password);
        const obj = Object.assign(user_info, {person_id});

        if (!obj.id) {
            let user = await User.model().create(obj);
            obj.id = user.id;
        } else {
            await User.model().update(obj, {
                where: {id: obj.id}
            });
        }

        return Promise.resolve(obj.id);
    };

    async personRemoved(id) {
        // because its onDelete is set to 'cascade', this removes
        // the person and everything that's their belonging, i.e.
        // their addresses, their staffs, and their probable user
        return Person.model().destroy({where: {id}});
    };
};

module.exports = PersonRepository;