'use strict';

const Sequelize = require('sequelize');

//Creates a model for Course information.

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  Course.init({
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Please provide a Title",
        },
        notNull: {
          msg: "Title cannot be null",
        }
      }
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Please provide a Description",
        },
        notNull: {
          msg: "Description cannot be null",
        }
      }
    },
    estimatedTime: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    materialsNeeded: {
      type: Sequelize.STRING,
      allowNull: true,
    }
  }, { sequelize });

  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      as: 'user',
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    });
  };

  return Course;
};
