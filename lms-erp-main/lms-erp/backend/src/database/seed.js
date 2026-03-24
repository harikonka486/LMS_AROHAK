/**
 * Seed script — run with: node src/database/seed.js
 * Inserts: admin user, categories, courses with sections, lessons, and quizzes.
 * Courses: MFT, ServiceNow, webMethods, Python, Full Stack, SAP UI5/Fiori, SAP Workflow, SAP CAP
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
    ...(process.env.DB_SSL === 'true' && { ssl: { rejectUnauthorized: false } }),
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

  const [[admin]] = await db.query(`SELECT id FROM users WHERE email='admin@arohak.com'`);
  const instructorId = admin.id;
  console.log(`Using instructor ID: ${instructorId}`);

  // Repair existing courses
  await db.query(
    `UPDATE courses SET instructor_id=? WHERE title IN (
      'Managed File Transfer (MFT) Fundamentals',
      'ServiceNow Platform Development',
      'webMethods Integration Platform',
      'Python Programming — From Beginner to Advanced',
      'Full Stack Web Development',
      'SAP UI5 & Fiori Development',
      'SAP Workflow & Business Process Automation',
      'SAP Cloud Application Programming Model (CAP)'
    )`,
    [instructorId]
  );
  console.log('✅ Repaired existing course instructor IDs');

  // ── Categories ───────────────────────────────────────────────────────────
  const cats = {
    mft:        uuid(), sn: uuid(), wm: uuid(),
    python:     uuid(), fullstack: uuid(),
    sapui5:     uuid(), sapwf: uuid(), sapcap: uuid(),
  };

  await db.query(`
    INSERT IGNORE INTO categories (id, name, slug, description) VALUES
      (?, 'MFT & File Transfer',       'mft-file-transfer',        'Managed File Transfer protocols, tools and best practices'),
      (?, 'ServiceNow',                'servicenow',               'ServiceNow platform development, ITSM and automation'),
      (?, 'webMethods Integration',    'webmethods-integration',   'Software AG webMethods integration platform and API management'),
      (?, 'Python Programming',        'python-programming',       'Python from basics to advanced — scripting, automation, data and APIs'),
      (?, 'Full Stack Development',    'full-stack-development',   'End-to-end web development with modern frontend and backend technologies'),
      (?, 'SAP UI5 & Fiori',           'sap-ui5-fiori',            'SAP UI5 framework and Fiori app development for enterprise UX'),
      (?, 'SAP Workflow',              'sap-workflow',             'SAP Business Workflow and process automation'),
      (?, 'SAP CAP',                   'sap-cap',                  'SAP Cloud Application Programming Model for cloud-native apps')
  `, [cats.mft, cats.sn, cats.wm, cats.python, cats.fullstack, cats.sapui5, cats.sapwf, cats.sapcap]);
  console.log('✅ Categories seeded');

  const getcat = async (slug) => { const [[r]] = await db.query(`SELECT id FROM categories WHERE slug=?`, [slug]); return r.id; };
  const catIds = {
    mft:       await getcat('mft-file-transfer'),
    sn:        await getcat('servicenow'),
    wm:        await getcat('webmethods-integration'),
    python:    await getcat('python-programming'),
    fullstack: await getcat('full-stack-development'),
    sapui5:    await getcat('sap-ui5-fiori'),
    sapwf:     await getcat('sap-workflow'),
    sapcap:    await getcat('sap-cap'),
  };

  // ── Course 1: MFT ────────────────────────────────────────────────────────
  const courseMFT = await upsertCourse(db, {
    title: 'Managed File Transfer (MFT) Fundamentals',
    description: 'Master MFT protocols (SFTP, FTPS, AS2), encryption, scheduling, monitoring and compliance. Covers IBM Sterling, GoAnywhere and MOVEit.',
    level: 'beginner', language: 'English', instructorId, categoryId: catIds.mft, passingScore: 70,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
  });

  await seedSectionsAndLessons(db, courseMFT, [
    { title: 'Introduction to MFT', lessons: [
      { title: 'What is Managed File Transfer?', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 600 },
      { title: 'MFT vs FTP — Key Differences',   url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 720 },
      { title: 'Common MFT Use Cases',            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 540 },
    ]},
    { title: 'File Transfer Protocols', lessons: [
      { title: 'SFTP — SSH File Transfer Protocol', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
      { title: 'FTPS — FTP over SSL/TLS',           url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
      { title: 'AS2 Protocol for B2B Transfers',    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
    ]},
    { title: 'Security & Compliance', lessons: [
      { title: 'Encryption at Rest and In Transit', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
      { title: 'PGP Key Management',                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
      { title: 'Audit Trails and Compliance',       url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
    ]},
  ]);
  await seedQuiz(db, courseMFT, 'MFT Fundamentals Assessment', 70, [
    { text: 'Which protocol uses SSH for secure file transfer?', options: ['FTP','SFTP','FTPS','AS2'], correct: 1, explanation: 'SFTP uses SSH for encryption.' },
    { text: 'AS2 is primarily used for:', options: ['Internal sync','B2B EDI transfers','DB backups','Email'], correct: 1, explanation: 'AS2 is used for B2B EDI and business document exchange.' },
    { text: 'What does PGP stand for?', options: ['Pretty Good Privacy','Public Gateway Protocol','Packet Gateway Process','Private Group Policy'], correct: 0, explanation: 'PGP = Pretty Good Privacy.' },
    { text: 'FTPS differs from SFTP in that it:', options: ['Uses SSH','Uses SSL/TLS over FTP','Is faster','Does not encrypt'], correct: 1, explanation: 'FTPS adds SSL/TLS to traditional FTP.' },
    { text: 'Which IBM product is used for enterprise MFT?', options: ['IBM MQ','IBM Sterling','IBM Db2','IBM Watson'], correct: 1, explanation: 'IBM Sterling File Gateway is a leading enterprise MFT solution.' },
  ]);
  console.log('✅ MFT course seeded');

  // ── Course 2: ServiceNow ─────────────────────────────────────────────────
  const courseSN = await upsertCourse(db, {
    title: 'ServiceNow Platform Development',
    description: 'Comprehensive training on ServiceNow — ITSM, GlideRecord scripting, Flow Designer, REST integrations, custom apps and Service Portal.',
    level: 'intermediate', language: 'English', instructorId, categoryId: catIds.sn, passingScore: 75,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
  });

  await seedSectionsAndLessons(db, courseSN, [
    { title: 'ServiceNow Fundamentals', lessons: [
      { title: 'Platform Overview',          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 720 },
      { title: 'Tables, Records and Forms',  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
      { title: 'Users, Groups and Roles',    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 780 },
    ]},
    { title: 'ITSM Modules', lessons: [
      { title: 'Incident Management Workflow',           url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
      { title: 'Problem and Change Management',          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
      { title: 'Service Catalog and Request Management', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
    ]},
    { title: 'Scripting in ServiceNow', lessons: [
      { title: 'Introduction to GlideRecord',       url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
      { title: 'Business Rules — Before and After', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1200 },
      { title: 'Client Scripts and UI Policies',    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1140 },
    ]},
    { title: 'Flow Designer & Integrations', lessons: [
      { title: 'Flow Designer Basics',                  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
      { title: 'REST API Integrations with ServiceNow', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
    ]},
  ]);
  await seedQuiz(db, courseSN, 'ServiceNow Platform Assessment', 75, [
    { text: 'Which API queries ServiceNow tables server-side?', options: ['GlideAjax','GlideRecord','GlideSystem','GlideForm'], correct: 1, explanation: 'GlideRecord is the primary server-side query API.' },
    { text: 'Business Rules run on:', options: ['Client browser','Server side','Both','Neither'], correct: 1, explanation: 'Business Rules execute on the server.' },
    { text: 'Flow Designer is used for:', options: ['UI customization','Workflow automation','DB queries','Reports'], correct: 1, explanation: 'Flow Designer builds automated workflows.' },
    { text: 'Script Includes are:', options: ['Client-side only','Server-side reusable libraries','UI macros','Scheduled jobs'], correct: 1, explanation: 'Script Includes are server-side reusable JS libraries.' },
    { text: 'SLA stands for:', options: ['System Level Access','Service Level Agreement','Scripted Logic Action','Secure Login Auth'], correct: 1, explanation: 'SLA = Service Level Agreement.' },
  ]);
  console.log('✅ ServiceNow course seeded');

  // ── Course 3: webMethods ─────────────────────────────────────────────────
  const courseWM = await upsertCourse(db, {
    title: 'webMethods Integration Platform',
    description: 'End-to-end training on Software AG webMethods — Integration Server, Designer, API Gateway, Universal Messaging, B2B and microservices.',
    level: 'intermediate', language: 'English', instructorId, categoryId: catIds.wm, passingScore: 75,
    thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80',
  });

  await seedSectionsAndLessons(db, courseWM, [
    { title: 'Platform Overview', lessons: [
      { title: 'Introduction to webMethods',          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 720 },
      { title: 'Architecture and Components',         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
      { title: 'Integration Server Setup',            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
    ]},
    { title: 'Integration Server Development', lessons: [
      { title: 'Packages, Folders and Services',  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
      { title: 'Flow Services and Built-in Steps', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1200 },
      { title: 'Pipeline and Variable Mapping',    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
      { title: 'Error Handling and Retry Logic',   url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
    ]},
    { title: 'API Gateway & Management', lessons: [
      { title: 'API Gateway Overview',          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 780 },
      { title: 'Creating and Publishing APIs',  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
      { title: 'OAuth2 and Security Policies',  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
    ]},
    { title: 'B2B Integration', lessons: [
      { title: 'B2B Module and Trading Networks', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
      { title: 'EDI Standards — X12 and EDIFACT', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
      { title: 'Partner Profiles and Agreements', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
    ]},
  ]);
  await seedQuiz(db, courseWM, 'webMethods Integration Assessment', 75, [
    { text: 'Core runtime of webMethods?', options: ['API Gateway','Integration Server','Universal Messaging','Designer'], correct: 1, explanation: 'Integration Server is the core runtime.' },
    { text: 'A Flow Service is:', options: ['A REST endpoint','A graphical integration logic unit','A DB adapter','A messaging channel'], correct: 1, explanation: 'Flow Services are graphical step-based integration logic.' },
    { text: 'Universal Messaging is used for:', options: ['API management','Async messaging and pub-sub','File transfer','DB connectivity'], correct: 1, explanation: 'Universal Messaging provides reliable async messaging.' },
    { text: 'EDI standard common in North America?', options: ['EDIFACT','X12','RosettaNet','SWIFT'], correct: 1, explanation: 'ANSI X12 is dominant in North America.' },
    { text: 'The Pipeline in webMethods refers to:', options: ['CI/CD pipeline','Data flow context between steps','A messaging queue','A deployment package'], correct: 1, explanation: 'Pipeline is the shared data context between Flow Service steps.' },
  ]);
  console.log('✅ webMethods course seeded');

  // ── Course 4: Python ─────────────────────────────────────────────────────
  const coursePY = await upsertCourse(db, {
    title: 'Python Programming — From Beginner to Advanced',
    description: 'Complete Python training covering syntax, OOP, file handling, APIs, automation, data analysis with pandas/numpy, and web development with Flask.',
    level: 'beginner', language: 'English', instructorId, categoryId: catIds.python, passingScore: 70,
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&q=80',
  });

  await seedSectionsAndLessons(db, coursePY, [
    { title: 'Python Basics', lessons: [
      { title: 'Introduction to Python and Setup',       url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 600 },
      { title: 'Variables, Data Types and Operators',    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 720 },
      { title: 'Control Flow — if, for, while',          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
      { title: 'Functions and Modules',                  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
    ]},
    { title: 'Object-Oriented Python', lessons: [
      { title: 'Classes and Objects',                    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
      { title: 'Inheritance and Polymorphism',           url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
      { title: 'Exception Handling',                     url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 780 },
      { title: 'File I/O and Context Managers',          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
    ]},
    { title: 'Python for Automation & APIs', lessons: [
      { title: 'Working with REST APIs using requests',  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
      { title: 'Web Scraping with BeautifulSoup',        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
      { title: 'Automating Tasks with Python Scripts',   url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
    ]},
    { title: 'Data Analysis with Python', lessons: [
      { title: 'NumPy — Arrays and Operations',          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
      { title: 'Pandas — DataFrames and Data Wrangling', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1200 },
      { title: 'Data Visualization with Matplotlib',     url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
    ]},
    { title: 'Web Development with Flask', lessons: [
      { title: 'Flask Introduction and Routing',         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
      { title: 'Templates with Jinja2',                  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
      { title: 'Building REST APIs with Flask',          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
      { title: 'Database Integration with SQLAlchemy',   url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1140 },
    ]},
  ]);
  await seedQuiz(db, coursePY, 'Python Programming Assessment', 70, [
    { text: 'Which keyword defines a function in Python?', options: ['function','def','fun','define'], correct: 1, explanation: 'def is used to define functions in Python.' },
    { text: 'What is the output of type([]) in Python?', options: ["<class 'dict'>",'<class \'list\'>','<class \'tuple\'>','<class \'set\'>'], correct: 1, explanation: '[] is a list literal, so type([]) returns <class \'list\'>.' },
    { text: 'Which library is used for data manipulation in Python?', options: ['NumPy','Pandas','Matplotlib','Flask'], correct: 1, explanation: 'Pandas provides DataFrame-based data manipulation.' },
    { text: 'In Python OOP, __init__ is:', options: ['A destructor','A constructor method','A static method','A class variable'], correct: 1, explanation: '__init__ is the constructor called when an object is created.' },
    { text: 'Which module handles HTTP requests in Python?', options: ['os','sys','requests','json'], correct: 2, explanation: 'The requests library is used to make HTTP calls.' },
    { text: 'List comprehension [x*2 for x in range(3)] produces:', options: ['[0,1,2]','[0,2,4]','[2,4,6]','[1,2,3]'], correct: 1, explanation: 'range(3) gives 0,1,2 — multiplied by 2 gives [0,2,4].' },
  ]);
  console.log('✅ Python course seeded');

  // ── Course 5: Full Stack Development ─────────────────────────────────────
  const courseFS = await upsertCourse(db, {
    title: 'Full Stack Web Development',
    description: 'Build complete web applications using React (frontend), Node.js/Express (backend), REST APIs, MySQL, authentication with JWT, and deployment on cloud platforms.',
    level: 'intermediate', language: 'English', instructorId, categoryId: catIds.fullstack, passingScore: 75,
    thumbnail: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=600&q=80',
  });

  await seedSectionsAndLessons(db, courseFS, [
    { title: 'HTML, CSS & JavaScript Fundamentals', lessons: [
      { title: 'HTML5 Structure and Semantic Elements', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 720 },
      { title: 'CSS3 — Flexbox and Grid Layouts',      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
      { title: 'JavaScript ES6+ Features',             url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
      { title: 'DOM Manipulation and Events',          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
    ]},
    { title: 'React Frontend Development', lessons: [
      { title: 'React Components and JSX',             url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
      { title: 'State Management with useState/useReducer', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
      { title: 'React Router and Navigation',          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
      { title: 'Fetching Data with useEffect and Axios', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
      { title: 'Tailwind CSS with React',              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
    ]},
    { title: 'Node.js & Express Backend', lessons: [
      { title: 'Node.js Introduction and npm',         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 780 },
      { title: 'Express.js REST API Development',      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1200 },
      { title: 'Middleware and Error Handling',         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
      { title: 'JWT Authentication and Authorization', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1140 },
    ]},
    { title: 'Database — MySQL & ORM', lessons: [
      { title: 'MySQL Schema Design and Relationships', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
      { title: 'CRUD Operations with mysql2',           url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
      { title: 'Using Prisma ORM with Node.js',         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1200 },
    ]},
    { title: 'Deployment & DevOps Basics', lessons: [
      { title: 'Git and GitHub Workflows',              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
      { title: 'Deploying Frontend on Vercel',          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 720 },
      { title: 'Deploying Backend on Render/Railway',   url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 780 },
      { title: 'Environment Variables and Security',    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 660 },
    ]},
  ]);
  await seedQuiz(db, courseFS, 'Full Stack Development Assessment', 75, [
    { text: 'Which hook manages local state in React?', options: ['useEffect','useContext','useState','useRef'], correct: 2, explanation: 'useState manages local component state in React.' },
    { text: 'REST API verb for creating a resource?', options: ['GET','PUT','POST','DELETE'], correct: 2, explanation: 'POST is used to create new resources.' },
    { text: 'JWT stands for:', options: ['Java Web Token','JSON Web Token','JavaScript Web Transfer','JSON Web Transfer'], correct: 1, explanation: 'JWT = JSON Web Token, used for stateless authentication.' },
    { text: 'Which CSS property creates a flexible container?', options: ['display:block','display:flex','display:grid','display:inline'], correct: 1, explanation: 'display:flex enables Flexbox layout.' },
    { text: 'Node.js is built on:', options: ['SpiderMonkey','V8 Engine','Chakra','JavaScriptCore'], correct: 1, explanation: 'Node.js runs on Google\'s V8 JavaScript engine.' },
    { text: 'Which command initializes a new Node.js project?', options: ['node init','npm start','npm init','node create'], correct: 2, explanation: 'npm init creates a new package.json for a Node.js project.' },
  ]);
  console.log('✅ Full Stack Development course seeded');

  // ── Course 6: SAP UI5 & Fiori ─────────────────────────────────────────────
  const courseSAPUI5 = await upsertCourse(db, {
    title: 'SAP UI5 & Fiori Development',
    description: 'Build enterprise-grade SAP Fiori apps using SAPUI5 framework — MVC architecture, OData binding, Fiori Elements, SAP BTP deployment and Fiori Launchpad configuration.',
    level: 'intermediate', language: 'English', instructorId, categoryId: catIds.sapui5, passingScore: 75,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
  });

  await seedSectionsAndLessons(db, courseSAPUI5, [
    { title: 'SAPUI5 Fundamentals', lessons: [
      { title: 'Introduction to SAPUI5 and Fiori',       url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 720 },
      { title: 'SAPUI5 MVC Architecture',                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
      { title: 'Views — XML, JSON and JS Views',         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
      { title: 'Controllers and Event Handling',         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
    ]},
    { title: 'Data Binding & OData', lessons: [
      { title: 'Property, Element and Aggregation Binding', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
      { title: 'OData V2 and V4 Services',               url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
      { title: 'ODataModel and CRUD Operations',         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1140 },
      { title: 'JSON Model for Local Data',              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 780 },
    ]},
    { title: 'SAPUI5 Controls & Layouts', lessons: [
      { title: 'Smart Controls — SmartTable, SmartForm', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
      { title: 'Responsive Layouts and Containers',      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
      { title: 'Routing and Navigation in SAPUI5',       url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
    ]},
    { title: 'Fiori Elements & Launchpad', lessons: [
      { title: 'Fiori Elements — List Report and Object Page', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1200 },
      { title: 'Annotations for Fiori Elements',         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
      { title: 'SAP Fiori Launchpad Configuration',      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
      { title: 'Deploying Fiori Apps to SAP BTP',        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
    ]},
  ]);
  await seedQuiz(db, courseSAPUI5, 'SAP UI5 & Fiori Assessment', 75, [
    { text: 'SAPUI5 follows which architectural pattern?', options: ['MVVM','MVP','MVC','Flux'], correct: 2, explanation: 'SAPUI5 uses the MVC (Model-View-Controller) pattern.' },
    { text: 'Which file type is the preferred view format in SAPUI5?', options: ['JSON View','JS View','HTML View','XML View'], correct: 3, explanation: 'XML Views are the recommended and most widely used view format in SAPUI5.' },
    { text: 'OData is used in SAPUI5 for:', options: ['Styling','Backend data communication','Routing','Unit testing'], correct: 1, explanation: 'OData services provide the backend data layer for SAPUI5 apps.' },
    { text: 'Fiori Elements apps are based on:', options: ['Custom coding','Annotations and metadata','JavaScript only','ABAP reports'], correct: 1, explanation: 'Fiori Elements generates UI from OData annotations and metadata.' },
    { text: 'SAP Fiori Launchpad is:', options: ['A code editor','The central entry point for Fiori apps','A database tool','A testing framework'], correct: 1, explanation: 'Fiori Launchpad is the central hub where users access all Fiori applications.' },
    { text: 'Which SAP platform is used to deploy Fiori apps to the cloud?', options: ['SAP ECC','SAP BTP','SAP HANA Studio','SAP GUI'], correct: 1, explanation: 'SAP Business Technology Platform (BTP) hosts cloud-deployed Fiori apps.' },
  ]);
  console.log('✅ SAP UI5 & Fiori course seeded');

  // ── Course 7: SAP Workflow ────────────────────────────────────────────────
  const courseSAPWF = await upsertCourse(db, {
    title: 'SAP Workflow & Business Process Automation',
    description: 'Master SAP Business Workflow — workflow builder, tasks, agents, work items, event linkage, and SAP Business Process Automation (BPA) on SAP BTP.',
    level: 'intermediate', language: 'English', instructorId, categoryId: catIds.sapwf, passingScore: 75,
    thumbnail: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600&q=80',
  });

  await seedSectionsAndLessons(db, courseSAPWF, [
    { title: 'SAP Workflow Fundamentals', lessons: [
      { title: 'Introduction to SAP Business Workflow',  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 720 },
      { title: 'Workflow Architecture and Components',   url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
      { title: 'Work Items and the Business Workplace',  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 780 },
    ]},
    { title: 'Workflow Builder', lessons: [
      { title: 'Creating Workflow Definitions',          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
      { title: 'Tasks — Standard and Workflow Tasks',    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
      { title: 'Agents and Agent Determination',         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
      { title: 'Conditions, Loops and Parallel Branches', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1140 },
    ]},
    { title: 'Events and Integration', lessons: [
      { title: 'Business Object Repository (BOR)',       url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
      { title: 'Event Linkage and Triggering Workflows', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
      { title: 'Workflow Containers and Bindings',       url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
    ]},
    { title: 'SAP BPA on BTP', lessons: [
      { title: 'SAP Build Process Automation Overview',  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
      { title: 'Building Approval Workflows on BTP',     url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1200 },
      { title: 'RPA Bots and Automation Projects',       url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
      { title: 'Monitoring and Administration',          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 780 },
    ]},
  ]);
  await seedQuiz(db, courseSAPWF, 'SAP Workflow Assessment', 75, [
    { text: 'A Work Item in SAP Workflow represents:', options: ['A database record','A task assigned to an agent','A report','A transport request'], correct: 1, explanation: 'Work Items are the runtime instances of tasks assigned to agents in the Business Workplace.' },
    { text: 'The Business Object Repository (BOR) contains:', options: ['Workflow logs','Business object type definitions','User master data','Transport objects'], correct: 1, explanation: 'BOR stores the definitions of business object types used in workflow.' },
    { text: 'Agent determination in SAP Workflow defines:', options: ['Who receives work items','When a workflow starts','How data is stored','Which system is called'], correct: 0, explanation: 'Agent determination specifies which users or roles receive work items.' },
    { text: 'Event linkage is used to:', options: ['Link two workflows','Trigger a workflow based on a business event','Create a new task','Define workflow containers'], correct: 1, explanation: 'Event linkage connects business events (like document creation) to workflow triggers.' },
    { text: 'SAP Build Process Automation runs on:', options: ['SAP ECC','SAP BTP','SAP HANA','SAP GUI'], correct: 1, explanation: 'SAP Build Process Automation is a cloud service on SAP Business Technology Platform.' },
  ]);
  console.log('✅ SAP Workflow course seeded');

  // ── Course 8: SAP CAP ─────────────────────────────────────────────────────
  const courseSAPCAP = await upsertCourse(db, {
    title: 'SAP Cloud Application Programming Model (CAP)',
    description: 'Build cloud-native SAP applications using CAP — CDS data modeling, OData services, Node.js and Java runtimes, SAP HANA integration, and deployment on SAP BTP Cloud Foundry.',
    level: 'advanced', language: 'English', instructorId, categoryId: catIds.sapcap, passingScore: 80,
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
  });

  await seedSectionsAndLessons(db, courseSAPCAP, [
    { title: 'CAP Fundamentals', lessons: [
      { title: 'Introduction to SAP CAP',                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 720 },
      { title: 'CAP Architecture — CDS, Services, DB',   url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
      { title: 'Setting Up CAP Development Environment', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
      { title: 'CAP Project Structure and cds CLI',      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 780 },
    ]},
    { title: 'CDS Data Modeling', lessons: [
      { title: 'Entities, Types and Associations',       url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
      { title: 'Aspects, Mixins and Reuse Types',        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
      { title: 'Views and Projections in CDS',           url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
      { title: 'Annotations for OData and Fiori',        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
    ]},
    { title: 'CAP Services & OData', lessons: [
      { title: 'Defining and Exposing CDS Services',     url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
      { title: 'Custom Handlers — Before, On, After',    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1200 },
      { title: 'Actions and Functions in OData',         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
      { title: 'Authentication and Authorization (XSUAA)', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1140 },
    ]},
    { title: 'SAP HANA Integration', lessons: [
      { title: 'Connecting CAP to SAP HANA Cloud',       url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1020 },
      { title: 'Native HANA Features in CDS',            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
      { title: 'HDI Containers and Deployment',          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
    ]},
    { title: 'Deployment on SAP BTP', lessons: [
      { title: 'MTA — Multi-Target Application Build',   url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 900 },
      { title: 'Deploying to Cloud Foundry on BTP',      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 1080 },
      { title: 'SAP BTP Cockpit and Service Bindings',   url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 840 },
      { title: 'CI/CD Pipeline for CAP Applications',    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 960 },
    ]},
  ]);
  await seedQuiz(db, courseSAPCAP, 'SAP CAP Assessment', 80, [
    { text: 'CDS in SAP CAP stands for:', options: ['Core Data Services','Cloud Data Schema','Custom Definition Script','Central Data Store'], correct: 0, explanation: 'CDS = Core Data Services — the modeling language used in SAP CAP.' },
    { text: 'Which runtime does SAP CAP support?', options: ['Python only','Java and Node.js','Ruby and Go','PHP only'], correct: 1, explanation: 'SAP CAP supports both Node.js and Java runtimes.' },
    { text: 'Custom event handlers in CAP are registered using:', options: ['app.use()','this.before/on/after()','router.get()','@Handler'], correct: 1, explanation: 'CAP uses this.before(), this.on(), and this.after() to register custom handlers.' },
    { text: 'XSUAA in SAP BTP is used for:', options: ['Database access','Authentication and authorization','File storage','Messaging'], correct: 1, explanation: 'XSUAA (Extended Services for UAA) handles OAuth2-based auth on SAP BTP.' },
    { text: 'MTA stands for:', options: ['Managed Transfer Application','Multi-Target Application','Modular Transport Archive','Microservice Template App'], correct: 1, explanation: 'MTA = Multi-Target Application — the deployment descriptor format for SAP BTP.' },
    { text: 'HDI Containers in SAP HANA are used for:', options: ['Caching','Isolated schema deployment','User management','API routing'], correct: 1, explanation: 'HDI (HANA Deployment Infrastructure) containers provide isolated schema deployment.' },
  ]);
  console.log('✅ SAP CAP course seeded');

  await db.end();
  console.log('\n🎉 All done! 8 courses seeded successfully.');
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Insert course only if title doesn't exist yet. Returns the course id.
 * Safe to re-run — won't create duplicates.
 */
async function upsertCourse(db, { title, description, level, language, instructorId, categoryId, passingScore, thumbnail }) {
  const [[existing]] = await db.query('SELECT id FROM courses WHERE title=?', [title]);
  if (existing) {
    await db.query('UPDATE courses SET is_published=1, instructor_id=?, thumbnail=? WHERE id=?', [instructorId, thumbnail || null, existing.id]);
    console.log(`  ↩ Course already exists, updated: ${title}`);
    return existing.id;
  }
  const id = uuid();
  await db.query(
    'INSERT INTO courses (id,title,description,level,language,is_published,instructor_id,category_id,passing_score,thumbnail) VALUES (?,?,?,?,?,1,?,?,?,?)',
    [id, title, description, level, language, instructorId, categoryId, passingScore, thumbnail || null]
  );
  return id;
}

async function seedSectionsAndLessons(db, courseId, sections) {
  for (let si = 0; si < sections.length; si++) {
    const sec = sections[si];
    let [[existing]] = await db.query('SELECT id FROM sections WHERE course_id=? AND title=?', [courseId, sec.title]);
    let sectionId;
    if (existing) {
      sectionId = existing.id;
    } else {
      sectionId = uuid();
      await db.query(
        'INSERT INTO sections (id, title, order_num, course_id) VALUES (?,?,?,?)',
        [sectionId, sec.title, si + 1, courseId]
      );
    }
    for (let li = 0; li < sec.lessons.length; li++) {
      const lesson = sec.lessons[li];
      const [[existingLesson]] = await db.query('SELECT id FROM lessons WHERE section_id=? AND title=?', [sectionId, lesson.title]);
      if (!existingLesson) {
        await db.query(
          'INSERT INTO lessons (id, title, video_url, duration, order_num, is_free, section_id) VALUES (?,?,?,?,?,?,?)',
          [uuid(), lesson.title, lesson.url, lesson.duration, li + 1, li === 0 ? 1 : 0, sectionId]
        );
      }
    }
  }
}

async function seedQuiz(db, courseId, title, passingScore, questions) {
  let [[existing]] = await db.query('SELECT id FROM quizzes WHERE course_id=? AND title=?', [courseId, title]);
  let quizId;
  if (existing) {
    quizId = existing.id;
  } else {
    quizId = uuid();
    await db.query(
      'INSERT INTO quizzes (id, course_id, title, passing_score, order_num) VALUES (?,?,?,?,1)',
      [quizId, courseId, title, passingScore]
    );
  }
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const [[existingQ]] = await db.query('SELECT id FROM questions WHERE quiz_id=? AND text=?', [quizId, q.text]);
    if (!existingQ) {
      await db.query(
        'INSERT INTO questions (id, quiz_id, text, options, correct_answer, explanation) VALUES (?,?,?,?,?,?)',
        [uuid(), quizId, q.text, JSON.stringify(q.options), q.correct, q.explanation]
      );
    }
  }
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
