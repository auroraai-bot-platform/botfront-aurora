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