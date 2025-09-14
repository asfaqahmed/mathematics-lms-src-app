/**
 * Shared API utilities for Mathematics LMS
 * Provides common middleware, response helpers, and utilities for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema, ZodError } from 'zod'
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'
import { logger } from './logger'
import { AppError, ErrorHandler, AuthError, ValidationError, createNotFoundError, ErrorCode } from './errors'
import { supabase } from './supabase'
import { supabaseAdmin, isAdminServer } from './supabase-admin'

// Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: PaginationInfo
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface AuthenticatedUser {
  id: string
  email: string
  name?: string
  role: 'admin' | 'student'
  [key: string]: any
}

export interface ApiContext {
  user?: AuthenticatedUser
  startTime: number
  requestId: string
  userAgent: string
  ip: string
}

export interface RateLimitConfig {
  windowMs: number
  max: number
  message?: string
  keyGenerator?: (req: NextRequest) => string
}

export interface ValidationConfig<T> {
  schema: ZodSchema<T>
  target?: 'body' | 'query' | 'params'
  optional?: boolean
}

// Constants
export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per windowMs
  message: 'Too many requests, please try again later.'
}

export const STRICT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 5, // requests per windowMs
  message: 'Too many requests, please try again later.'
}

export const DEFAULT_PAGE_SIZE = 12
export const MAX_PAGE_SIZE = 100

/**
 * Create standardized API response
 */
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  pagination?: PaginationInfo
): ApiResponse<T> {
  const response: ApiResponse<T> = { success }

  if (data !== undefined) response.data = data
  if (message) response.message = message
  if (pagination) response.pagination = pagination

  return response
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  pagination?: PaginationInfo
): NextResponse {
  return NextResponse.json(createApiResponse(true, data, message, pagination))
}

/**
 * Create error response
 */
export function createErrorResponse(
  error: string | AppError,
  statusCode: number = 500
): NextResponse {
  if (typeof error === 'string') {
    return NextResponse.json(
      createApiResponse(false, undefined, error),
      { status: statusCode }
    )
  }

  return NextResponse.json(
    error.toJSON(),
    { status: error.statusCode }
  )
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

/**
 * Extract user IP address
 */
export function getUserIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return '127.0.0.1'
}

/**
 * Create API context for logging and tracking
 */
export function createApiContext(request: NextRequest): ApiContext {
  return {
    startTime: Date.now(),
    requestId: generateRequestId(),
    userAgent: request.headers.get('user-agent') || 'unknown',
    ip: getUserIP(request)
  }
}

/**
 * Parse and validate request body
 */
export async function parseRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(
        `Validation failed: ${error.errors.map(e => e.message).join(', ')}`,
        { validationErrors: error.errors }
      )
    }
    throw new ValidationError('Invalid request body format')
  }
}

/**
 * Parse and validate query parameters
 */
export function parseQueryParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T {
  try {
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams.entries())
    return schema.parse(params)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(
        `Query validation failed: ${error.errors.map(e => e.message).join(', ')}`,
        { validationErrors: error.errors }
      )
    }
    throw new ValidationError('Invalid query parameters')
  }
}

/**
 * Authenticate user from request
 */
export async function authenticateUser(request: NextRequest): Promise<AuthenticatedUser> {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    throw new AuthError('No authentication token provided', ErrorCode.UNAUTHORIZED)
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      throw new AuthError('Invalid or expired token', ErrorCode.TOKEN_EXPIRED)
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      logger.warn('User profile not found', 'AUTH', { userId: user.id })
      return {
        id: user.id,
        email: user.email!,
        role: 'student'
      }
    }

    return {
      id: user.id,
      email: user.email!,
      name: profile.name,
      role: profile.role || 'student',
      ...profile
    }
  } catch (error) {
    logger.error('Authentication failed', 'AUTH', error)
    throw new AuthError('Authentication failed', ErrorCode.UNAUTHORIZED)
  }
}

/**
 * Authorize user role
 */
export function authorizeRole(user: AuthenticatedUser, allowedRoles: string[]): void {
  if (!allowedRoles.includes(user.role)) {
    throw new AuthError(
      'Insufficient permissions for this action',
      ErrorCode.FORBIDDEN,
      { userId: user.id, userRole: user.role, requiredRoles: allowedRoles }
    )
  }
}

/**
 * Check if user is admin
 */
export async function requireAdmin(user: AuthenticatedUser): Promise<void> {
  const isAdmin = await isAdminServer(user.id)
  if (!isAdmin) {
    throw new AuthError(
      'Admin access required',
      ErrorCode.FORBIDDEN,
      { userId: user.id }
    )
  }
}

/**
 * Check course access for user
 */
export async function checkCourseAccess(userId: string, courseId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('access_granted', true)
      .single()

    return !error && !!data
  } catch (error) {
    logger.warn('Course access check failed', 'ACCESS', { userId, courseId, error })
    return false
  }
}

/**
 * Create pagination info
 */
export function createPaginationInfo(
  page: number,
  limit: number,
  total: number
): PaginationInfo {
  const totalPages = Math.ceil(total / limit)

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeInput(item) :
        typeof item === 'object' && item !== null ? sanitizeObject(item) : item
      )
    }
  }

  return sanitized
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  allowedTypes: string[],
  maxSize: number = 10 * 1024 * 1024 // 10MB default
): void {
  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`)
  }

  if (file.size > maxSize) {
    throw new ValidationError(`File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`)
  }
}

/**
 * Simple in-memory rate limiter (for development)
 * In production, use Redis or similar
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): boolean {
  const now = Date.now()
  const store = rateLimitStore.get(key)

  if (!store || now > store.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    })
    return true
  }

  if (store.count >= config.max) {
    return false
  }

  store.count++
  rateLimitStore.set(key, store)
  return true
}

/**
 * Apply rate limiting middleware
 */
export function applyRateLimit(
  request: NextRequest,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): void {
  const key = config.keyGenerator ?
    config.keyGenerator(request) :
    getUserIP(request)

  if (!checkRateLimit(key, config)) {
    throw new AppError(
      config.message || 'Too many requests',
      ErrorCode.SERVER_ERROR,
      429
    )
  }
}

/**
 * CORS middleware
 */
export function applyCORS(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')

  return response
}

/**
 * Handle CORS preflight
 */
export function handleCORSPreflight(): NextResponse {
  const response = new NextResponse(null, { status: 200 })
  return applyCORS(response)
}

/**
 * Log API request/response
 */
export function logApiRequest(
  method: string,
  path: string,
  context: ApiContext,
  statusCode: number,
  error?: AppError
): void {
  const duration = Date.now() - context.startTime

  logger.apiRequest(method, path, statusCode, duration)

  if (error) {
    logger.error(
      `API Error: ${method} ${path}`,
      'API',
      {
        ...context,
        error: error.message,
        errorCode: error.code,
        statusCode: error.statusCode,
        duration
      }
    )
  }
}

/**
 * Comprehensive API route wrapper with middleware
 */
export function withMiddleware<T extends Record<string, any> = any>(
  handler: (request: NextRequest, context: ApiContext) => Promise<NextResponse>,
  options: {
    auth?: boolean
    adminOnly?: boolean
    rateLimit?: RateLimitConfig
    validation?: ValidationConfig<T>
    cors?: boolean
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context = createApiContext(request)
    const method = request.method
    const path = new URL(request.url).pathname

    try {
      // Handle CORS preflight
      if (method === 'OPTIONS' && options.cors) {
        return handleCORSPreflight()
      }

      // Apply rate limiting
      if (options.rateLimit) {
        applyRateLimit(request, options.rateLimit)
      }

      // Authentication
      if (options.auth) {
        context.user = await authenticateUser(request)

        if (options.adminOnly) {
          await requireAdmin(context.user)
        }
      }

      // Input validation
      if (options.validation) {
        const { schema, target = 'body', optional = false } = options.validation

        try {
          if (target === 'body' && ['POST', 'PUT', 'PATCH'].includes(method)) {
            await parseRequestBody(request, schema)
          } else if (target === 'query') {
            parseQueryParams(request, schema)
          }
        } catch (error) {
          if (!optional) throw error
        }
      }

      // Execute handler
      let response = await handler(request, context)

      // Apply CORS if enabled
      if (options.cors) {
        response = applyCORS(response)
      }

      // Log successful request
      logApiRequest(method, path, context, response.status)

      return response

    } catch (error) {
      const appError = ErrorHandler.handle(error, {
        requestId: context.requestId,
        url: path,
        method,
        userAgent: context.userAgent,
        userId: context.user?.id
      })

      // Log error
      logApiRequest(method, path, context, appError.statusCode, appError)

      let response = createErrorResponse(appError)

      // Apply CORS to error response if enabled
      if (options.cors) {
        response = applyCORS(response)
      }

      return response
    }
  }
}

// Database helpers
export async function withTransaction<T>(
  callback: () => Promise<T>
): Promise<T> {
  // Supabase doesn't have explicit transactions in the client
  // This is a placeholder for future transaction support
  return await callback()
}

// Cache helpers (simple in-memory cache for development)
const cache = new Map<string, { value: any; expires: number }>()

export function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (!cached || Date.now() > cached.expires) {
    cache.delete(key)
    return null
  }
  return cached.value
}

export function setCached<T>(key: string, value: T, ttlMs: number = 300000): void {
  cache.set(key, { value, expires: Date.now() + ttlMs })
}

export function invalidateCache(pattern?: string): void {
  if (pattern) {
    const regex = new RegExp(pattern)
    for (const [key] of cache) {
      if (regex.test(key)) {
        cache.delete(key)
      }
    }
  } else {
    cache.clear()
  }
}

// Export utility functions for testing
export const testUtils = {
  clearRateLimitStore: () => rateLimitStore.clear(),
  clearCache: () => cache.clear(),
  getRateLimitStore: () => rateLimitStore,
  getCache: () => cache
}