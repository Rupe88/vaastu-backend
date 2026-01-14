import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@lms.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  let admin = existingAdmin;

  if (existingAdmin) {
    console.log('Admin user already exists.');
    console.log(`  Email: ${existingAdmin.email}`);
    console.log(`  Role: ${existingAdmin.role}`);
    console.log(`  Status: ${existingAdmin.isEmailVerified ? 'Verified' : 'Not Verified'}`);
    console.log(`  Active: ${existingAdmin.isActive ? 'Yes' : 'No'}`);
    console.log('\nTo reset admin password, delete the user first or set FORCE_RESET=true in .env');
    
    // Allow password reset if FORCE_RESET is set
    if (process.env.FORCE_RESET === 'true') {
      console.log('\n⚠️  Force reset enabled. Updating admin password and role...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      admin = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          isEmailVerified: true,
          isActive: true,
        },
      });
      console.log('✓ Admin password and role updated successfully');
      console.log(`  New Password: ${adminPassword}`);
      console.log(`  Role: ADMIN`);
      console.log('\n⚠️  Please change the admin password after first login!');
    }
  } else {
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        fullName: adminName,
        role: 'ADMIN',
        isEmailVerified: true,
        isActive: true,
      },
    });

    console.log('✓ Admin user created successfully');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`  Role: ${admin.role}`);
    console.log('\n⚠️  Please change the admin password after first login!');
  }

  // Seed Categories
  console.log('\n📂 Seeding categories...');
  const categories = [
    // Course Categories
    {
      name: 'Vastu Shastra',
      slug: 'vastu-shastra',
      description: 'Learn the ancient Indian science of architecture and design',
      type: 'COURSE',
    },
    {
      name: 'Numerology',
      slug: 'numerology',
      description: 'Master the art of numbers and their impact on life',
      type: 'COURSE',
    },
    {
      name: 'Astrology',
      slug: 'astrology',
      description: 'Explore the cosmic influences on human life',
      type: 'COURSE',
    },
    {
      name: 'Palmistry',
      slug: 'palmistry',
      description: 'Understand the secrets hidden in your palms',
      type: 'COURSE',
    },
    {
      name: 'Feng Shui',
      slug: 'feng-shui',
      description: 'Chinese geomancy and space arrangement',
      type: 'COURSE',
    },
    // Blog Categories
    {
      name: 'Tips & Guides',
      slug: 'tips-guides',
      description: 'Practical tips and guides for daily life',
      type: 'BLOG',
    },
    {
      name: 'Success Stories',
      slug: 'success-stories',
      description: 'Inspiring stories from our students',
      type: 'BLOG',
    },
    {
      name: 'Latest Updates',
      slug: 'latest-updates',
      description: 'Latest news and updates from the academy',
      type: 'BLOG',
    },
    // Product Categories
    {
      name: 'Vastu Items',
      slug: 'vastu-items',
      description: 'Vastu compliant items and remedies',
      type: 'PRODUCT',
    },
    {
      name: 'Books',
      slug: 'books',
      description: 'Educational books and literature',
      type: 'PRODUCT',
    },
    {
      name: 'Pooja Items',
      slug: 'pooja-items',
      description: 'Ritual items and pooja accessories',
      type: 'PRODUCT',
    },
  ];

  let createdCategories = 0;
  let skippedCategories = 0;

  for (const categoryData of categories) {
    try {
      const existing = await prisma.category.findUnique({
        where: { slug: categoryData.slug },
      });

      if (existing) {
        skippedCategories++;
        continue;
      }

      await prisma.category.create({
        data: categoryData,
      });
      createdCategories++;
    } catch (error) {
      console.error(`Error creating category ${categoryData.name}:`, error.message);
    }
  }

  console.log(`✓ Categories seeded: ${createdCategories} created, ${skippedCategories} skipped`);

  // Seed Instructor (Acharya Raja Babu Shah)
  console.log('\n👨‍🏫 Seeding instructor...');
  let instructor = await prisma.instructor.findUnique({
    where: { slug: 'acharya-raja-babu-shah' },
  });

  if (!instructor) {
    instructor = await prisma.instructor.create({
      data: {
        name: 'Acharya Raja Babu Shah',
        slug: 'acharya-raja-babu-shah',
        designation: 'Top Vastulogist in Nepal',
        bio: 'Welcome to Sanskar Vastu, where ancient wisdom meets modern living. Led by Acharya Raja Babu Shah, Nepal\'s most trusted Vastu professional coach, we\'re committed to helping you create a harmonious, prosperous, and balanced life through the principles of Vastu Shastra.',
        specialization: 'Vastu Shastra, Numerology, Astrology',
        featured: true,
        commissionRate: 30.0,
      },
    });
    console.log('✓ Instructor created: Acharya Raja Babu Shah');
  } else {
    console.log('✓ Instructor already exists: Acharya Raja Babu Shah');
  }

  // Seed Vastu Course with Lessons
  console.log('\n📚 Seeding Vastu course with lessons...');
  const vastuCategory = await prisma.category.findUnique({
    where: { slug: 'vastu-shastra' },
  });

  if (!vastuCategory) {
    console.log('⚠️  Vastu category not found. Skipping course seed.');
    return;
  }

  let course = await prisma.course.findUnique({
    where: { slug: '7-days-basic-vastu-course' },
  });

  if (!course) {
    course = await prisma.course.create({
      data: {
        title: '7 DAYS BASIC VASTU COURSE',
        slug: '7-days-basic-vastu-course',
        shortDescription: 'Learn from Leader - 7 Days Journey with Top Vastulogist Acharya Raja Babu Shah',
        description: `*7 Days Basic* *Vastu Course* with *4 Extra Bonus* 

🙏 नेपालमा Vastu र Numerology को Course सुरुवात गर्ने नेपालको पहिलो र एकमात्र संस्था 👇
-- Sanskar Academy 🙏

🎯Learn from Leader🎯

👉️ *Rs 4000 को 7 Days Basic Vastu Course अब मात्र_Rs399_मा

*Course Details*
👉️ #Class Start: पुष 10 गते देखि*
👉️ #समय : बेलुका 8 PM 👉️ #शुल्क : Rs 399 only*
( यो offer सीमित सिटको लागि मात्र) 

*This is a workshop under the mentorship of #Top Vastulogist in Nepal Acharya_Raja_Babu_Shah* 

 *घर लाई स्वर्ग वनाउने यात्रा* 🏡

*#यो_ 7 Days_Course_मा_हामी_के_सिक्छौ_त ?*

*1. Scientific Vaastu के हो र यसले कसरी काम गर्छ?* 

*2. Modern Vaastu के हो र यसले कसरी काम गर्छ ?*

*3. Know about different kinds of Energy which influence your Home & Land* 🏡

*4. Traditional Vaastu के हों र यो कुन सिद्धान्त मा काम गर्छ ?*

*5. कसरी थाहा पाउने कि घरमा Negative Energy को प्रभाब बढदै छ , साथै Negative Energy लाई घर मा Reduce or Balance कसरि गर्ने?*

*6. घर भित्र positive Energy लाई Vaastu को कुन सिद्धान्त प्रयोग गरेर बढाउने?*

*7. घरको Brahamshthan (ब्रहमस्थान) को महत्त्व र भूमिका*

*8. Know the role of 32 entrances in Vastu ( Basic)*

*9. 5 elements and their attributes*

*👉️ Cycle of creation *. & Cycle of Distraction 

*10. Learn the attributes of all 16 directions ( Basic Level) and how they are affecting you in your daily life.*

*11. Know about the directions of opportunities for you*

*12. Learn how to increase your savings*

*13. How and which direction in VAASTU support your child's better education?*

*14. Know how sleeping in the wrong direction creates disease in your body.*

*15. Sleeping in which direction can create new business opportunities for you.*

*16. How to choose VAASTU perfect home?*

 *17. How to choose Vaastu Perfect Land? ( Only as per shape)*

*18. How to create family bonding?*

*19. Which direction can support you to improve better health and immunity?*

👉️ *You will get Certificate*

 👉️ *You will get PDF Notes*

*Class on ZOOM ONLINE Scientific & Modern VAASTU Basic COURSE*

👉️ *7 Days Journey with Top Vastulogist Acharya Raja Babu Shah*

💫💫🏡🏡🏡🏡🏡💫💫`,
        price: 399,
        isFree: false,
        status: 'PUBLISHED',
        level: 'Beginner',
        duration: 1800, // 30 hours total
        language: 'en',
        featured: true,
        isOngoing: false,
        tags: 'Vastu,Scientific Vastu,Modern Vastu,Energy,Home Design',
        originalPrice: 4000,
        learningOutcomes: [
          'Gain an immersive understanding of Scientific and Modern Vastu Shastra',
          'Understand how different kinds of Energy influence your Home & Land',
          'Learn how to detect and balance Negative Energy in your home',
          'Master the principles to increase Positive Energy in your living space',
          'Understand the importance and role of Brahamsthan (central space)',
          'Learn about 32 entrances in Vastu and their significance',
          'Master the 5 elements and their attributes in Vastu',
          'Understand the Cycle of Creation and Cycle of Destruction',
          'Learn the attributes of all 16 directions (Basic Level)',
          'Discover directions of opportunities for personal growth',
          'Learn how to increase savings through Vastu principles',
          'Understand which direction supports better child education',
          'Learn how sleeping direction affects health and disease prevention',
          'Discover sleeping directions that create business opportunities',
          'Master how to choose Vastu perfect home',
          'Learn how to choose Vastu Perfect Land (based on shape)',
          'Understand how to create better family bonding through Vastu',
          'Discover directions that support better health and immunity',
        ],
        skills: [
          'Vastu Shastra',
          'Scientific Vastu',
          'Modern Vastu',
          'Energy Analysis',
          'Home Design',
          'Directional Analysis',
          'Element Balancing',
          'Space Planning',
          'Land Selection',
          'Remedial Vastu',
        ],
        instructorId: instructor.id,
        categoryId: vastuCategory.id,
      },
    });
    console.log('✓ Course created: 7 DAYS BASIC VASTU COURSE');

    // Create lessons for the course
    const lessons = [
      // Pre-Assignments
      {
        title: 'Pre-Assignment - 1',
        slug: 'pre-assignment-1',
        description: 'Vastu Objective',
        lessonType: 'QUIZ',
        order: 1,
        isPreview: false,
      },
      {
        title: 'Pre-Assignment - 2',
        slug: 'pre-assignment-2',
        description: 'Vastu Objective',
        lessonType: 'QUIZ',
        order: 2,
        isPreview: false,
      },
      {
        title: 'Pre-Assignment - 3',
        slug: 'pre-assignment-3',
        description: 'Vastu Objective',
        lessonType: 'QUIZ',
        order: 3,
        isPreview: false,
      },
      // Day 1
      {
        title: 'Day 1 - Basic Vastu Course',
        slug: 'day-1-basic-vastu-course',
        description: 'Introduction to Vastu Shastra, Scientific and Modern Vastu concepts',
        lessonType: 'VIDEO',
        order: 4,
        isPreview: true, // Preview lesson
        videoDuration: 12000, // 3 hours 20 min in seconds (200 minutes)
      },
      // Day 2
      {
        title: 'Day 2 - Directional Energy & 5 Elements Power',
        slug: 'day-2-directional-energy-5-elements',
        description: 'Understanding directional energies and the power of 5 elements in Vastu',
        lessonType: 'VIDEO',
        order: 5,
        isPreview: false,
        videoDuration: 12000,
      },
      {
        title: 'Day 2 - Video Content',
        slug: 'day-2-video-content',
        description: 'Additional video content for Day 2',
        lessonType: 'VIDEO',
        order: 6,
        isPreview: false,
        videoDuration: 6000,
      },
      {
        title: 'Day 2 - PDF Notes',
        slug: 'day-2-pdf-notes',
        description: 'Download PDF notes for Day 2',
        lessonType: 'PDF',
        order: 7,
        isPreview: false,
      },
      {
        title: 'Day 2 - Vastu Objective',
        slug: 'day-2-vastu-objective',
        description: 'Test your understanding of Day 2 concepts',
        lessonType: 'QUIZ',
        order: 8,
        isPreview: false,
      },
      // Day 3
      {
        title: 'Day 3 - Elements Creation Cycle',
        slug: 'day-3-elements-creation-cycle',
        description: 'Learn about the creation and destruction cycles of elements',
        lessonType: 'VIDEO',
        order: 9,
        isPreview: false,
        videoDuration: 12000,
      },
      {
        title: 'Day 3 - Video Content',
        slug: 'day-3-video-content',
        description: 'Additional video content for Day 3',
        lessonType: 'VIDEO',
        order: 10,
        isPreview: false,
        videoDuration: 6000,
      },
      {
        title: 'Day 3 - Vastu Objective',
        slug: 'day-3-vastu-objective',
        description: 'Test your understanding of Day 3 concepts',
        lessonType: 'QUIZ',
        order: 11,
        isPreview: false,
      },
      // Day 4
      {
        title: 'Day 4 - Importance of Brahamsthan',
        slug: 'day-4-importance-brahamsthan',
        description: 'Understanding the central space (Brahamsthan) and its significance',
        lessonType: 'VIDEO',
        order: 12,
        isPreview: false,
        videoDuration: 12000,
      },
      // Day 5
      {
        title: 'Day 5 - Main Entrance Vastu with Remedy',
        slug: 'day-5-main-entrance-vastu',
        description: 'Vastu principles for main entrance and effective remedies',
        lessonType: 'VIDEO',
        order: 13,
        isPreview: false,
        videoDuration: 12000,
      },
      {
        title: 'Day 5 - Video Content',
        slug: 'day-5-video-content',
        description: 'Additional video content for Day 5',
        lessonType: 'VIDEO',
        order: 14,
        isPreview: false,
        videoDuration: 6000,
      },
      {
        title: 'Day 5 - Objective Question Part 1',
        slug: 'day-5-objective-question-part-1',
        description: 'Quiz Part 1 for Day 5',
        lessonType: 'QUIZ',
        order: 15,
        isPreview: false,
      },
      {
        title: 'Day 5 - Objective Question Part 2',
        slug: 'day-5-objective-question-part-2',
        description: 'Quiz Part 2 for Day 5',
        lessonType: 'QUIZ',
        order: 16,
        isPreview: false,
      },
      // Day 6
      {
        title: 'Day 6 - Bed Room Vastu with Remedy',
        slug: 'day-6-bedroom-vastu',
        description: 'Bedroom Vastu principles and remedies for better sleep and health',
        lessonType: 'VIDEO',
        order: 17,
        isPreview: false,
        videoDuration: 12000,
      },
      {
        title: 'Day 6 - Video Content',
        slug: 'day-6-video-content',
        description: 'Additional video content for Day 6',
        lessonType: 'VIDEO',
        order: 18,
        isPreview: false,
        videoDuration: 6000,
      },
      {
        title: 'Day 6 - Objective Test Part 1',
        slug: 'day-6-objective-test-part-1',
        description: 'Test Part 1 for Day 6',
        lessonType: 'QUIZ',
        order: 19,
        isPreview: false,
      },
      {
        title: 'Day 6 - Objective Test Part 2',
        slug: 'day-6-objective-test-part-2',
        description: 'Test Part 2 for Day 6',
        lessonType: 'QUIZ',
        order: 20,
        isPreview: false,
      },
      // Day 7
      {
        title: 'Day 7 - Attributes of 16 Direction',
        slug: 'day-7-attributes-16-directions',
        description: 'Complete guide to all 16 directions in Vastu and their attributes',
        lessonType: 'VIDEO',
        order: 21,
        isPreview: false,
        videoDuration: 12000,
      },
      // Day 8 (Bonus)
      {
        title: 'Day 8 - Vastu for Toilet',
        slug: 'day-8-vastu-for-toilet',
        description: 'Vastu principles for bathroom and toilet placement (Bonus Content)',
        lessonType: 'VIDEO',
        order: 22,
        isPreview: false,
        videoDuration: 12000,
      },
    ];

    let createdLessons = 0;
    for (const lessonData of lessons) {
      try {
        await prisma.lesson.create({
          data: {
            ...lessonData,
            courseId: course.id,
            content: lessonData.description,
          },
        });
        createdLessons++;
      } catch (error) {
        console.error(`Error creating lesson ${lessonData.title}:`, error.message);
      }
    }

    console.log(`✓ Course lessons created: ${createdLessons} lessons`);
  } else {
    console.log('✓ Course already exists: 7 DAYS BASIC VASTU COURSE');
  }
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

