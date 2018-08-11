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
                    no: 2,
                    remain_address: 'Some str, some alley, ...',
                    person_id: persons[0].id,
                }, {
                    province: 'Karaj',
                    city: 'Kar',
                    street: 'meydane asli',
                    district: 1,
                    postal_code: 98765,
                    no: 3,
                    remain_address: 'main street',
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

    it('should search for all the personnel', async function (done) {
        try {
            this.done = done;
            const res = await rp({
                method: 'POST',
                uri: `${env.appAddress}/api`,
                body: Object.assign({
                    payload: {
                        name: '',
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

            expect(res.body.count).toBe(2);
            const personnel = res.body.data;
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

    it('should search for the personnel with offset and not return admin', async function (done) {
        try {
            this.done = done;
            const res = await rp({
                method: 'POST',
                uri: `${env.appAddress}/api`,
                body: Object.assign({
                    payload: {
                        name: '',
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

            expect(res.body.count).toBe(2);
            const personnel = res.body.data;
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

    it('should search for the personnel with offset and limit', async function (done) {
        try {
            this.done = done;

            const p = await Person.model().bulkCreate([
                {firstname: '1', surname: '2', national_code: 1233211234, title: 'm'},
                {firstname: '2', surname: '3', national_code: 1231354363, title: 'f'},
                {firstname: '3', surname: '4', national_code: 2413253453, title: 'm'},
                {firstname: '4', surname: '5', national_code: 2356765742, title: 'm'},
            ]);
            const s = await Staff.model().bulkCreate([
                {person_id: p[0].id, role_id: roles[1].id},
                {person_id: p[0].id, role_id: roles[2].id},
                {person_id: p[1].id, role_id: roles[1].id},
                {person_id: p[2].id, role_id: roles[1].id},
                {person_id: p[3].id, role_id: roles[1].id},
            ]);

            const res = await rp({
                method: 'POST',
                uri: `${env.appAddress}/api`,
                body: Object.assign({
                    payload: {
                        name: '',
                        role: '',
                        offset: 3,
                        limit: 3,
                    }
                }, baseBody),
                jar: rpJar,
                json: true,
                resolveWithFullResponse: true,
            });
            expect(res.statusCode).toBe(200);
            expect(res.body.count).toBe(6);
            const personnel = res.body.data;
            expect(personnel.length).toBe(3);
            expect(personnel[0].firstname).toEqual('4');
            expect(personnel[1].firstname).toEqual('ali');
            expect(personnel[2].firstname).toEqual('reza');
            expect(personnel[0].roles[0]).toEqual(roles[1].name);
            expect(personnel[1].roles[1]).toEqual(roles[1].name);
            expect(personnel[2].roles[0]).toEqual(roles[1].name);
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

            const personnel = res.body.data;
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
            expect(res.body.count).toBe(2);
            const personnel = res.body.data;
            expect(personnel.length).toBe(2);
            expect(personnel[0].roles).toContain(roles[1].name);
            expect(personnel[1].roles).toContain(roles[1].name);

            done();
        } catch (err) {
            helpers.errorHandler.bind(this)(err);
        }
    });

    it('should pass a real world search example with all constraints applied', async done => {
        try {
            this.done = done;
            
            const p = await Person.model().bulkCreate([
                {firstname: 'ali reza', surname: 'mahdavi',     national_code: 3129583930, title: 'm'},
                {firstname: 'ali 2',    surname: 'mohammad',    national_code: 3424234432, title: 'm'},
                {firstname: 'alie',     surname: 'rezaii',      national_code: 2434234235, title: 'f'}, // NURSE
                {firstname: 'mahmood',  surname: 'ali rezaii',  national_code: 5463562453, title: 'm'}, // NURSE
                {firstname: 'ahmad',    surname: 'ali ahmadi',  national_code: 5663562453, title: 'm'},
                {firstname: 'ali hasan',surname: 'mangooli',    national_code: 5663562454, title: 'm'},

                {firstname: 'ali 3',    surname: 'hessam',      national_code: 5665462454, title: 'm'}, // Patient
            ]);
            const r = await Role.model().bulkCreate([
                {name: 'Doctor 1'},
                {name: 'Doctor 2'},

                {name: 'Nurse 3'}
            ]);
            const s = await Staff.model().bulkCreate([
                {person_id: p[0].id, role_id: r[0].id},
                {person_id: p[1].id, role_id: r[0].id},
                {person_id: p[4].id, role_id: r[1].id},
                {person_id: p[5].id, role_id: r[1].id},

                {person_id: p[0].id, role_id: roles[0].id},
                {person_id: p[3].id, role_id: roles[0].id},
                {person_id: p[2].id, role_id: r[2].id},
                {person_id: p[3].id, role_id: r[2].id},
            ]);

            const res = await rp({
                method: 'POST',
                uri: `${env.appAddress}/api`,
                body: Object.assign({
                    payload: {
                        name: 'ali',
                        role: 'Doc',
                        offset: 1,
                        limit: 3,
                    }
                }, baseBody),
                jar: rpJar,
                json: true,
                resolveWithFullResponse: true,
            });
            expect(res.statusCode).toBe(200);
            expect(res.body.count).toBe(5);

            const personnel = res.body.data;
            expect(personnel.length).toBe(3);
            expect(personnel[0].firstname).toEqual('ali');
            expect(personnel[1].firstname).toEqual('ali 2');
            expect(personnel[2].firstname).toEqual('ali hasan');
            done();
        } catch (err) {
            helpers.errorHandler.bind(this)(err);
        }
    })
})