const Context = require('../context');


/**
 * Created by Eabasir on 02/03/2018.
 */

function parseServerError(err) {
  try {
    let a;
    let dashPlace = err.message.indexOf('- ');
    let statusCode = err.message.substring(0, dashPlace);
    eval(`a=${err.message.substring(dashPlace + 2)}`);

    try {
      err = JSON.parse(a);
    } catch (e) {
      if (a) {
        err.Message = a;
      } else {
        throw e;
      }
    }
    err.statusCode = statusCode;
    return err;
  } catch (e) {
    return err;
  }
}

function parseServerErrorToString(err) {
  try {
    err = parseServerError(err);
    return `SERVER ERROR:\nStatus: ${err.statusCode}\nMessage: ${err.Message}${err.Stack ? '\nServer stack:\n' + err.Stack : ''}`;
  } catch (e) {
    return err;
  }
}

function parseJasmineErrorToString(err) {
  return `TEST ERROR:\nMessage: ${err.message}\nStack:${err.stack}`;
}

function errorHandler(err) {
  if (err.response)
    this.fail(parseServerErrorToString(err));
  else
    this.fail(parseJasmineErrorToString(err));
  this.done();
}


getActionList = () => {
  let actionList = [];

  Object.keys(Context).forEach(el => {
    const contextObj = new Context[el]();

    actionList = actionList.concat(Object.keys(contextObj.getQueries()).map(a => {
      return {context: el, name: a};
    }));

    actionList = actionList.concat(Object.keys(contextObj.getCommands()).map(a => {
      return {context: el, name: a};
    }));
  });

  return actionList;
}

filterPolicies = (policies, user) => {
  const accessedPolicies = user.username === 'admin' ?
    policies :
    policies.filter(el => el.role_ids.filter(i => user.roles.map(el => el.id).indexOf(i) !== -1).length);

  const result = {
    document_types: [],
    forms: [],
    checklists: []
  };

  accessedPolicies.forEach(el => {
    if (el.document_type_id)
      result.document_types.push(el);
    else if (el.form_id)
      result.forms.push(el);
    else if (el.checklist_id)
      result.checklists.push(el);
  });

  return result;
}


module.exports = {
  parseServerError,
  parseServerErrorToString,
  parseJasmineErrorToString,
  errorHandler,
  getActionList,
  filterPolicies
};