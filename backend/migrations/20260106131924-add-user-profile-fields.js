'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add professional information fields
    await queryInterface.addColumn('users', 'title', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'company', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'location', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'website', {
      type: Sequelize.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    });

    // Add skills and expertise fields
    await queryInterface.addColumn('users', 'skills', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
    });

    await queryInterface.addColumn('users', 'expertise_areas', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
    });

    // Add experience fields
    await queryInterface.addColumn('users', 'years_of_experience', {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 50
      }
    });

    await queryInterface.addColumn('users', 'current_role', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    // Add education fields
    await queryInterface.addColumn('users', 'education_level', {
      type: Sequelize.ENUM('high_school', 'associate', 'bachelor', 'master', 'phd', 'other'),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'field_of_study', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    // Add social links
    await queryInterface.addColumn('users', 'linkedin_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    });

    await queryInterface.addColumn('users', 'github_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    });

    await queryInterface.addColumn('users', 'twitter_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    });

    // Add preferences
    await queryInterface.addColumn('users', 'is_public_profile', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });

    await queryInterface.addColumn('users', 'show_email', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove all the added columns in reverse order
    await queryInterface.removeColumn('users', 'show_email');
    await queryInterface.removeColumn('users', 'is_public_profile');
    await queryInterface.removeColumn('users', 'twitter_url');
    await queryInterface.removeColumn('users', 'github_url');
    await queryInterface.removeColumn('users', 'linkedin_url');
    await queryInterface.removeColumn('users', 'field_of_study');
    await queryInterface.removeColumn('users', 'education_level');
    await queryInterface.removeColumn('users', 'current_role');
    await queryInterface.removeColumn('users', 'years_of_experience');
    await queryInterface.removeColumn('users', 'expertise_areas');
    await queryInterface.removeColumn('users', 'skills');
    await queryInterface.removeColumn('users', 'website');
    await queryInterface.removeColumn('users', 'location');
    await queryInterface.removeColumn('users', 'company');
    await queryInterface.removeColumn('users', 'title');
  }
};
