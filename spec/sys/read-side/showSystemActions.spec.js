const db = require('../../../infrastructure/db');
const rp = require('request-promise');
const env = require('../../../env');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const Action = require('../../../infrastructure/db/models/action.model');

describe('show systems actions', () => {
  const actionsArr = [
    { name: 'A', context: 'CapitalLetters' },
    { name: 'B', context: 'CapitalLetters' },
    { name: 'C', context: 'CapitalLetters' },
    { name: 'a', context: 'LowercaseLetter' },
    { name: 'b', context: 'LowercaseLetter' },
    { name: 'c', context: 'LowercaseLetter' }
  ];

  let rpJar, userId;
  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);
    userId = result.userId;
    rpJar = result.rpJar;
    done();
  });

  it('expect return all actions in systems', async function(done) {
    await Action.model().bulkCreate(actionsArr);
    try {
      this.done = done;
      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: false,
          name: 'showSystemActions',
          payload: {}
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true
      });
      expect(res.statusCode).toBe(200);
      const actions = await Action.model().findAll({ raw: true });
      expect(actions.length).toBe(res.body.length);
      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });
});
