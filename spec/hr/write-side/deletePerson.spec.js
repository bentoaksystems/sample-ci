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

describe("Delete Person Complete Information", () => {
    const baseBody = {
        context: 'HR',
        is_command: true,
        name: 'deletePerson'
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
            ]);

            done();
        } catch (err) {
            helpers.errorHandler.bind(this)(err);
        }
    });

    it('should remove a person and everything related to them', async function (done) {
        try {
            this.done = done;
            const person_id = persons[0].id;
            const res = await rp({
                method: 'POST',
                uri: `${env.appAddress}/api`,
                body: Object.assign({
                    payload: {person_id}
                }, baseBody),
                jar: rpJar,
                json: true,
                resolveWithFullResponse: true,
            });
            expect(res.statusCode).toBe(200);

            const deletedPerson = await Person.model().findAll({where: {id: person_id}});
            const deletedStaff = await Staff.model().findAll({where: {person_id}});
            const deletedUser = await User.model().findAll({where: {person_id}});
            const deletedAddress = await Address.model().findAll({where: {person_id}});
            expect(deletedPerson.length).toBe(0);
            expect(deletedStaff.length).toBe(0);
            expect(deletedUser.length).toBe(0);
            expect(deletedAddress.length).toBe(0);

            done();
        } catch (err) {
            helpers.errorHandler.bind(this)(err);
        }
    });
});