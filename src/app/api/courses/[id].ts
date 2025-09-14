import { supabase } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = params

  try {
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        lessons!lessons_course_id_fkey (
          id,
          title,
          description,
          duration,
          video_url,
          order_index,
          is_free
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Sort lessons by order_index
    if (course.lessons) {
      course.lessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    }

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  const { id } = params

  console.log('=== API COURSE UPDATE START ===')
  console.log('Course ID:', id)

  try {
    const body = await request.json()
    console.log('Request body:', body)

    const {
      title,
      description,
      price,
      category,
      level,
      thumbnail,
      intro_video,
      preview_video, // Support both field names for compatibility
      what_you_learn,
      requirements,
      status,
      featured,
      published
    } = body

    const updateData = {
      updated_at: new Date().toISOString()
    }

    // Only update provided fields
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = parseInt(price)
    if (category !== undefined) updateData.category = category
    if (level !== undefined) updateData.level = level
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail
    // Handle both intro_video and preview_video field names
    if (intro_video !== undefined) updateData.intro_video = intro_video
    if (preview_video !== undefined) updateData.intro_video = preview_video
    if (what_you_learn !== undefined) updateData.what_you_learn = Array.isArray(what_you_learn) ? what_you_learn : []
    if (requirements !== undefined) updateData.requirements = Array.isArray(requirements) ? requirements : []
    if (status !== undefined) updateData.status = status
    if (featured !== undefined) updateData.featured = featured
    if (published !== undefined) updateData.published = published

    console.log('Update data to be sent to database:', updateData)

    const { data: course, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    console.log('Database update result:', { data: course, error })

    if (error) {
      console.error('Database update error:', error)
      throw error
    }

    if (!course) {
      console.error('Course not found after update - Course ID:', id)
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    console.log('✅ API course update successful')
    console.log('Updated course:', course)
    console.log('=== API COURSE UPDATE COMPLETED ===')

    return NextResponse.json({ course })
  } catch (error) {
    console.error('=== API COURSE UPDATE FAILED ===')
    console.error('Error details:', error)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Full error object:', JSON.stringify(error, null, 2))

    return NextResponse.json({
      error: 'Failed to update course',
      details: error.message,
      code: error.code
    }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { id } = params

  try {
    // First check if course exists
    const { data: existingCourse, error: fetchError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Delete associated lessons first
    const { error: lessonsError } = await supabase
      .from('lessons')
      .delete()
      .eq('course_id', id)

    if (lessonsError) throw lessonsError

    // Delete the course
    const { error: courseError } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)

    if (courseError) throw courseError

    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}