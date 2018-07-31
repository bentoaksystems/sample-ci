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


getActionList = () =>{
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


module.exports = {
  parseServerError,
  parseServerErrorToString,
  parseJasmineErrorToString,
  errorHandler,
  getActionList
};