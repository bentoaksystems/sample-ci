
const db = require('./infrastructure/db');
const Person = require('./infrastructure/db/models/person.model');
const Role = require('./infrastructure/db/models/role.model');
const User = require('./infrastructure/db/models/user.model');
const Staff = require('./infrastructure/db/models/staff.model');
const bycript = require('./utils/bcrypt')

main = async () => {

  return db.transaction(async () => {

    const person = await Person.model().create({
      firstname: 'test firstname',
      surname: 'test surname',
      national_code: '1234567899'
    });

    const role = await Role.model().create({
      name: 'test role',
    });

    const staff = await Staff.model().create({
      role_id: role.id,
      person_id: person.id
    });


    const hash = await bycript.genSalt('123456');

    await User.model().create({
      staff_id: staff.id,
      username: 'test_username',
      password: hash
    });


  });

}

db.isReady(true)
  .then(res => {
    return main()
      .then(res => {
        process.exit();
      })
      .catch(err => {
        process.exit();

      })

  })

