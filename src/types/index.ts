// Core Types for Mathematics LMS
export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'instructor' | 'admin'
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  price: number
  currency: string
  status: 'draft' | 'published' | 'archived'
  instructor_id: string
  thumbnail_url?: string
  created_at: string
  updated_at: string
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string
  video_url?: string
  content?: string
  order: number
  duration?: number
  created_at: string
  updated_at: string
}

export interface LessonProgress {
  id: string
  lesson_id: string
  user_id: string
  progress_percentage: number
  watch_time: number
  completed: boolean
  last_watched_at: string
  created_at: string
  updated_at: string
}

export interface CourseCompletion {
  id: string
  user_id: string
  course_id: string
  completed_at: string
  completion_percentage: number
  certificate_issued: boolean
  created_at: string
}

export interface Assignment {
  id: string
  user_id: string
  course_id: string
  lesson_id?: string
  file_url: string
  file_name: string
  file_size: number
  status: 'submitted' | 'reviewed' | 'approved' | 'rejected'
  submitted_at: string
  reviewed_at?: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_transfer' | 'payhere'
  provider: string
  details: Record<string, any>
}

export interface Payment {
  id: string
  user_id: string
  course_id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method: PaymentMethod
  created_at: string
  updated_at: string
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface CourseForm {
  title: string
  description: string
  price: number
  currency: string
  status: Course['status']
}

// Component Props Types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface LoadingState {
  isLoading: boolean
  error?: string | null
}