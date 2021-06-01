
import { Accounts } from 'meteor/accounts-base';
import {
  setScopes
} from '../../lib/scopes';
import {
  getAppLoggerForMethod, getAppLoggerForFile, addLoggingInterceptors, auditLog,
} from '../../../server/logger';

export function createUser(user, password) {
  return new Promise(async (resolve, reject) => {
    try {
      const userId = Accounts.createUser({
          email: user.email.trim(),
          profile: {
              firstName: user.profile.firstName,
              lastName: user.profile.lastName,
              preferredLanguage: user.profile.preferredLanguage,
          },
      });

      setScopes(user, userId);
      const result = Promise.await(Accounts.setPassword(userId, password));

      return resolve(`Created user: ${user.email}`);
    } catch (error) {
      console.log({error});
      return reject(error);
    }
  });
}


export function fetchBodyMW(req, res, next) {
  let body = "";

  req.on('data', Meteor.bindEnvironment(function (data) {
    body += data;
  }));

  req.on('end', Meteor.bindEnvironment(function () {
    req.body = body;
    next();
  }));
}