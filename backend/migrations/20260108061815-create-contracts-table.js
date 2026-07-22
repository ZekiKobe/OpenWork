'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contracts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      gig_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'gigs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      delivery_time: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      revisions_included: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      contract_status: {
        type: Sequelize.ENUM('pending', 'accepted', 'in_progress', 'completed', 'delivered', 'approved', 'revision_requested', 'cancelled', 'disputed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      payment_status: {
        type: Sequelize.ENUM('unpaid', 'paid', 'released', 'refunded'),
        allowNull: false,
        defaultValue: 'unpaid'
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cancellation_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      client_rating: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true
      },
      freelancer_rating: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true
      },
      client_review: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      freelancer_review: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      attachments: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      requirements: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      deliverables: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
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
    await queryInterface.addIndex('contracts', ['gig_id']);
    await queryInterface.addIndex('contracts', ['client_id']);
    await queryInterface.addIndex('contracts', ['freelancer_id']);
    await queryInterface.addIndex('contracts', ['contract_status']);
    await queryInterface.addIndex('contracts', ['payment_status']);
    await queryInterface.addIndex('contracts', ['deadline']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contracts');
  }
};
