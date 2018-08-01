const rp = require('request-promise');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');

xdescribe('Get list of all patient', () => {
  beforeEach(async done => {
    await db.isReady(true);
    await dbHelper.addAdmin();
    done();
  });

  it('should get list of all patient', async function(done) {
    try {
      this.done = done;
      const res = await rp({
        method: 'post',
        body: {
          context: 'reception',
          is_command: false,
          name: 'showPatientList',
          payload: {
            name: '',
            phone_number: '',
            mobile_number: '',
            patient_type_id: '',
          }
        },
      })
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });
})