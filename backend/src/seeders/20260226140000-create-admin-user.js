'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if admin user with our specific email already exists
    const [existingAdmin] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email = 'admin@openwork.com' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    // If admin already exists, skip creation
    if (existingAdmin) {
      console.log('Admin user already exists, skipping creation.');
      return;
    }

    // Only seed admin in non-production, or when ADMIN_PASSWORD is explicitly set
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (process.env.NODE_ENV === 'production' && !adminPassword) {
      console.log('Skipping admin seed in production (set ADMIN_PASSWORD to create).');
      return;
    }

    const passwordHash = await bcrypt.hash(adminPassword || 'admin123', 12);

    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        email: 'admin@openwork.com',
        password_hash: passwordHash,
        username: 'admin',
        bio: 'System Administrator',
        role: 'admin',
        status: 'active',
        total_points: 0,
        email_verified: true,
        is_public_profile: false,
        show_email: false,
        created_at: now,
        updated_at: now
      }
    ], {});
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@openwork.com');
    console.log(adminPassword ? 'Password: (from ADMIN_PASSWORD)' : 'Password: admin123 — CHANGE IMMEDIATELY');
    console.log('Please change the password after first login!');
  },

  async down(queryInterface, Sequelize) {
    // Delete admin user
    await queryInterface.sequelize.query(
      "DELETE FROM users WHERE email = 'admin@openwork.com' OR (username = 'admin' AND role = 'admin')"
    );
    console.log('Admin user deleted.');
  }
};
