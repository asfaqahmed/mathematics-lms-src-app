// Application Constants
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  COURSES: '/courses',
  MY_COURSES: '/my-courses',
  COURSE_PLAYER: (id: string) => `/courses/${id}/watch`,

  // Auth routes
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',

  // User routes
  PROFILE: '/profile',
  SETTINGS: '/profile/settings',

  // Admin routes
  ADMIN: '/admin',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_USERS: '/admin/users',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_SETTINGS: '/admin/settings',

  // Payment routes
  PAYMENT_SUCCESS: '/payment/success',
  PAYMENT_CANCEL: '/payment/cancel'
} as const

export const API_ROUTES = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REGISTER: '/api/auth/register',

  // Courses
  COURSES: '/api/courses',
  COURSE_BY_ID: (id: string) => `/api/courses/${id}`,
  COURSE_LESSONS: (id: string) => `/api/courses/${id}/lessons`,

  // Lessons
  LESSONS: '/api/lessons',
  LESSON_BY_ID: (id: string) => `/api/lessons/${id}`,
  LESSON_PROGRESS: '/api/lessons/progress',

  // Payments
  CREATE_CHECKOUT: '/api/payments/create-checkout',
  STRIPE_WEBHOOK: '/api/payments/stripe-webhook',
  PAYHERE: '/api/payments/payhere',
  VERIFY_SESSION: '/api/payments/verify-session',

  // Assignments
  UPLOAD_ASSIGNMENT: '/api/assignments/upload',

  // Certificates
  GENERATE_CERTIFICATE: '/api/certificates/generate',

  // Admin
  SEED_COURSES: '/api/seed-courses',
  SETUP_DATABASE: '/api/setup/database-tables'
} as const

export const USER_ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin'
} as const

export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
} as const

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const

export const ASSIGNMENT_STATUS = {
  SUBMITTED: 'submitted',
  REVIEWED: 'reviewed',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const

export const FILE_TYPES = {
  IMAGE: {
    JPEG: 'image/jpeg',
    PNG: 'image/png',
    WEBP: 'image/webp'
  },
  DOCUMENT: {
    PDF: 'application/pdf',
    DOC: 'application/msword',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    TXT: 'text/plain'
  },
  PRESENTATION: {
    PPT: 'application/vnd.ms-powerpoint',
    PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  }
} as const

export const TOAST_MESSAGES = {
  SUCCESS: {
    LOGIN: 'Successfully logged in!',
    LOGOUT: 'Successfully logged out!',
    REGISTER: 'Account created successfully!',
    COURSE_CREATED: 'Course created successfully!',
    COURSE_UPDATED: 'Course updated successfully!',
    PROGRESS_SAVED: 'Progress saved!',
    ASSIGNMENT_UPLOADED: 'Assignment uploaded successfully!',
    CERTIFICATE_GENERATED: 'Certificate generated successfully!'
  },
  ERROR: {
    GENERIC: 'Something went wrong. Please try again.',
    LOGIN_FAILED: 'Login failed. Please check your credentials.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FILE_TOO_LARGE: 'File size is too large.',
    INVALID_FILE_TYPE: 'Invalid file type.',
    COURSE_NOT_FOUND: 'Course not found.',
    LESSON_NOT_FOUND: 'Lesson not found.'
  },
  WARNING: {
    UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
    DELETE_CONFIRMATION: 'Are you sure you want to delete this item?'
  }
} as const

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
} as const

export const COLORS = {
  PRIMARY: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e'
  },
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6'
} as const