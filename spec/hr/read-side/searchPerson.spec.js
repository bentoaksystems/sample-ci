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

describe("Search For Personnel", () => {
    const baseBody = {
        context: 'HR',
        is_command: false,
        name: 'searchPersonnel'
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
                    postal_code: 1234567890,
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
                {role_id: roles[2].id, person_id: persons[0].id},
                {role_id: roles[1].id, person_id: persons[1].id},
            ]);

            done();
        } catch (err) {
            helpers.errorHandler.bind(this)(err);
        }
    });

    it('should search for all the personnel with desired information', async function (done) {
        try {
            this.done = done;
            const res = await rp({
                method: 'POST',
                uri: `${env.appAddress}/api`,
                body: Object.assign({
                    payload: {
                        name: '',
                        role: '',
                        offset: 1, // exclude admin
                        limit: 8,
                    }
                }, baseBody),
                jar: rpJar,
                json: true,
                resolveWithFullResponse: true,
            });
            expect(res.statusCode).toBe(200);

            const personnel = res.body;
            expect(personnel.length).toBe(2);
            expect(personnel[0].roles[0]).toEqual(roles[0].name);
            expect(personnel[0].roles[1]).toEqual(roles[1].name);
            expect(personnel[0].roles[2]).toEqual(roles[2].name);
            expect(personnel[1].roles[0]).toEqual(roles[1].name);
            expect(personnel[0].username).toEqual(user.username);
            expect(personnel[1].username).toBeFalsy();
            done();
        } catch (err) {
            helpers.errorHandler.bind(this)(err);
        }
    });

    it('should search the personnel by their name', async function (done) {
        try {
            this.done = done;
            const res = await rp({
                method: 'POST',
                uri: `${env.appAddress}/api`,
                body: Object.assign({
                    payload: {
                        name: 'al',
                        role: '',
                        offset: 0,
                        limit: 8,
                    }
                }, baseBody),
                jar: rpJar,
                json: true,
                resolveWithFullResponse: true,
            });
            expect(res.statusCode).toBe(200);

            const personnel = res.body;
            expect(personnel.length).toBe(1);
            expect(personnel[0].firstname).toBe(persons[0].firstname);
            done();
        } catch (err) {
            helpers.errorHandler.bind(this)(err);
        }
    });

    it('should search personnel by their roles', async function (done) {
        try {
            this.done = done;
            const res = await rp({
                method: 'POST',
                uri: `${env.appAddress}/api`,
                body: Object.assign({
                    payload: {
                        name: '',
                        role: 'Doc',
                        offset: 0,
                        limit: 8,
                    }
                }, baseBody),
                jar: rpJar,
                json: true,
                resolveWithFullResponse: true,
            });
            expect(res.statusCode).toBe(200);

            const personnel = res.body;
            expect(personnel.length).toBe(2);
            expect(personnel[0].roles).toContain(roles[1].name);
            expect(personnel[1].roles).toContain(roles[1].name);

            done();
        } catch (err) {
            helpers.errorHandler.bind(this)(err);
        }
    })
})