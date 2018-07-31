const rp = require('request-promise');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');
const Role = require('../../../infrastructure/db/models/role.model');
const Page = require('../../../infrastructure/db/models/page.model');
const PageRole = require('../../../infrastructure/db/models/page_role.model');



describe("Deny page access of role", () => {

  let rpJar, userId;
  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);
    userId = result.userId;
    rpJar = result.rpJar;
    done();
  });

  it("admin must be able to deny a page access of a role", async function (done) {

    try {
      this.done = done
      const role = await Role.model().create({name: 'test role'});
      const page = await Page.model().create({name: 'test page', url: 'test url'})
      pageRole = await PageRole.model().create({page_id: page.id, role_id: role.id});

      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: true,
          name: 'denyPageAccess',
          payload: {
            id: pageRole.id,
            roleId: role.id
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true
      })
      expect(res.statusCode).toBe(200);

      pageRole = await PageRole.model().find({
        where: {
          id: pageRole.id
        }
      });
      expect(pageRole).toBeNull();
      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  })

  it("expect error on deny page access without roleId", async function (done) {

    try {
      this.done = done
      const role = await Role.model().create({name: 'test role'});
      const page = await Page.model().create({name: 'test page', url: 'test url'})
      pageRole = await PageRole.model().create({page_id: page.id, role_id: role.id});

      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: true,
          name: 'denyPageAccess',
          payload: {
            // roleId: ...
            id: pageRole.id
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true
      })
      this.fail('admin can deny page access without specifing id');
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  })

  it("expect error on deny page access without id", async function (done) {

    try {
      this.done = done

      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: true,
          name: 'denyPageAccess',
          payload: {
            // id: ...
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true
      })
      this.fail('admin can deny page access without specifing id');
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  })

});
