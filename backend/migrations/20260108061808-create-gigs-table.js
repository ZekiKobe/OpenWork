'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('gigs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      freelancer_id: {
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
        type: Sequelize.STRING(100),
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
      pricing_type: {
        type: Sequelize.ENUM('fixed', 'hourly'),
        allowNull: false,
        defaultValue: 'fixed'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      delivery_time: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      revisions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      requirements: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      features: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      images: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      status: {
        type: Sequelize.ENUM('active', 'paused', 'deleted'),
        allowNull: false,
        defaultValue: 'active'
      },
      rating: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      total_reviews: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total_orders: {
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

    // Add indexes
    await queryInterface.addIndex('gigs', ['freelancer_id']);
    await queryInterface.addIndex('gigs', ['category']);
    await queryInterface.addIndex('gigs', ['status']);
    await queryInterface.addIndex('gigs', ['rating']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('gigs');
  }
};