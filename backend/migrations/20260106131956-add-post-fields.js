'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add new post fields
    await queryInterface.addColumn('posts', 'thumbnail_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    });

    await queryInterface.addColumn('posts', 'category', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'other'
    });

    await queryInterface.addColumn('posts', 'expertise_level', {
      type: Sequelize.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
      allowNull: false,
      defaultValue: 'beginner'
    });

    await queryInterface.addColumn('posts', 'estimated_read_time', {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 60
      }
    });

    await queryInterface.addColumn('posts', 'prerequisites', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
    });

    await queryInterface.addColumn('posts', 'learning_objectives', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove all the added columns in reverse order
    await queryInterface.removeColumn('posts', 'learning_objectives');
    await queryInterface.removeColumn('posts', 'prerequisites');
    await queryInterface.removeColumn('posts', 'estimated_read_time');
    await queryInterface.removeColumn('posts', 'expertise_level');
    await queryInterface.removeColumn('posts', 'category');
    await queryInterface.removeColumn('posts', 'thumbnail_url');
  }
};
