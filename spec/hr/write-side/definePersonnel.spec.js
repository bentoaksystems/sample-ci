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

describe("Define new Personnel", () => {
    const baseBody = {
        context: 'HR',
        is_command: true,
        name: 'definePersonnel'
    };
    let rpJar, userId;
    let roles;

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

            done();
        } catch (err) {
            helpers.errorHandler.bind(this)(err);
        }
    });

    it('should add a new person with address and roles', async function (done) {
        try {
            this.done = done;
            const res = await rp({
                method: 'POST',
                uri: `${env.appAddress}/api`,
                body: Object.assign({
                    payload: {
                        person: {
                            firstname: 'new person',
                            surname: 'new person surname',
                            national_id: 1234567890,
                            title: 'f',
                            address: {
                                province: 'Zahedan',
                                city: 'Khoram abad',
                                street: 'trivial street',
                                district: 9,
                                postal_code: 83921,
                                no: 8,
                            }
                        },
                        roles: [
                            {id: roles[0].id, name: roles[0].name},
                            {id: roles[2].id, name: roles[2].name},
                        ]
                    }
                }, baseBody),
                jar: rpJar,
                json: true,
                resolveWithFullResponse: true,
            });
            expect(res.statusCode).toBe(200);

            const person_id = res.body.person_id;
            expect(person_id).toBeTruthy();
            const person = await Person.model().findOne({
                where: {id: person_id}
            });
            const address = await Address.model().findOne({
                where: {person_id}
            });
            const staff = await Staff.model().findAll({
                where: {person_id}
            });
            expect(person.firstname).toEqual('new person');
            expect(address.province).toEqual('Zahedan');
            expect(staff.length).toBe(2);

            done();
        } catch (err) {
            helpers.errorHandler.bind(this)(err);
        }
    });
});