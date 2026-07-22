'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add freelancer and client roles to the existing enum
    await queryInterface.sequelize.query(`
      ALTER TABLE users
      MODIFY COLUMN role ENUM('user', 'freelancer', 'client', 'moderator', 'admin')
      NOT NULL DEFAULT 'user';
    `);
  },

  async down (queryInterface, Sequelize) {
    // Revert to the original enum values
    await queryInterface.sequelize.query(`
      ALTER TABLE users
      MODIFY COLUMN role ENUM('user', 'moderator', 'admin')
      NOT NULL DEFAULT 'user';
    `);
  }
};
