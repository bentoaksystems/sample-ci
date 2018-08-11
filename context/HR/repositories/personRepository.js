
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
        /** IMPORTANT NOTE FOR SEQUELIZE QUERIES: 
        process of Limiting, Offsetting and Counting might
        need the usage of separate, subQuery and distinct
        in the right place for the query to work correctly
        otherwise, it MIGHT BREAK at some test cases !!!
        And sometimes we have to stick to the raw queries!

        'subQuery: false' must be provided because otherwise
        an error will be thrown saying "... FROM-clause ..."!

        'separate: true' should be in a hasMany relation,
        and if not provided, the limit will affect the
        number of the included model too! (and vice versa)

        'distinct: true' should be provided for findAndCountAll
        so that the count doesn't affect the included model!
        */

        let count = 0, rows = [];
        await db.sequelize().query(`
            SELECT
                COUNT (DISTINCT("person"."id")) AS "count"
            FROM
                "person" AS "person"
            INNER JOIN "staff" AS "staffs" ON "person"."id" = "staffs"."person_id"
            INNER JOIN "role" AS "staffs->role" ON "staffs"."role_id" = "staffs->role"."id"
            AND "staffs->role"."name" ILIKE ?
            LEFT OUTER JOIN "user" AS "user" ON "person"."id" = "user"."person_id"
            WHERE
                concat ("firstname", ' ', "surname") ILIKE ?
            AND
                "firstname" <> 'Admin';`,
            {
                replacements: [
                    search.role + '%',
                    '%' + search.name + '%'
                ],
                type: db.sequelize().QueryTypes.SELECT
            }
        ).spread(function (results) {
            count = +results['count'];
        });

        await db.sequelize().query(`
            SELECT DISTINCT
                "person"."id",
                "person"."firstname",
                "person"."surname",
                "user"."id" AS "user.id",
                "user"."username" AS "user.username"
            FROM
                "person" AS "person"
            LEFT OUTER JOIN "user" AS "user" ON "person"."id" = "user"."person_id"
            INNER JOIN "staff" AS "staffs" ON "person"."id" = "staffs"."person_id"
            INNER JOIN "role" AS "staffs->role" ON "staffs"."role_id" = "staffs->role"."id"
            AND "staffs->role"."name" ILIKE ?
            WHERE
                concat ("firstname", ' ', "surname") ILIKE ?
            AND
                "firstname" <> 'Admin'
            ORDER BY
                "firstname"
            LIMIT ? OFFSET ?;`,
            {
                replacements: [
                    search.role + '%',
                    '%' + search.name + '%',
                    search.limit || 10,
                    search.offset || 0,
                ],
                type: db.sequelize().QueryTypes.SELECT
            }
        ).then(results => {
            results.forEach(res => {
                if (res['firstname'] === 'Admin')
                    return;
                rows.push({
                    person_id: res['id'],
                    firstname: res['firstname'],
                    surname: res['surname'],
                    roles: [],
                    username: res['user.username'] || null,
                });
            });
        });

        await db.sequelize().query(`
            SELECT
                "staff"."id",
                "staff"."role_id",
                "staff"."person_id",
                "role"."id" AS "role.id",
                "role"."name" AS "role.name"
            FROM
                "staff" AS "staff"
            INNER JOIN "role" AS "role" ON "staff"."role_id" = "role"."id"
            AND "role"."name" ILIKE ?
            WHERE
                "staff"."person_id" IN (?);`,
            {
                replacements: [
                    search.role + '%',
                    rows.map(el => el['person_id']),
                ],
                type: db.sequelize().QueryTypes.SELECT
            }
        ).then(results => {
            results.forEach(role => {
                rows.forEach(person => {
                    if (person['person_id'] == role['person_id'])
                        person['roles'].push(role['role.name']);
                });
            });
        });

        return Promise.resolve({count, rows});
    }


    /** COMMAND RELATED REPOSITORIES:
     * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IPerson())
     * e.g: IPerson  = require ('../write-side/aggregates/person.js')
     * 
     * **/

    async findOrCreatePerson(person_id) {
        const person = await Person.model().findById(person_id);
        return new IPerson(person ? person.id : person_id);
    };

    async createOrUpdatePerson(person_info, pid) {
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

    async assignAddressToPerson(address, person_id) {
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
        let newAddress = await Address.model().findOne({
            where: {person_id}
        });
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

    async removePersonRoles(person_id) {
        return Staff.model().destroy({where: {person_id}});
    };

    async assignPersonRoles(roles, person_id) {
        // looks for user_id
        const staff = await Staff.model().findOne({where: {person_id}});

        let newData = [];
        roles.forEach(role => newData.push({role_id: role.id, person_id}));
        return Staff.model().bulkCreate(newData);
    };

    async assignUserToStaff(user_info, person_id) {
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

    async removePerson(id) {
        // because its onDelete is set to 'cascade', this removes
        // the person and everything that's their belonging, i.e.
        // their addresses, their staffs, and their probable user
        let p = await Person.model().findOne({
            where: {id}
        });
        if (p['firstname'] === 'Admin')
            throw new Error('Admin can not be deleted!');
        return Person.model().destroy({where: {id}});
    };
};

module.exports = PersonRepository;