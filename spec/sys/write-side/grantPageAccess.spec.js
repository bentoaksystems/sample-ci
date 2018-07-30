const rp = require('request-promise');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');
const Role = require('../../../infrastructure/db/models/role.model');
const Page = require('../../../infrastructure/db/models/page.model');
const PageRole = require('../../../infrastructure/db/models/page_role.model');



describe("Grant page access to role", () => {

  let rpJar, userId;
  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);
    userId = result.userId;
    rpJar = result.rpJar;
    done();
  });

  it("admin must be able to grant a page access to a role by page id", async function (done) {

    try {
      this.done = done
      const role = await Role.model().create({name: 'test role'});
      const page = await Page.model().create({name: 'test page', url: 'test url'})

      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: true,
          name: 'grantPageAccess',
          payload: {
            roleId: role.id,
            pageId: page.id
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true
      })
      expect(res.statusCode).toBe(200);

      const pageRole = (await PageRole.model().find({
        where: {
          role_id: role.id,
        }
      })).get({plain: true});
      expect(pageRole.access).toBeNull();
      expect(pageRole.page_id).toBe(page.id);
      expect(pageRole.role_id).toBe(role.id);
      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  })

  it("admin must be able to grant a page access to a role by written access", async function (done) {

    try {
      this.done = done
      const role = await Role.model().create({name: 'test role'});

      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: true,
          name: 'grantPageAccess',
          payload: {
            roleId: role.id,
            access: '/hr/*'
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true
      })
      expect(res.statusCode).toBe(200);

      const pageRole = (await PageRole.model().find({
        where: {
          role_id: role.id
        }
      })).get({plain: true});
      expect(pageRole.page_id).toBeNull();
      expect(pageRole.access).toBe('/hr/*');
      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  })

  

});
