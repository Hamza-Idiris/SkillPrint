require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Course = require('../models/Course');

const sampleCourses = [
  {
    title: 'Full-Stack Web Development Bootcamp (React & Node.js)',
    description: 'Master modern full-stack web development from scratch. Build production-ready MERN stack applications with authentication, databases, and responsive UIs.',
    category: 'Web Development',
    price: 99.99,
    discountActive: true,
    discountPercent: 30,
    coverImage: {
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      public_id: 'seed-webdev',
    },
    isPublished: true,
    lessons: [
      { title: '1. Introduction to Web Architecture & HTML5', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '15:20 mins', order: 1, isPreviewFree: true },
      { title: '2. CSS Flexbox, Grid & Modern Layouts', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '22:45 mins', order: 2, isPreviewFree: false },
      { title: '3. React Hooks & State Management', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '35:10 mins', order: 3, isPreviewFree: false },
      { title: '4. Express REST APIs & MongoDB Aggregation', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '40:15 mins', order: 4, isPreviewFree: false },
    ],
  },
  {
    title: 'Python & AI Engineering Masterclass',
    description: 'Learn Python programming from zero to advanced AI engineering. Build machine learning models, neural networks, and LLM-powered applications.',
    category: 'Artificial Intelligence',
    price: 149.99,
    discountActive: true,
    discountPercent: 25,
    coverImage: {
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      public_id: 'seed-ai',
    },
    isPublished: true,
    lessons: [
      { title: '1. Python Crash Course & Setup', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '18:30 mins', order: 1, isPreviewFree: true },
      { title: '2. Data Manipulation with NumPy & Pandas', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '28:10 mins', order: 2, isPreviewFree: false },
      { title: '3. Machine Learning Fundamentals with Scikit-Learn', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '45:00 mins', order: 3, isPreviewFree: false },
      { title: '4. Building Autonomous AI Agents with LangChain', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '52:15 mins', order: 4, isPreviewFree: false },
    ],
  },
  {
    title: 'UI/UX Design Essentials & Figma System Design',
    description: 'Design beautiful, intuitive web and mobile interfaces. Master Figma component libraries, responsive auto-layouts, and user testing frameworks.',
    category: 'Design',
    price: 79.99,
    discountActive: true,
    discountPercent: 40,
    coverImage: {
      url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
      public_id: 'seed-uiux',
    },
    isPublished: true,
    lessons: [
      { title: '1. Design Systems & Color Theory', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '14:00 mins', order: 1, isPreviewFree: true },
      { title: '2. Master Figma Auto-Layout & Variants', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '26:50 mins', order: 2, isPreviewFree: false },
      { title: '3. Wireframing to High-Fidelity Prototypes', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '31:20 mins', order: 3, isPreviewFree: false },
      { title: '4. User Research & Usability Testing', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '20:15 mins', order: 4, isPreviewFree: false },
    ],
  },
  {
    title: 'Next.js 14 & Tailwind CSS - Production Ready Applications',
    description: 'Build blazingly fast full-stack applications with Next.js 14 App Router, React Server Components, Server Actions, and Tailwind CSS styling.',
    category: 'Web Development',
    price: 89.99,
    discountActive: false,
    discountPercent: 0,
    coverImage: {
      url: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80',
      public_id: 'seed-nextjs',
    },
    isPublished: true,
    lessons: [
      { title: '1. Next.js 14 Architecture Overview', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '16:45 mins', order: 1, isPreviewFree: true },
      { title: '2. Server Components vs Client Components', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '24:30 mins', order: 2, isPreviewFree: false },
      { title: '3. Mutations with Server Actions', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '33:15 mins', order: 3, isPreviewFree: false },
      { title: '4. Deployment & Performance Optimization', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '21:00 mins', order: 4, isPreviewFree: false },
    ],
  },
  {
    title: 'Docker, Kubernetes & AWS Cloud DevOps Masterclass',
    description: 'Learn modern DevOps pipelines. Containerize applications with Docker, orchestrate with Kubernetes, and deploy to AWS EC2 & Elastic Kubernetes Service.',
    category: 'Cloud & DevOps',
    price: 129.99,
    discountActive: false,
    discountPercent: 0,
    coverImage: {
      url: 'https://images.unsplash.com/photo-1667372335854-788349253590?w=800&auto=format&fit=crop&q=80',
      public_id: 'seed-devops',
    },
    isPublished: true,
    lessons: [
      { title: '1. Introduction to Docker Containers & Images', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '20:10 mins', order: 1, isPreviewFree: true },
      { title: '2. Docker Compose for Multi-Container Apps', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '29:40 mins', order: 2, isPreviewFree: false },
      { title: '3. Kubernetes Architecture: Pods, Deployments & Services', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '42:15 mins', order: 3, isPreviewFree: false },
      { title: '4. GitHub Actions CI/CD Pipeline to AWS', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '38:00 mins', order: 4, isPreviewFree: false },
    ],
  },
  {
    title: 'Flutter & Dart: Build iOS & Android Mobile Apps',
    description: 'Create beautiful native mobile apps for iOS and Android using Google Flutter SDK and Dart programming language with state management.',
    category: 'Mobile Development',
    price: 69.99,
    discountActive: false,
    discountPercent: 0,
    coverImage: {
      url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
      public_id: 'seed-flutter',
    },
    isPublished: true,
    lessons: [
      { title: '1. Flutter Basics & Dart Fundamentals', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '19:30 mins', order: 1, isPreviewFree: true },
      { title: '2. Building Complex Reactive UI Layouts', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '31:00 mins', order: 2, isPreviewFree: false },
      { title: '3. State Management with Riverpod & Provider', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '36:45 mins', order: 3, isPreviewFree: false },
      { title: '4. Connecting REST APIs & Firebase Auth', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '27:15 mins', order: 4, isPreviewFree: false },
    ],
  },
  {
    title: 'Ethical Hacking & Cybersecurity Fundamentals',
    description: 'Understand cybersecurity defense by learning ethical hacking, network analysis, penetration testing methodologies, and securing web servers.',
    category: 'Cybersecurity',
    price: 119.99,
    discountActive: false,
    discountPercent: 0,
    coverImage: {
      url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
      public_id: 'seed-security',
    },
    isPublished: true,
    lessons: [
      { title: '1. Introduction to Ethical Hacking & Kali Linux', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '21:00 mins', order: 1, isPreviewFree: true },
      { title: '2. Network Reconnaissance & Port Scanning', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '34:20 mins', order: 2, isPreviewFree: false },
      { title: '3. Web Vulnerabilities & OWASP Top 10', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '48:10 mins', order: 3, isPreviewFree: false },
      { title: '4. System Hardening & Security Policies', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '25:30 mins', order: 4, isPreviewFree: false },
    ],
  },
  {
    title: 'Data Science & Big Data Analysis with Pandas & SQL',
    description: 'Extract insights from complex datasets. Master SQL queries, data wrangling in Python Pandas, data visualization, and statistical reporting.',
    category: 'Data Science',
    price: 94.99,
    discountActive: false,
    discountPercent: 0,
    coverImage: {
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      public_id: 'seed-datascience',
    },
    isPublished: true,
    lessons: [
      { title: '1. Relational Databases & Advanced SQL Queries', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '23:15 mins', order: 1, isPreviewFree: true },
      { title: '2. Cleaning Dirty Data with Pandas', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '32:00 mins', order: 2, isPreviewFree: false },
      { title: '3. Exploratory Data Analysis & Seaborn Visualizations', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '29:45 mins', order: 3, isPreviewFree: false },
      { title: '4. Building Predictive Regression Models', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '37:30 mins', order: 4, isPreviewFree: false },
    ],
  },
  {
    title: 'Complete TypeScript & Advanced JavaScript Guide',
    description: 'Level up your JavaScript skills. Deep dive into async promises, event loops, TypeScript interfaces, generics, type guards, and design patterns.',
    category: 'Web Development',
    price: 59.99,
    discountActive: false,
    discountPercent: 0,
    coverImage: {
      url: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&auto=format&fit=crop&q=80',
      public_id: 'seed-typescript',
    },
    isPublished: true,
    lessons: [
      { title: '1. Advanced JavaScript Scope & Closures', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '17:40 mins', order: 1, isPreviewFree: true },
      { title: '2. TypeScript Type System & Interfaces', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '25:10 mins', order: 2, isPreviewFree: false },
      { title: '3. Generics, Utility Types & Type Guards', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '30:50 mins', order: 3, isPreviewFree: false },
      { title: '4. Enterprise Design Patterns in TypeScript', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '28:15 mins', order: 4, isPreviewFree: false },
    ],
  },
  {
    title: 'Modern Graphic Design & Brand Identity Creation',
    description: 'Learn professional graphic design concepts. Create memorable logos, brand identity guidelines, visual assets, and print-ready artwork.',
    category: 'Design',
    price: 49.99,
    discountActive: false,
    discountPercent: 0,
    coverImage: {
      url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80',
      public_id: 'seed-graphicdesign',
    },
    isPublished: true,
    lessons: [
      { title: '1. Principles of Visual Composition & Layout', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '13:50 mins', order: 1, isPreviewFree: true },
      { title: '2. Vector Logo Creation in Adobe Illustrator', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '27:30 mins', order: 2, isPreviewFree: false },
      { title: '3. Image Editing & Compositing in Photoshop', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '34:00 mins', order: 3, isPreviewFree: false },
      { title: '4. Creating Complete Brand Identity Systems', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '22:10 mins', order: 4, isPreviewFree: false },
    ],
  },
];

(async () => {
  await connectDB();

  console.log('Seeding courses...');
  // Optional: clear existing sample courses or insert missing ones
  for (const courseData of sampleCourses) {
    const existing = await Course.findOne({ title: courseData.title });
    if (existing) {
      console.log(`Course "${courseData.title}" already exists. Updating...`);
      Object.assign(existing, courseData);
      await existing.save();
    } else {
      await Course.create(courseData);
      console.log(`✅ Created course: "${courseData.title}"`);
    }
  }

  const count = await Course.countDocuments();
  console.log(`\nDone! Total courses in database: ${count}`);

  await mongoose.connection.close();
  process.exit(0);
})().catch((err) => {
  console.error('Course seed failed:', err.message);
  process.exit(1);
});
