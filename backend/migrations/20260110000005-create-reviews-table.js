'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reviewer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      reviewee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      contract_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'contracts',
          key: 'id'
        }
      },
      job_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'jobs',
          key: 'id'
        }
      },
      gig_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'gigs',
          key: 'id'
        }
      },
      review_type: {
        type: Sequelize.ENUM('contract', 'job', 'gig'),
        allowNull: false
      },
      rating: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    await queryInterface.addIndex('reviews', ['reviewer_id']);
    await queryInterface.addIndex('reviews', ['reviewee_id']);
    await queryInterface.addIndex('reviews', ['contract_id']);
    await queryInterface.addIndex('reviews', ['job_id']);
    await queryInterface.addIndex('reviews', ['gig_id']);
    await queryInterface.addIndex('reviews', ['review_type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reviews');
  }
};
