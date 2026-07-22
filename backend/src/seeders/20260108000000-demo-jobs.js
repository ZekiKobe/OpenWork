'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    
    // Get the client user ID (client@example.com)
    const [users] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email = 'client@example.com' LIMIT 1"
    );
    
    if (users.length === 0) {
      console.log('Client user not found. Please run the demo-users seeder first.');
      return;
    }
    
    const clientId = users[0].id;
    
    // Calculate deadlines (various dates in the future)
    const deadline1 = new Date(now);
    deadline1.setDate(deadline1.getDate() + 30);
    
    const deadline2 = new Date(now);
    deadline2.setDate(deadline2.getDate() + 45);
    
    const deadline3 = new Date(now);
    deadline3.setDate(deadline3.getDate() + 60);
    
    const deadline4 = new Date(now);
    deadline4.setDate(deadline4.getDate() + 21);
    
    const deadline5 = new Date(now);
    deadline5.setDate(deadline5.getDate() + 14);

    await queryInterface.bulkInsert('jobs', [
      {
        client_id: clientId,
        title: 'Full-Stack Web Developer Needed for E-commerce Platform',
        description: 'We are looking for an experienced full-stack developer to help build our new e-commerce platform. The project involves creating a modern, responsive web application with user authentication, product catalog, shopping cart, payment integration, and admin dashboard. You will work with React, Node.js, PostgreSQL, and integrate with Stripe for payments. The ideal candidate should have experience with TypeScript, RESTful APIs, and modern development practices.',
        category: 'web-development',
        subcategory: 'full-stack',
        tags: JSON.stringify(['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Stripe', 'E-commerce']),
        job_type: 'fixed',
        fixed_price: 5000.00,
        estimated_hours: 120,
        experience_level: 'expert',
        duration: 'medium',
        deadline: deadline1,
        requirements: JSON.stringify([
          'Minimum 5 years of full-stack development experience',
          'Strong portfolio of e-commerce projects',
          'Experience with payment gateway integration',
          'Ability to work independently and meet deadlines'
        ]),
        preferred_skills: JSON.stringify(['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Stripe API', 'JWT Authentication']),
        attachments: JSON.stringify([]),
        status: 'open',
        featured: true,
        total_applications: 0,
        created_at: now,
        updated_at: now
      },
      {
        client_id: clientId,
        title: 'Mobile App Developer for iOS and Android',
        description: 'We need a skilled mobile developer to create a cross-platform mobile application for our fitness tracking service. The app should support both iOS and Android platforms, include features like user profiles, workout tracking, progress charts, and social sharing. Experience with React Native or Flutter is preferred. The app should integrate with our existing backend API and follow modern UI/UX design principles.',
        category: 'mobile-development',
        subcategory: 'cross-platform',
        tags: JSON.stringify(['React Native', 'Flutter', 'iOS', 'Android', 'Mobile Development', 'Fitness App']),
        job_type: 'hourly',
        budget_min: 50.00,
        budget_max: 80.00,
        estimated_hours: 200,
        experience_level: 'intermediate',
        duration: 'long',
        deadline: deadline2,
        requirements: JSON.stringify([
          '3+ years of mobile app development experience',
          'Portfolio of published apps on App Store and Google Play',
          'Strong understanding of mobile UI/UX best practices',
          'Experience with API integration'
        ]),
        preferred_skills: JSON.stringify(['React Native', 'Flutter', 'Swift', 'Kotlin', 'REST APIs', 'Firebase']),
        attachments: JSON.stringify([]),
        status: 'open',
        featured: false,
        total_applications: 0,
        created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        client_id: clientId,
        title: 'UI/UX Designer for SaaS Dashboard Redesign',
        description: 'We are redesigning our SaaS platform dashboard and need a talented UI/UX designer to create modern, intuitive interfaces. The project includes creating wireframes, high-fidelity mockups, and interactive prototypes. You should have experience with design systems, user research, and creating designs that improve user engagement and conversion rates. The design should be responsive and accessible.',
        category: 'design',
        subcategory: 'ui-ux',
        tags: JSON.stringify(['UI/UX Design', 'Figma', 'Prototyping', 'Design Systems', 'SaaS', 'Dashboard']),
        job_type: 'fixed',
        fixed_price: 2500.00,
        estimated_hours: 60,
        experience_level: 'intermediate',
        duration: 'short',
        deadline: deadline4,
        requirements: JSON.stringify([
          'Portfolio demonstrating strong UI/UX design skills',
          'Experience with Figma or similar design tools',
          'Understanding of user-centered design principles',
          'Ability to create responsive designs'
        ]),
        preferred_skills: JSON.stringify(['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'Design Systems']),
        attachments: JSON.stringify([]),
        status: 'open',
        featured: true,
        total_applications: 0,
        created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        client_id: clientId,
        title: 'Content Writer for Tech Blog - 10 Articles',
        description: 'We need a skilled technical content writer to create 10 high-quality blog articles about web development, programming best practices, and technology trends. Each article should be 1500-2000 words, well-researched, SEO-optimized, and include code examples where relevant. Topics will be provided, but you should have the technical knowledge to write authoritatively about programming concepts.',
        category: 'writing',
        subcategory: 'technical-writing',
        tags: JSON.stringify(['Content Writing', 'Technical Writing', 'Blogging', 'SEO', 'Web Development', 'Programming']),
        job_type: 'fixed',
        fixed_price: 800.00,
        estimated_hours: 40,
        experience_level: 'entry',
        duration: 'short',
        deadline: deadline5,
        requirements: JSON.stringify([
          'Strong writing and grammar skills',
          'Technical knowledge of web development',
          'Experience with SEO best practices',
          'Ability to meet deadlines consistently'
        ]),
        preferred_skills: JSON.stringify(['Technical Writing', 'SEO', 'Markdown', 'Git', 'Web Development', 'Content Strategy']),
        attachments: JSON.stringify([]),
        status: 'open',
        featured: false,
        total_applications: 0,
        created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updated_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        client_id: clientId,
        title: 'Digital Marketing Specialist for Social Media Campaign',
        description: 'We are launching a new product and need a digital marketing specialist to create and manage a comprehensive social media campaign. This includes content creation, social media strategy, paid advertising campaigns on Facebook and Instagram, influencer outreach, and performance tracking. You should have experience with social media analytics and be able to demonstrate ROI.',
        category: 'marketing',
        subcategory: 'social-media-marketing',
        tags: JSON.stringify(['Digital Marketing', 'Social Media', 'Facebook Ads', 'Instagram', 'Content Marketing', 'Analytics']),
        job_type: 'hourly',
        budget_min: 35.00,
        budget_max: 60.00,
        estimated_hours: 80,
        experience_level: 'intermediate',
        duration: 'medium',
        deadline: deadline3,
        requirements: JSON.stringify([
          'Proven track record in social media marketing',
          'Experience with Facebook and Instagram advertising',
          'Strong analytical skills',
          'Portfolio of successful campaigns'
        ]),
        preferred_skills: JSON.stringify(['Facebook Ads', 'Instagram Marketing', 'Google Analytics', 'Content Creation', 'Influencer Marketing', 'Social Media Strategy']),
        attachments: JSON.stringify([]),
        status: 'open',
        featured: false,
        total_applications: 0,
        created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updated_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        client_id: clientId,
        title: 'Data Scientist for Machine Learning Project',
        description: 'We need a data scientist to help build a recommendation system for our platform. The project involves data analysis, feature engineering, model development, and deployment. You should have experience with Python, machine learning libraries (scikit-learn, TensorFlow, or PyTorch), and working with large datasets. The goal is to improve user engagement through personalized recommendations.',
        category: 'data-science',
        subcategory: 'machine-learning',
        tags: JSON.stringify(['Data Science', 'Machine Learning', 'Python', 'TensorFlow', 'Recommendation Systems', 'Data Analysis']),
        job_type: 'hourly',
        budget_min: 75.00,
        budget_max: 120.00,
        estimated_hours: 150,
        experience_level: 'expert',
        duration: 'long',
        deadline: deadline2,
        requirements: JSON.stringify([
          'PhD or Master\'s degree in Data Science, Statistics, or related field',
          'Strong background in machine learning and statistics',
          'Experience with recommendation systems',
          'Proficiency in Python and ML libraries'
        ]),
        preferred_skills: JSON.stringify(['Python', 'TensorFlow', 'PyTorch', 'scikit-learn', 'Pandas', 'NumPy', 'SQL']),
        attachments: JSON.stringify([]),
        status: 'open',
        featured: true,
        total_applications: 0,
        created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updated_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        client_id: clientId,
        title: 'Business Consultant for Startup Strategy',
        description: 'We are a tech startup looking for an experienced business consultant to help develop our go-to-market strategy, pricing model, and growth plan. You should have experience working with early-stage startups, understanding market dynamics, and creating actionable business strategies. This is a short-term consulting engagement with the possibility of ongoing collaboration.',
        category: 'consulting',
        subcategory: 'business-strategy',
        tags: JSON.stringify(['Business Consulting', 'Strategy', 'Startup', 'Go-to-Market', 'Business Planning', 'Growth Strategy']),
        job_type: 'hourly',
        budget_min: 100.00,
        budget_max: 150.00,
        estimated_hours: 40,
        experience_level: 'expert',
        duration: 'short',
        deadline: deadline4,
        requirements: JSON.stringify([
          '10+ years of business consulting experience',
          'Experience with tech startups',
          'Strong analytical and strategic thinking skills',
          'MBA or equivalent business education preferred'
        ]),
        preferred_skills: JSON.stringify(['Business Strategy', 'Market Analysis', 'Financial Modeling', 'Strategic Planning', 'Startup Consulting', 'Growth Hacking']),
        attachments: JSON.stringify([]),
        status: 'open',
        featured: false,
        total_applications: 0,
        created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        updated_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        client_id: clientId,
        title: 'WordPress Developer for Website Redesign',
        description: 'We need a WordPress developer to redesign our company website. The project includes custom theme development, plugin integration, performance optimization, and ensuring mobile responsiveness. You should have strong PHP skills, experience with WordPress best practices, and be able to work with existing content and requirements.',
        category: 'web-development',
        subcategory: 'wordpress',
        tags: JSON.stringify(['WordPress', 'PHP', 'Custom Themes', 'Plugin Development', 'Website Redesign']),
        job_type: 'fixed',
        fixed_price: 1500.00,
        estimated_hours: 50,
        experience_level: 'intermediate',
        duration: 'short',
        deadline: deadline5,
        requirements: JSON.stringify([
          '3+ years of WordPress development experience',
          'Strong PHP skills',
          'Experience with custom theme development',
          'Understanding of WordPress security best practices'
        ]),
        preferred_skills: JSON.stringify(['WordPress', 'PHP', 'MySQL', 'HTML/CSS', 'JavaScript', 'WooCommerce']),
        attachments: JSON.stringify([]),
        status: 'open',
        featured: false,
        total_applications: 0,
        created_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        updated_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // Delete all demo jobs
    await queryInterface.sequelize.query(
      "DELETE FROM jobs WHERE client_id IN (SELECT id FROM users WHERE email = 'client@example.com')"
    );
  }
};
