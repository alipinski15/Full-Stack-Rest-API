'use strict';

const Sequelize = require('sequelize');

//Creates the model for a User.

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init({
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    emailAddress: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Please provide an Email Address"
        },
        is: {
          args: /^[^@]+@[^@.]+\.[a-z]+$/i,
          msg: "Please provide a valid Email Address"
        }
      },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Please provide a Password"
        }
      }
    }
  }, { sequelize });

  User.associate = (models) => {
    User.hasMany(models.Course, {
      as: 'user',
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    });
  };

  return User;
};
