// Application Configuration
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Mathematics LMS',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  description: 'Professional Mathematics Learning Management System',
  version: '1.0.0',

  // Contact Information
  contact: {
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
    adminWhatsapp: process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '',
    email: 'support@mathematicslms.com'
  },

  // File Upload Limits
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: {
      images: ['image/jpeg', 'image/png', 'image/webp'],
      documents: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ],
      presentations: [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ]
    }
  },

  // Video Player Settings
  video: {
    completionThreshold: 0.9, // 90% watch threshold for completion
    saveProgressInterval: 5000, // Save progress every 5 seconds
    seekPreventionBuffer: 10 // Prevent seeking ahead by more than 10 seconds
  },

  // Pagination
  pagination: {
    defaultLimit: 12,
    maxLimit: 100
  },

  // Course Settings
  course: {
    currencies: ['USD', 'LKR', 'INR'],
    defaultCurrency: 'USD',
    statuses: ['draft', 'published', 'archived'] as const
  },

  // Animation Settings
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const

// Database Configuration
export const DB_CONFIG = {
  tables: {
    profiles: 'profiles',
    courses: 'courses',
    lessons: 'lessons',
    lessonProgress: 'lesson_progress',
    courseCompletions: 'course_completions',
    assignments: 'assignments',
    payments: 'payments',
    loginLogs: 'login_logs'
  }
} as const

// Environment Variables Validation
export const ENV = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  PAYHERE_MERCHANT_ID: process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID!,
  PAYHERE_SANDBOX: process.env.NEXT_PUBLIC_PAYHERE_SANDBOX === 'true',
  SMTP_HOST: process.env.SMTP_HOST!,
  SMTP_USER: process.env.SMTP_USER!,
  SMTP_PASS: process.env.SMTP_PASS!,
  // Bank Details
  BANK_NAME: process.env.NEXT_PUBLIC_BANK_NAME!,
  BANK_ACCOUNT: process.env.NEXT_PUBLIC_BANK_ACCOUNT!,
  BANK_ACCOUNT_NAME: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME!,
  BANK_BRANCH: process.env.NEXT_PUBLIC_BANK_BRANCH!,
  BANK_SWIFT: process.env.NEXT_PUBLIC_BANK_SWIFT!
}

// Validation for required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}