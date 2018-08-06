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

describe("Show One Person Details", () => {
    const baseBody = {
        context: 'HR',
        is_command: false,
        name: 'showOnePerson'
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
                    no: 2,
                    complete_address: 'Some str, some alley, ...',
                    person_id: persons[0].id,
                }, {
                    province: 'Karaj',
                    city: 'Kar',
                    street: 'meydane asli',
                    district: 1,
                    postal_code: 98765,
                    no: 3,
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
                {role_id: roles[2].id, person_id: persons[0].id},
                {role_id: roles[1].id, person_id: persons[1].id},
            ]);

            done();
        } catch (err) {
            helpers.errorHandler.bind(this)(err);
        }
    });

    it('should receive a person\'s complete information', async function (done) {
        try {
            this.done = done;
            const res = await rp({
                method: 'POST',
                uri: `${env.appAddress}/api`,
                body: Object.assign({
                    payload: {
                        person_id: persons[0].id
                    }
                }, baseBody),
                jar: rpJar,
                json: true,
                resolveWithFullResponse: true,
            });
            expect(res.statusCode).toBe(200);

            const person = res.body;
            expect(person.id).toEqual(persons[0].id);
            expect(person.firstname).toEqual(persons[0].firstname);
            expect(person.addresses.id).toEqual(addresses[0].id);
            expect(person.addresses.province).toEqual(addresses[0].province);
            expect(person.addresses.person_id).toEqual(addresses[0].person_id);
            expect(person.user.id).toEqual(user.id);
            expect(person.user.username).toEqual(user.username);
            expect(person.roles.length).toBe(3);
            expect(person.roles[0].id).toEqual(roles[0].id);
            expect(person.roles[1].id).toEqual(roles[1].id);
            expect(person.roles[2].id).toEqual(roles[2].id);

            done();
        } catch (err) {
            helpers.errorHandler.bind(this)(err);
        }
    });

    it('should receive a \'userless\' person\'s complete information', async function (done) {
        try {
            this.done = done;
            const res = await rp({
                method: 'POST',
                uri: `${env.appAddress}/api`,
                body: Object.assign({
                    payload: {
                        person_id: persons[1].id
                    }
                }, baseBody),
                jar: rpJar,
                json: true,
                resolveWithFullResponse: true,
            });
            expect(res.statusCode).toBe(200);

            const person = res.body;
            expect(person.id).toEqual(persons[1].id);
            expect(person.firstname).toEqual(persons[1].firstname);
            expect(person.addresses.id).toEqual(addresses[1].id);
            expect(person.addresses.province).toEqual(addresses[1].province);
            expect(person.addresses.person_id).toEqual(addresses[1].person_id);
            expect(person.user).toBeFalsy();
            expect(person.roles.length).toBe(1);
            expect(person.roles[0].id).toEqual(roles[1].id);

            done();
        } catch (err) {
            helpers.errorHandler.bind(this)(err);
        }
    });
});