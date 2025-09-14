import { supabase } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test lessons query
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('*')
      .limit(5)

    if (error) {
      return NextResponse.json({
        error: 'Lessons query failed',
        details: error,
        message: error.message
      }, { status: 400 })
    }

    // Test courses query
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')
      .limit(3)

    if (coursesError) {
      return NextResponse.json({
        error: 'Courses query failed',
        details: coursesError
      }, { status: 400 })
    }

    // Test payments table structure
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .limit(1)

    // Test enrollments table
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('*')
      .limit(1)

    return NextResponse.json({
      lessons: {
        count: lessons?.length || 0,
        data: lessons,
        error: null
      },
      courses: {
        count: courses?.length || 0,
        data: courses,
        error: null
      },
      payments: {
        count: payments?.length || 0,
        error: paymentsError?.message || null
      },
      enrollments: {
        count: enrollments?.length || 0,
        error: enrollmentsError?.message || null
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error',
      details: error.message
    }, { status: 500 })
  }
}