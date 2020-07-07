'use strict';

const express = require('express');
// const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

// Construct a router instance.
const router = express.Router();

const users = [];

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      return next(error)
    }
  }
}

//Authenticate User

// const authenticateUser = (req, res, next) => {
//   let message = null;
//   // Parse the user's credentials from the Authorization header.
//   const credentials = auth(req);

//   // If the user's credentials are available...
//   if (credentials) {
//     // Attempt to retrieve the user from the data store
//     // by their username (i.e. the user's "key"
//     // from the Authorization header).
//     const user = users.find(u => u.emailAddress === credentials.name);

//     // If a user was successfully retrieved from the data store...
//     if (user) {
//       const authenticated = bcryptjs
//         .compareSync(credentials.pass, user.password);
//       // If the passwords match...
//       if (authenticated) {
//         // Then store the retrieved user object on the request object
//         // so any middleware functions that follow this middleware function
//         // will have access to the user's information.
//         req.currentUser = user;
//       } else {
//         message = `Authentication failure for email: ${user.emailAddress}`;
//       }
//     } else {
//       message = `User not found for name: ${credentials.name}`;
//     }
//   } else {
//     message = 'Auth header not found';
//   }

//   // If user authentication failed...
//   if (message) {
//     console.warn(message);

//     // Return a response with a 401 Unauthorized HTTP status code.
//     res.status(401).json({ message: 'Access Denied' });
//   } else {
//     // Or if user authentication succeeded...
//     // Call the next() method.
//     next();
//   }
// };

router.get('/users', asyncHandler(async(req, res) => {
  const user = req.body;

  res.json(user);
}));

router.post('/users', asyncHandler(async(req, res) => {
  const user = req.body;
  users.push(user)
  res.status(201).end();

}))


module.exports = router;