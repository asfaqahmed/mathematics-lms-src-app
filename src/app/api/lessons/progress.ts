import { supabase } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

/**
 * API endpoint for tracking lesson progress and completion
 *
 * POST /api/lessons/progress
 * Body: {
 *   lesson_id: string,
 *   user_id: string,
 *   progress_percentage: number,
 *   watch_time: number,
 *   completed: boolean
 * }
 */
export async function POST(request) {
  try {
    const {
      lesson_id,
      user_id,
      progress_percentage = 0,
      watch_time = 0,
      completed = false,
      course_id
    } = await request.json()

    // Validate required fields
    if (!lesson_id || !user_id) {
      return NextResponse.json({
        error: 'Missing required fields: lesson_id, user_id'
      }, { status: 400 })
    }

    // Check if user has access to this lesson's course
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('id, course_id')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .eq('access_granted', true)
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: 'Access denied to this course' }, { status: 403 })
    }

    // Upsert lesson progress
    const { data: progress, error: progressError } = await supabase
      .from('lesson_progress')
      .upsert({
        lesson_id,
        user_id,
        progress_percentage: Math.min(100, Math.max(0, progress_percentage)),
        watch_time,
        completed,
        last_watched_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'lesson_id,user_id'
      })
      .select()
      .single()

    if (progressError) {
      console.error('Error updating lesson progress:', progressError)
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
    }

    // If lesson is completed, check if course is completed
    if (completed && course_id) {
      await checkCourseCompletion(user_id, course_id)
    }

    return NextResponse.json({
      success: true,
      progress: progress
    })

  } catch (error) {
    console.error('Progress tracking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Check if a course is completed by the user
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 */
async function checkCourseCompletion(userId, courseId) {
  try {
    // Get all lessons in the course
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)
      .eq('is_published', true)

    if (lessonsError || !lessons) {
      console.error('Error fetching course lessons:', lessonsError)
      return
    }

    // Get user's progress for all lessons
    const { data: completedLessons, error: progressError } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('completed', true)
      .in('lesson_id', lessons.map(l => l.id))

    if (progressError) {
      console.error('Error fetching lesson progress:', progressError)
      return
    }

    // Check if all lessons are completed
    const totalLessons = lessons.length
    const completedCount = completedLessons?.length || 0

    if (totalLessons > 0 && completedCount === totalLessons) {
      // Mark course as completed
      const { error: completionError } = await supabase
        .from('course_completions')
        .upsert({
          user_id: userId,
          course_id: courseId,
          completed_at: new Date().toISOString(),
          completion_percentage: 100
        }, {
          onConflict: 'user_id,course_id'
        })

      if (completionError) {
        console.error('Error marking course as completed:', completionError)
      } else {
        console.log(`Course ${courseId} completed by user ${userId}`)
      }
    }
  } catch (error) {
    console.error('Error checking course completion:', error)
  }
}