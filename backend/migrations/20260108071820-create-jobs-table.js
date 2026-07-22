'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('jobs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      client_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('web-development', 'mobile-development', 'design', 'writing', 'marketing', 'data-science', 'consulting', 'other'),
        allowNull: false
      },
      subcategory: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      job_type: {
        type: Sequelize.ENUM('fixed', 'hourly'),
        allowNull: false,
        defaultValue: 'fixed'
      },
      budget_min: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      budget_max: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      fixed_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      estimated_hours: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      experience_level: {
        type: Sequelize.ENUM('entry', 'intermediate', 'expert'),
        allowNull: false,
        defaultValue: 'intermediate'
      },
      duration: {
        type: Sequelize.ENUM('short', 'medium', 'long'),
        allowNull: false,
        defaultValue: 'medium'
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: true
      },
      requirements: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      preferred_skills: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      attachments: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      status: {
        type: Sequelize.ENUM('open', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'open'
      },
      featured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      total_applications: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('jobs');
  }
};
