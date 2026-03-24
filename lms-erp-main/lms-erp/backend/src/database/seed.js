/**
 * Seed script — run with: node src/database/seed.js
 * Inserts: admin user, 3 categories, 3 courses (MFT, ServiceNow, webMethods)
 * with sections, lessons, and quizzes.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');

async function seed() {
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'lms_erp',
    multipleStatements: true,
  });

  console.log('Connected to DB. Seeding...\n');

  // ── Users ────────────────────────────────────────────────────────────────
  const adminId    = uuid();
  const employeeId = uuid();
  const adminHash  = await bcrypt.hash('Ar0hak#Admin2024', 10);
  const empHash    = await bcrypt.hash('Ar0hak#Emp2024', 10);

  await db.query(`
    INSERT IGNORE INTO users (id, name, email, password, role, department, employee_id)
    VALUES
      (?, 'Admin User',    'admin@arohak.com',    ?, 'admin',    'IT',         'EMP001'),
      (?, 'Employee User', 'employee@arohak.com', ?, 'employee', 'Operations', 'EMP002')
  `, [adminId, adminHash, employeeId, empHash]);
  console.log('✅ Users seeded');

  // Fetch admin id (may already exist)
  const [[admin]] = await db.query(`SELECT id FROM users WHERE email='admin@arohak.com'`);
  const instructorId = admin.id;

  // ── Categories ───────────────────────────────────────────────────────────
  const catMFT        = uuid();
  const catServiceNow = uuid();
  const catWebMethods = uuid();

  await db.query(`
    INSERT IGNORE INTO categories (id, name, slug, description) VALUES
      (?, 'MFT & File Transfer',  'mft-file-transfer',   'Managed File Transfer protocols, tools and best practices'),
      (?, 'ServiceNow',           'servicenow',           'ServiceNow platform development, ITSM and automation'),
      (?, 'webMethods Integration','webmethods-integration','Software AG webMethods integration platform and API management')
  `, [catMFT, catServiceNow, catWebMethods]);
  console.log('✅ Categories seeded');

  // Fetch category ids (may already exist)
  const [[rowMFT]]        = await db.query(`SELECT id FROM categories WHERE slug='mft-file-transfer'`);
  const [[rowSN]]         = await db.query(`SELECT id FROM categories WHERE slug='servicenow'`);
  const [[rowWM]]         = await db.query(`SELECT id FROM categories WHERE slug='webmethods-integration'`);

  // ── Course 1: MFT ────────────────────────────────────────────────────────
  const courseMFT = uuid();
  await db.query(`
    INSERT IGNORE INTO courses (id, title, description, level, language, is_published, instructor_id, category_id, passing_score)
    VALUES (?, 'Managed File Transfer (MFT) Fundamentals',
      'Master the core concepts of Managed File Transfer — protocols (SFTP, FTPS, AS2, HTTPS), encryption, scheduling, monitoring, and compliance. Covers IBM Sterling, GoAnywhere, and MOVEit.',
      'beginner', 'English', 1, ?, ?, 70)
  `, [courseMFT, instructorId, rowMFT.id]);

  // MFT Sections & Lessons
  const mftSections = [
    {
      title: 'Introduction to MFT',
      lessons: [
        { title: 'What is Managed File Transfer?',         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 600 },
        { title: 'MFT vs FTP — Key Differences',           url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 720 },
        { title: 'Common MFT Use Cases in Enterprise',     url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 540 },
      ],
    },
    {
      title: 'File Transfer Protocols',
      lessons: [
        { title: 'SFTP — SSH File Transfer Protocol',      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
        { title: 'FTPS — FTP over SSL/TLS',                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
        { title: 'AS2 Protocol for B2B Transfers',         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
        { title: 'HTTPS and REST-based File Transfer',     url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 780 },
      ],
    },
    {
      title: 'Security & Compliance',
      lessons: [
        { title: 'Encryption at Rest and In Transit',      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
        { title: 'PGP Key Management',                     url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
        { title: 'Audit Trails and Compliance Reporting',  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
      ],
    },
    {
      title: 'MFT Tools — IBM Sterling & GoAnywhere',
      lessons: [
        { title: 'IBM Sterling File Gateway Overview',     url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1200 },
        { title: 'Configuring Trading Partners in Sterling', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
        { title: 'GoAnywhere MFT — Setup and Workflows',   url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1140 },
        { title: 'Scheduling and Monitoring Transfers',    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
      ],
    },
  ];

  await seedSectionsAndLessons(db, courseMFT, mftSections);

  // MFT Quiz
  await seedQuiz(db, courseMFT, 'MFT Fundamentals Assessment', 70, [
    { text: 'Which protocol uses SSH for secure file transfer?', options: ['FTP','SFTP','FTPS','AS2'], correct: 1, explanation: 'SFTP (SSH File Transfer Protocol) uses SSH for encryption.' },
    { text: 'AS2 is primarily used for:', options: ['Internal file sync','B2B EDI transfers','Database backups','Email attachments'], correct: 1, explanation: 'AS2 is widely used for B2B EDI and business document exchange.' },
    { text: 'What does PGP stand for?', options: ['Pretty Good Privacy','Public Gateway Protocol','Packet Gateway Process','Private Group Policy'], correct: 0, explanation: 'PGP stands for Pretty Good Privacy, used for encryption and signing.' },
    { text: 'FTPS differs from SFTP in that it:', options: ['Uses SSH','Uses SSL/TLS over FTP','Is faster','Does not encrypt data'], correct: 1, explanation: 'FTPS adds SSL/TLS encryption to the traditional FTP protocol.' },
    { text: 'Which IBM product is commonly used for enterprise MFT?', options: ['IBM MQ','IBM Sterling','IBM Db2','IBM Watson'], correct: 1, explanation: 'IBM Sterling File Gateway is a leading enterprise MFT solution.' },
  ]);

  console.log('✅ MFT course seeded');

  // ── Course 2: ServiceNow ─────────────────────────────────────────────────
  const courseSN = uuid();
  await db.query(`
    INSERT IGNORE INTO courses (id, title, description, level, language, is_published, instructor_id, category_id, passing_score)
    VALUES (?, 'ServiceNow Platform Development',
      'Comprehensive training on the ServiceNow platform — ITSM, scripting with GlideRecord, Flow Designer, REST integrations, custom applications, and Service Portal development.',
      'intermediate', 'English', 1, ?, ?, 75)
  `, [courseSN, instructorId, rowSN.id]);

  const snSections = [
    {
      title: 'ServiceNow Fundamentals',
      lessons: [
        { title: 'ServiceNow Platform Overview',           url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 720 },
        { title: 'Navigating the ServiceNow UI',           url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 600 },
        { title: 'Tables, Records and Forms',              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
        { title: 'Users, Groups and Roles',                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 780 },
      ],
    },
    {
      title: 'ITSM — IT Service Management',
      lessons: [
        { title: 'Incident Management Workflow',           url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
        { title: 'Problem and Change Management',          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
        { title: 'Service Catalog and Request Management', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
        { title: 'SLA Configuration and Monitoring',       url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
      ],
    },
    {
      title: 'Scripting in ServiceNow',
      lessons: [
        { title: 'Introduction to GlideRecord',            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
        { title: 'Business Rules — Before and After',      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1200 },
        { title: 'Client Scripts and UI Policies',         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1140 },
        { title: 'Script Includes and Utility Functions',  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
      ],
    },
    {
      title: 'Flow Designer & Integrations',
      lessons: [
        { title: 'Flow Designer Basics',                   url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
        { title: 'Building Approval Flows',                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
        { title: 'REST API Integrations with ServiceNow',  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
        { title: 'Inbound and Outbound REST Messages',     url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
      ],
    },
    {
      title: 'Service Portal Development',
      lessons: [
        { title: 'Service Portal Architecture',            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
        { title: 'Creating Custom Widgets',                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1200 },
        { title: 'Portal Branding and Themes',             url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 780 },
      ],
    },
  ];

  await seedSectionsAndLessons(db, courseSN, snSections);

  await seedQuiz(db, courseSN, 'ServiceNow Platform Assessment', 75, [
    { text: 'Which API is used to query ServiceNow tables via server-side scripts?', options: ['GlideAjax','GlideRecord','GlideSystem','GlideForm'], correct: 1, explanation: 'GlideRecord is the primary server-side API for querying and manipulating table data.' },
    { text: 'Business Rules in ServiceNow run on:', options: ['Client browser','Server side','Both','Neither'], correct: 1, explanation: 'Business Rules execute on the server side when records are inserted, updated, or deleted.' },
    { text: 'Flow Designer is used for:', options: ['UI customization','Workflow automation','Database queries','Report generation'], correct: 1, explanation: 'Flow Designer provides a no-code/low-code interface for building automated workflows.' },
    { text: 'Which module handles IT incident tracking in ServiceNow?', options: ['CMDB','ITSM Incident','Service Portal','Discovery'], correct: 1, explanation: 'The ITSM Incident module manages the full lifecycle of IT incidents.' },
    { text: 'Script Includes in ServiceNow are:', options: ['Client-side only','Server-side reusable libraries','UI macros','Scheduled jobs'], correct: 1, explanation: 'Script Includes are server-side JavaScript libraries that can be called from other scripts.' },
    { text: 'What does SLA stand for in ServiceNow?', options: ['System Level Access','Service Level Agreement','Scripted Logic Action','Secure Login Authentication'], correct: 1, explanation: 'SLA stands for Service Level Agreement — defines response and resolution time targets.' },
  ]);

  console.log('✅ ServiceNow course seeded');

  // ── Course 3: webMethods ─────────────────────────────────────────────────
  const courseWM = uuid();
  await db.query(`
    INSERT IGNORE INTO courses (id, title, description, level, language, is_published, instructor_id, category_id, passing_score)
    VALUES (?, 'webMethods Integration Platform',
      'End-to-end training on Software AG webMethods — Integration Server, Designer, API Gateway, Broker/Universal Messaging, B2B trading partner management, and microservices deployment.',
      'intermediate', 'English', 1, ?, ?, 75)
  `, [courseWM, instructorId, rowWM.id]);

  const wmSections = [
    {
      title: 'webMethods Platform Overview',
      lessons: [
        { title: 'Introduction to Software AG webMethods',  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 720 },
        { title: 'webMethods Architecture and Components',  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
        { title: 'Integration Server Installation & Setup', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
        { title: 'webMethods Designer IDE Overview',        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
      ],
    },
    {
      title: 'Integration Server Development',
      lessons: [
        { title: 'Packages, Folders and Services',          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
        { title: 'Flow Services and Built-in Steps',        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1200 },
        { title: 'Pipeline and Variable Mapping',           url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
        { title: 'Error Handling and Retry Logic',          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
        { title: 'Adapters — JDBC, SAP, JMS',               url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1140 },
      ],
    },
    {
      title: 'Messaging — Universal Messaging',
      lessons: [
        { title: 'Universal Messaging Architecture',        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
        { title: 'Channels, Queues and Topics',             url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
        { title: 'Publish-Subscribe Patterns',              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
        { title: 'Guaranteed Delivery and Clustering',      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
      ],
    },
    {
      title: 'API Gateway & Management',
      lessons: [
        { title: 'webMethods API Gateway Overview',         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 780 },
        { title: 'Creating and Publishing APIs',            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
        { title: 'OAuth2 and API Security Policies',        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
        { title: 'Rate Limiting and Throttling',            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
        { title: 'API Analytics and Monitoring',            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
      ],
    },
    {
      title: 'B2B Integration & Trading Partners',
      lessons: [
        { title: 'B2B Module and Trading Networks',         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
        { title: 'EDI Standards — X12 and EDIFACT',         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
        { title: 'Partner Profiles and Agreements',         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
        { title: 'Document Tracking and Reprocessing',      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
      ],
    },
  ];

  await seedSectionsAndLessons(db, courseWM, wmSections);

  await seedQuiz(db, courseWM, 'webMethods Integration Assessment', 75, [
    { text: 'What is the core runtime component of webMethods?', options: ['API Gateway','Integration Server','Universal Messaging','Designer'], correct: 1, explanation: 'Integration Server is the core runtime that executes flow services and manages integrations.' },
    { text: 'In webMethods, a Flow Service is:', options: ['A REST endpoint','A graphical integration logic unit','A database adapter','A messaging channel'], correct: 1, explanation: 'Flow Services are graphical, step-based integration logic built in webMethods Designer.' },
    { text: 'Universal Messaging is used for:', options: ['API management','Asynchronous messaging and pub-sub','File transfer','Database connectivity'], correct: 1, explanation: 'Universal Messaging provides reliable asynchronous messaging with pub-sub and queuing.' },
    { text: 'Which EDI standard is commonly used in North America?', options: ['EDIFACT','X12','RosettaNet','SWIFT'], correct: 1, explanation: 'ANSI X12 is the dominant EDI standard in North America for B2B transactions.' },
    { text: 'The Pipeline in webMethods refers to:', options: ['A CI/CD pipeline','The data flow context between service steps','A messaging queue','A deployment package'], correct: 1, explanation: 'The Pipeline is the shared data context (like a map) that flows between steps in a Flow Service.' },
    { text: 'webMethods API Gateway primarily handles:', options: ['File transfers','Exposing and securing APIs','Database migrations','UI rendering'], correct: 1, explanation: 'API Gateway manages API lifecycle — publishing, securing, throttling, and monitoring APIs.' },
  ]);

  console.log('✅ webMethods course seeded');

  await db.end();
  console.log('\n🎉 All done! 3 courses seeded successfully.');
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function seedSectionsAndLessons(db, courseId, sections) {
  for (let si = 0; si < sections.length; si++) {
    const sectionId = uuid();
    await db.query(
      'INSERT IGNORE INTO sections (id, title, order_num, course_id) VALUES (?,?,?,?)',
      [sectionId, sections[si].title, si + 1, courseId]
    );
    for (let li = 0; li < sections[si].lessons.length; li++) {
      const lesson = sections[si].lessons[li];
      await db.query(
        'INSERT IGNORE INTO lessons (id, title, video_url, duration, order_num, is_free, section_id) VALUES (?,?,?,?,?,?,?)',
        [uuid(), lesson.title, lesson.url, lesson.duration, li + 1, li === 0 ? 1 : 0, sectionId]
      );
    }
  }
}

async function seedQuiz(db, courseId, title, passingScore, questions) {
  const quizId = uuid();
  await db.query(
    'INSERT IGNORE INTO quizzes (id, course_id, title, passing_score, order_num) VALUES (?,?,?,?,1)',
    [quizId, courseId, title, passingScore]
  );
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await db.query(
      'INSERT IGNORE INTO questions (id, quiz_id, text, options, correct_answer, explanation) VALUES (?,?,?,?,?,?)',
      [uuid(), quizId, q.text, JSON.stringify(q.options), q.correct, q.explanation]
    );
  }
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
