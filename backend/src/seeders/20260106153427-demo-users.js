'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Delete existing demo users first to avoid conflicts
    await queryInterface.sequelize.query(
      "DELETE FROM users WHERE email IN ('admin@example.com', 'john.doe@example.com', 'jane.smith@example.com', 'client@example.com', 'moderator@example.com', 'user@example.com')"
    );

    // Hash passwords (all demo users have password: "password123")
    const passwordHash = await bcrypt.hash('password123', 12);

    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        email: 'admin@example.com',
        password_hash: passwordHash,
        username: 'admin',
        bio: 'System Administrator',
        role: 'admin',
        status: 'active',
        total_points: 1000,
        email_verified: true,
        is_public_profile: true,
        show_email: false,
        created_at: now,
        updated_at: now
      },
      {
        email: 'john.doe@example.com',
        password_hash: passwordHash,
        username: 'johndoe',
        bio: 'Full-stack developer with 5+ years of experience in web development',
        title: 'Senior Full-Stack Developer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        skills: JSON.stringify(['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL']),
        expertise_areas: JSON.stringify(['Web Development', 'API Design', 'Database Design']),
        years_of_experience: 5,
        current_role: 'Senior Developer',
        education_level: 'bachelor',
        field_of_study: 'Computer Science',
        linkedin_url: 'https://linkedin.com/in/johndoe',
        github_url: 'https://github.com/johndoe',
        role: 'freelancer',
        status: 'active',
        total_points: 500,
        rating: 4.8,
        email_verified: true,
        is_public_profile: true,
        show_email: false,
        created_at: now,
        updated_at: now
      },
      {
        email: 'jane.smith@example.com',
        password_hash: passwordHash,
        username: 'janesmith',
        bio: 'UI/UX Designer passionate about creating beautiful and functional interfaces',
        title: 'Senior UI/UX Designer',
        company: 'Design Studio',
        location: 'New York, NY',
        skills: JSON.stringify(['Figma', 'Adobe XD', 'Sketch', 'User Research', 'Prototyping']),
        expertise_areas: JSON.stringify(['UI Design', 'UX Research', 'Design Systems']),
        years_of_experience: 7,
        current_role: 'Lead Designer',
        education_level: 'master',
        field_of_study: 'Graphic Design',
        linkedin_url: 'https://linkedin.com/in/janesmith',
        website: 'https://janesmith.design',
        role: 'freelancer',
        status: 'active',
        total_points: 750,
        rating: 4.9,
        email_verified: true,
        is_public_profile: true,
        show_email: false,
        created_at: now,
        updated_at: now
      },
      {
        email: 'client@example.com',
        password_hash: passwordHash,
        username: 'clientuser',
        bio: 'Business owner looking for talented freelancers',
        title: 'CEO',
        company: 'Startup Inc',
        location: 'Austin, TX',
        role: 'client',
        status: 'active',
        total_points: 200,
        email_verified: true,
        is_public_profile: true,
        show_email: false,
        created_at: now,
        updated_at: now
      },
      {
        email: 'moderator@example.com',
        password_hash: passwordHash,
        username: 'moderator',
        bio: 'Community Moderator',
        role: 'moderator',
        status: 'active',
        total_points: 300,
        email_verified: true,
        is_public_profile: false,
        show_email: false,
        created_at: now,
        updated_at: now
      },
      {
        email: 'user@example.com',
        password_hash: passwordHash,
        username: 'regularuser',
        bio: 'Regular user exploring the platform',
        role: 'user',
        status: 'active',
        total_points: 50,
        email_verified: true,
        is_public_profile: true,
        show_email: false,
        created_at: now,
        updated_at: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // Delete all demo users
    await queryInterface.sequelize.query(
      "DELETE FROM users WHERE email IN ('admin@example.com', 'john.doe@example.com', 'jane.smith@example.com', 'client@example.com', 'moderator@example.com', 'user@example.com')"
    );
  }
};
