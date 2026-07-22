'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('contracts', 'gig_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'gigs',
        key: 'id'
      }
    });

    await queryInterface.addColumn('contracts', 'job_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'jobs',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addIndex('contracts', ['job_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('contracts', ['job_id']);
    await queryInterface.removeColumn('contracts', 'job_id');
    await queryInterface.changeColumn('contracts', 'gig_id', {
      type: require('sequelize').INTEGER,
      allowNull: false
    });
  }
};
