import { supabase } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = params

  try {
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select(`
        *,
        courses (
          id,
          title,
          price
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    return NextResponse.json({ lesson })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  const { id } = params

  try {
    const {
      title,
      description,
      video_url,
      duration,
      order_index,
      is_free,
      content
    } = await request.json()

    const updateData = {
      updated_at: new Date().toISOString()
    }

    // Only update provided fields
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (video_url !== undefined) updateData.video_url = video_url
    if (duration !== undefined) updateData.duration = parseInt(duration)
    if (order_index !== undefined) updateData.order_index = parseInt(order_index)
    if (is_free !== undefined) updateData.is_free = Boolean(is_free)
    if (content !== undefined) updateData.content = content

    const { data: lesson, error } = await supabase
      .from('lessons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    return NextResponse.json({ lesson })
  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { id } = params

  try {
    // First check if lesson exists
    const { data: existingLesson, error: fetchError } = await supabase
      .from('lessons')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    if (!existingLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Delete the lesson
    const { error: deleteError } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return NextResponse.json({ message: 'Lesson deleted successfully' })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 })
  }
}