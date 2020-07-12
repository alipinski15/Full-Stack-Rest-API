'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

// Construct a router instance.
const router = express.Router();

const { User } = require('./models');
const { Course } = require('./models');




// const users = [];

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

/**
 * Authenticate User
 */

const authenticateUser = asyncHandler(async(req, res, next) => {
  let message = null;
  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);

  // If the user's credentials are available...
  if (credentials) {
    const user = await User.findOne({
      where: {
        emailAddress: credentials.name,
      }
    })
    

    // If a user was successfully retrieved from the data store...
    if (user) {
      const authenticated = bcryptjs
        .compareSync(credentials.pass, user.password);
      // If the passwords match...
      if (authenticated) {
        // Then store the retrieved user object on the request object
        // so any middleware functions that follow this middleware function
        // will have access to the user's information.
        req.currentUser = user;
      } else {
        message = `Authentication failure for email: ${user.emailAddress}`;
      }
    } else {
      message = `User not found for name: ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  }

  // If user authentication failed...
  if (message) {
    console.warn(message);

    // Return a response with a 401 Unauthorized HTTP status code.
    res.status(401).json({ message: 'Access Denied' });
  } else {
    // Or if user authentication succeeded...
    // Call the next() method.
    next();
  }
});

router.get('/users', authenticateUser, asyncHandler(async(req, res) => {
  const user = req.currentUser;

  res.json({
    Id: user.id,
    Name: `${user.firstName} ${user.lastName}`,
    Email: user.emailAddress
  });
  res.status(200).end();
}));

/**
 * Create new User
 */

router.post('/users', [
  check('firstName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a "First Name"'),
  check('lastName')
    .exists({ checknull: true, checkFalsy: true })
    .withMessage('Please provide a "Last Name"'),
  check('emailAddress')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "email"')
    .isEmail()
    .withMessage('Please provide a valid email address for "email"'),
  check('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "password"')
    .isLength({ min: 8, max: 20 })
    .withMessage('Please provide a value for "password" that is between 8 and 20 characters in length'),
], asyncHandler(async( req, res ) => {
    const errors = validationResult(req);
    // Get the user from the request body.
    const user = req.body;
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      res.status(400).json({ errors: errorMessages });
    }
    if (user.password) {
      user.password = bcryptjs.hashSync(user.password);
    } 
    try {
      await User.create(user);
      // Set the status to 201 Created and end the response.
      res.status(201).location('/').end();
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.status(400).location('/').json({error: error.errors[0].message})
    } else {
      throw error
    }
  }
}));

/**
 * Gets a list of available Courses
 */

router.get('/courses', asyncHandler(async(req, res) => {
  const courses = await Course.findAll({
    attributes: {
      exclude: ['createdAt', 'updatedAt']
    },
    include: {
      model: User,
      as: 'user',
      attributes: ['id', 'firstName', 'lastName', 'emailAddress']
    }
  });
  if(courses) {
    res.json(courses)
    res.status(200).end();
  } else {
    res.status(404).json({ message: "No Courses found"})
  }
}));

/**
 * Get a specific Course based on the ID of the User.
 */

router.get('/courses/:id', asyncHandler(async(req, res) => {
  const course = await Course.findByPk(req.params.id, {
    attributes: {
      exclude: ['createdAt', 'updatedAt']
    },
    include: {
      model: User,
      as: 'user',
      attributes: ['id', 'firstName', 'lastName', 'emailAddress']
    }
  });
  if(course) {
    res.json(course)
    res.status(200).end();
  } else {
    res.status(404).json({ message: "No Courses found"})
  }
}));

/**
 * Creates new Course with user authentication.
 */

router.post('/courses', [
  check('title')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a "Title"'),
  check('description')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a "Description"'),
  check('userId')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a "UserID"'),
], authenticateUser, asyncHandler(async(res, req) => {
  const errors = validationResult(req);
    // Get the user from the request body.
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      res.status(400).json({ errors: errorMessages });
    } else {
      const course = await Course.create(req.body);
      const courseId = course.dataValues.id
      // Set the status to 201 Created and end the response.
      res.status(201).location(`/courses/${courseId}`).end();
    }
}));

module.exports = router;