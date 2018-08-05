const rp = require('request-promise');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');

const Address = require('../../../infrastructure/db/models/address.model');
const Person = require('../../../infrastructure/db/models/person.model');
const Role = require('../../../infrastructure/db/models/role.model');
const User = require('../../../infrastructure/db/models/user.model');
const Staff = require('../../../infrastructure/db/models/staff.model');

describe("Assign Roles to a Person", () => {
    const baseBody = {
        context: 'HR',
        is_command: true,
        name: 'assignUserToPerson'
    };
    let rpJar, userId;
    let roles, persons, addresses, staff, user;

    beforeEach(async done => {
        try {
            await db.isReady(true);
            const result = await dbHelper.addAndLoginUser(true);
            userId = result.userId;
            rpJar = result.rpJar;

            roles = await Role.model().bulkCreate([
                {name: 'Nurse'},
                {name: 'Doctor'},
                {name: 'Reception'}
            ]);
            persons = await Person.model().bulkCreate([
                {
                    firstname: 'ali',
                    surname: 'gholi',
                    national_code: 1212121212,
                    title: 'm'
                }, {
                    firstname: 'reza',
                    surname: 'ahmadi',
                    national_code: 3213213213,
                    title: 'm',
                }
            ]);
            addresses = await Address.model().bulkCreate([
                {
                    province: 'Tehran',
                    city: 'Teh',
                    street: 'baharestan',
                    district: 12,
                    postal_code: 12345,
                    unit: 2,
                    complete_address: 'Some str, some alley, ...',
                    person_id: persons[0].id,
                }, {
                    province: 'Karaj',
                    city: 'Kar',
                    street: 'meydane asli',
                    district: 1,
                    postal_code: 98765,
                    unit: 3,
                    complete_address: 'main street',
                    person_id: persons[1].id,
                }
            ]);
            user = await User.model().create({
                username: 'ali@gholi',
                password: 'gholi@ali',
                person_id: persons[0].id
            });
            staff = await Staff.model().bulkCreate([
                {role_id: roles[0].id, person_id: persons[0].id},
                {role_id: roles[1].id, person_id: persons[0].id},
            ]);

            done();
        } catch (err) {
            helpers.errorHandler.bind(this)(err);
        }
    });

    it('should assign a new user to a person', async function (done) {
        try {
            this.done = done;
            const res = await rp({
                method: 'POST',
                uri: `${env.appAddress}/api`,
                body: Object.assign({
                    payload: {
                        person_id: persons[1].id,
                        username: 'new user',
                        password: 'P@$$\/\/0R|D'
                    }
                }, baseBody),
                jar: rpJar,
                json: true,
                resolveWithFullResponse: true,
            });
            expect(res.statusCode).toBe(200);

            let createdUser = await User.model().findAll({
                where: {person_id: persons[1].id}
            });
            expect(createdUser.length).toBe(1);
            expect(createdUser[0].person_id).toEqual(persons[1].id);
            expect(createdUser[0].username).toEqual('new user');
            expect(createdUser[0].password).not.toEqual('P@$$\/\/0R|D'); // must be hashed

            done();
        } catch (err) {
            helpers.errorHandler.bind(this)(err);
        }
    });

    it('should update already-set-user for a person', async function (done) {
        try {
            this.done = done;
            const res = await rp({
                method: 'POST',
                uri: `${env.appAddress}/api`,
                body: Object.assign({
                    payload: {
                        person_id: persons[0].id,
                        id: user.id,
                        username: 'newly set username',
                        password: 'P@$$\/\/0R|D'
                    }
                }, baseBody),
                jar: rpJar,
                json: true,
                resolveWithFullResponse: true,
            });
            expect(res.statusCode).toBe(200);

            let createdUser = await User.model().findAll({
                where: {person_id: persons[0].id}
            });
            expect(createdUser.length).toBe(1);
            expect(createdUser[0].person_id).toEqual(persons[0].id);
            expect(createdUser[0].username).not.toEqual('ali@gholi');
            expect(createdUser[0].username).toEqual('newly set username');
            expect(createdUser[0].password).not.toEqual('P@$$\/\/0R|D');

            done();
        } catch (err) {
            helpers.errorHandler.bind(this)(err);
        }
    });
});