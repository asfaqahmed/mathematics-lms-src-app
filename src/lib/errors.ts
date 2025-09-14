/**
 * Custom error classes for Mathematics LMS
 * Provides structured error handling with context and user-friendly messages
 */

import { logger } from './logger'
import { TOAST_MESSAGES } from '@/constants'

export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  ACCOUNT_NOT_VERIFIED = 'ACCOUNT_NOT_VERIFIED',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Payment errors
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',

  // File errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',

  // Course/Lesson errors
  COURSE_NOT_ACCESSIBLE = 'COURSE_NOT_ACCESSIBLE',
  LESSON_LOCKED = 'LESSON_LOCKED',
  PROGRESS_SAVE_FAILED = 'PROGRESS_SAVE_FAILED',

  // External service errors
  EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',
  PAYMENT_GATEWAY_ERROR = 'PAYMENT_GATEWAY_ERROR',
  VIDEO_PROCESSING_FAILED = 'VIDEO_PROCESSING_FAILED',

  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface ErrorContext {
  userId?: string
  courseId?: string
  lessonId?: string
  requestId?: string
  userAgent?: string
  url?: string
  timestamp?: string
  [key: string]: any
}

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly context: ErrorContext
  public readonly isOperational: boolean
  public readonly userMessage: string

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode: number = 500,
    context: ErrorContext = {},
    isOperational: boolean = true,
    userMessage?: string
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.context = { ...context, timestamp: new Date().toISOString() }
    this.isOperational = isOperational
    this.userMessage = userMessage || this.getDefaultUserMessage(code)

    Error.captureStackTrace(this, this.constructor)

    // Log the error
    logger.error(message, 'ERROR', {
      code,
      statusCode,
      context,
      stack: this.stack
    })
  }

  /**
   * Get user-friendly error message based on error code
   */
  private getDefaultUserMessage(code: ErrorCode): string {
    const messages: Record<ErrorCode, string> = {
      [ErrorCode.UNAUTHORIZED]: 'Please log in to continue.',
      [ErrorCode.FORBIDDEN]: 'You don\'t have permission to perform this action.',
      [ErrorCode.INVALID_CREDENTIALS]: TOAST_MESSAGES.ERROR.LOGIN_FAILED,
      [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
      [ErrorCode.ACCOUNT_NOT_VERIFIED]: 'Please verify your email address to continue.',
      [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
      [ErrorCode.INVALID_INPUT]: 'The information you provided is invalid.',
      [ErrorCode.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields.',
      [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
      [ErrorCode.ALREADY_EXISTS]: 'This item already exists.',
      [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'You don\'t have permission to access this resource.',
      [ErrorCode.PAYMENT_FAILED]: 'Payment processing failed. Please try again.',
      [ErrorCode.INSUFFICIENT_FUNDS]: 'Insufficient funds for this transaction.',
      [ErrorCode.PAYMENT_REQUIRED]: 'Payment is required to access this content.',
      [ErrorCode.FILE_TOO_LARGE]: TOAST_MESSAGES.ERROR.FILE_TOO_LARGE,
      [ErrorCode.INVALID_FILE_TYPE]: TOAST_MESSAGES.ERROR.INVALID_FILE_TYPE,
      [ErrorCode.UPLOAD_FAILED]: 'File upload failed. Please try again.',
      [ErrorCode.NETWORK_ERROR]: TOAST_MESSAGES.ERROR.NETWORK,
      [ErrorCode.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
      [ErrorCode.SERVER_ERROR]: 'Server error occurred. Please try again later.',
      [ErrorCode.COURSE_NOT_ACCESSIBLE]: 'This course is not accessible to you.',
      [ErrorCode.LESSON_LOCKED]: 'This lesson is locked. Complete previous lessons first.',
      [ErrorCode.PROGRESS_SAVE_FAILED]: 'Failed to save your progress. Please try again.',
      [ErrorCode.EMAIL_SEND_FAILED]: 'Failed to send email. Please try again.',
      [ErrorCode.PAYMENT_GATEWAY_ERROR]: 'Payment gateway error. Please try again.',
      [ErrorCode.VIDEO_PROCESSING_FAILED]: 'Video processing failed. Please try again.',
      [ErrorCode.UNKNOWN_ERROR]: TOAST_MESSAGES.ERROR.GENERIC,
      [ErrorCode.INTERNAL_ERROR]: 'An internal error occurred. Please contact support.'
    }

    return messages[code] || TOAST_MESSAGES.ERROR.GENERIC
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON(): object {
    return {
      error: true,
      code: this.code,
      message: this.userMessage,
      ...(process.env.NODE_ENV === 'development' && {
        details: this.message,
        stack: this.stack
      })
    }
  }
}

/**
 * Authentication related errors
 */
export class AuthError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.UNAUTHORIZED, context: ErrorContext = {}) {
    super(message, code, 401, context)
  }
}

/**
 * Validation related errors
 */
export class ValidationError extends AppError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, context)
  }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', context: ErrorContext = {}) {
    super(`${resource} not found`, ErrorCode.NOT_FOUND, 404, context, true, `${resource} not found.`)
  }
}

/**
 * Payment related errors
 */
export class PaymentError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.PAYMENT_FAILED, context: ErrorContext = {}) {
    super(message, code, 400, context)
  }
}

/**
 * File upload related errors
 */
export class FileError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.UPLOAD_FAILED, context: ErrorContext = {}) {
    super(message, code, 400, context)
  }
}

/**
 * Network related errors
 */
export class NetworkError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.NETWORK_ERROR, context: ErrorContext = {}) {
    super(message, code, 503, context)
  }
}

/**
 * Error handler utility class
 */
export class ErrorHandler {
  /**
   * Handle different types of errors and convert to AppError
   */
  static handle(error: unknown, context: ErrorContext = {}): AppError {
    if (error instanceof AppError) {
      return error
    }

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('Failed to fetch')) {
        return new NetworkError('Network connection failed', ErrorCode.NETWORK_ERROR, context)
      }

      if (error.message.includes('timeout')) {
        return new NetworkError('Request timed out', ErrorCode.TIMEOUT_ERROR, context)
      }

      // Generic error
      return new AppError(error.message, ErrorCode.UNKNOWN_ERROR, 500, context)
    }

    // Unknown error type
    return new AppError('An unknown error occurred', ErrorCode.UNKNOWN_ERROR, 500, context)
  }

  /**
   * Handle API response errors
   */
  static handleApiError(response: Response, context: ErrorContext = {}): AppError {
    const statusCode = response.status

    switch (statusCode) {
      case 400:
        return new ValidationError('Invalid request data', context)
      case 401:
        return new AuthError('Authentication required', ErrorCode.UNAUTHORIZED, context)
      case 403:
        return new AuthError('Access forbidden', ErrorCode.FORBIDDEN, context)
      case 404:
        return new NotFoundError('Resource', context)
      case 429:
        return new AppError('Too many requests', ErrorCode.SERVER_ERROR, 429, context)
      case 500:
        return new AppError('Internal server error', ErrorCode.SERVER_ERROR, 500, context)
      default:
        return new AppError(`HTTP ${statusCode} error`, ErrorCode.SERVER_ERROR, statusCode, context)
    }
  }

  /**
   * Format error for user display
   */
  static formatForUser(error: AppError): { message: string; type: 'error' | 'warning' | 'info' } {
    return {
      message: error.userMessage,
      type: error.statusCode >= 500 ? 'error' : 'warning'
    }
  }
}

/**
 * Global error boundary error
 */
export class ErrorBoundaryError extends AppError {
  constructor(error: Error, context: ErrorContext = {}) {
    super(
      `React Error Boundary: ${error.message}`,
      ErrorCode.INTERNAL_ERROR,
      500,
      { ...context, originalStack: error.stack }
    )
  }
}

// Export commonly used error creators
export const createAuthError = (message: string, context?: ErrorContext) =>
  new AuthError(message, ErrorCode.UNAUTHORIZED, context)

export const createValidationError = (message: string, context?: ErrorContext) =>
  new ValidationError(message, context)

export const createNotFoundError = (resource: string, context?: ErrorContext) =>
  new NotFoundError(resource, context)

export const createPaymentError = (message: string, context?: ErrorContext) =>
  new PaymentError(message, ErrorCode.PAYMENT_FAILED, context)

export const createFileError = (message: string, context?: ErrorContext) =>
  new FileError(message, ErrorCode.UPLOAD_FAILED, context)