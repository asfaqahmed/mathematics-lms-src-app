import { supabase } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        lessons (id, title, duration)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Add lesson count and total duration
    const coursesWithStats = courses.map(course => ({
      ...course,
      lesson_count: course.lessons?.length || 0,
      total_duration: course.lessons?.reduce((acc, lesson) => acc + (lesson.duration || 0), 0) || 0
    }))

    return NextResponse.json({ courses: coursesWithStats })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const {
      title,
      description,
      price,
      category,
      level,
      thumbnail,
      preview_video,
      what_you_learn,
      requirements,
      status = 'draft'
    } = await request.json()

    // Validate required fields
    if (!title || !description || !price || !category || !level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        title,
        description,
        price: parseInt(price),
        category,
        level,
        thumbnail,
        preview_video,
        what_you_learn: Array.isArray(what_you_learn) ? what_you_learn : [],
        requirements: Array.isArray(requirements) ? requirements : [],
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ course }, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}