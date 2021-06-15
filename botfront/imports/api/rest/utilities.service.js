export function getUser() {
  return {
    profile: {
      firstName: 'rest',
      lastName: 'api'
    },
    emails: [
      {address: 'restservice@example.com'}
    ]
  };
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

export function authMW(token) {
  return (function (req, res, next) {
    if (token == null || token.length < 1) {
      res.status(500).send('Token configuration missing');
      return;
    }

    if (req.headers.authorization !== token) {
      res.sendStatus(403);
      return;
    }

    next();
  });
}