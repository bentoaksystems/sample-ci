
const rp = require('request-promise');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');
const Role = require('../../../infrastructure/db/models/role.model');

describe("Show a List of Roles", () => {
    const baseBody = {
        context: 'HR',
        is_command: false,
        name: 'showRoleList'
    };
    let rpJar, userId, roles;

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

    it('should show a list of all roles', async function (done) {
        try {
            this.done = done;
            const res = await rp({
                method: 'POST',
                uri: `${env.appAddress}/api`,
                body: Object.assign({
                    payload: {}
                }, baseBody),
                jar: rpJar,
                json: true,
                resolveWithFullResponse: true,
            });
            expect(res.statusCode).toBe(200);

            const body = res.body;
            expect(body.length).toBe(4);
            expect(body[1].id).toEqual(roles[0].id);
            expect(body[1].name).toEqual(roles[0].name);

            done();
        } catch (err) {
            helpers.errorHandler.bind(this)(err);
        }
    });
});