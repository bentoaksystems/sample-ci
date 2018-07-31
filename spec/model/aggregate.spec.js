const db = require('../../infrastructure/db');
const _User = require('../../infrastructure/db/models/user.model')
const helpers = require('../../utils/helpers');

const BaseAggregate = require('../../utils/base-aggregate');
const BaseCommand = require('../../utils/base-command');


class UserRepository {

  async getIUserById(id) {

    // console.log('-> ', UserRepository.Users);
    let iuser = UserRepository.Users.find(x => x.id === id)
    if (iuser)
      return iuser;

    const user = await _User.model().find({
      where: {id}
    });

    iuser = new User(user.id, user.username);
    UserRepository.Users.push(iuser);

    return iuser;
  }

  async updateUser(id, username) {

    const user = await _User.model().findOne({
      where: {id}
    });

    user.username = username;

    return user.save();
  }

}

UserRepository.Users = [];

class User extends BaseAggregate {

  constructor(id, username) {
    super();
    this.id = id;
    this.username = username;
  }

  async instanceAction(username) {
    this.username = username;

    const userRepository = new UserRepository();
    return userRepository.updateUser(this.id, this.username);
  }

  async lazyAction(username) {
    return this.lazy(async () => {

      this.username = username;

      const userRepository = new UserRepository();
      return userRepository.updateUser(this.id, this.username);
    })
  }

  lazy(cb) {
    return new Promise((resolve, reject) => {

      setTimeout(() => {
        cb()
          .then(res => {
            resolve();
          }).catch(err => {
            console.error('-> ', err);
            reject(err);
          })

      }, 3000)

    })
  }

}


class InstanceCommand extends BaseCommand {

  constructor() {
    super();
  }

  async execut(payload, user) {
    try {

      const repo = new UserRepository();
      const user = await repo.getIUserById(payload.userId);

      return super.execut(user, UserRepository.Users, async (editingUser) => {
        return editingUser.instanceAction(payload.username)
      });

    } catch (err) {
      throw err;
    }
  }

}


class LazyCommand extends BaseCommand {

  constructor() {
    super();
  }

  async execut(payload, user) {
    try {

      const repo = new UserRepository();
      const user = await repo.getIUserById(payload.userId);

      return super.execut(user, UserRepository.Users, async (editingUser) => {
        return editingUser.lazyAction(payload.username)
      });

    } catch (err) {
      throw err;
    }
  }

}

describe("Aggregates consistency test", () => {

  beforeEach(async done => {

    await db.isReady(true);
    done();
  })


  it("multiple access to an aggregate should throw error for who is saving an aggregate with wrong expected version", async function (done) {


    try {

      this.done = done
      const user = await _User.model().create({
        username: 'initial username'
      });

      await Promise.all([
        new InstanceCommand().execut({userId: user.id, username: 'instance username'}),
        new LazyCommand().execut({userId: user.id, username: 'lazy username'})
      ])

      // console.log('-> ', UserRepository.Users);
      this.fail('version conflicting not happend');
      done();


    } catch (err) {

      console.log('-> ', err);
      // const user = await _User.model().findOne();


      done();
    }

    // expect(4).toBe(4);
    // done();
  })

});
