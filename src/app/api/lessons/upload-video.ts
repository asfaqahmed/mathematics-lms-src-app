import { supabase } from '@/lib/supabase-admin'
import { isAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { user_id, video_data, filename } = await request.json()

    // Verify admin access
    if (!user_id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const adminStatus = await isAdmin(user_id)
    if (!adminStatus) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    if (!video_data || !filename) {
      return NextResponse.json({ error: 'Video data and filename are required' }, { status: 400 })
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(video_data, 'base64')

    // Generate unique filename
    const fileExt = filename.split('.').pop()
    const uniqueFilename = `video-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `lessons/videos/${uniqueFilename}`

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, buffer, {
        contentType: `video/${fileExt}`,
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: 'Failed to upload video', details: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
      path: filePath
    })

  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json({ error: 'Failed to upload video', details: error.message }, { status: 500 })
  }
}