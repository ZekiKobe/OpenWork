'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('job_applications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      job_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'jobs',
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
      cover_letter: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      proposed_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      proposed_hours: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      estimated_completion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      attachments: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      status: {
        type: Sequelize.ENUM('pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn'),
        allowNull: false,
        defaultValue: 'pending'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // Add unique constraint for job_id + freelancer_id
    await queryInterface.addIndex('job_applications', ['job_id', 'freelancer_id'], {
      unique: true,
      name: 'unique_job_freelancer_application'
    });

    // Add indexes for better performance
    await queryInterface.addIndex('job_applications', ['freelancer_id'], {
      name: 'idx_job_applications_freelancer_id'
    });

    await queryInterface.addIndex('job_applications', ['status'], {
      name: 'idx_job_applications_status'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('job_applications');
  }
};
