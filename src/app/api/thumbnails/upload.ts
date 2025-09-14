import { supabase, isAdminServer } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function POST(request) {

  try {
    const { user_id, image_data, filename } = await request.json()

    // Verify admin access
    if (!user_id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const adminStatus = await isAdminServer(user_id)
    if (!adminStatus) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    if (!image_data || !filename) {
      return NextResponse.json({ error: 'Image data and filename are required' }, { status: 400 })
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(image_data, 'base64')
    
    // Generate unique filename
    const fileExt = filename.split('.').pop().toLowerCase()
    const uniqueFilename = `course-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `courses/${uniqueFilename}`

    // Map file extensions to proper MIME types
    const mimeTypeMap = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif'
    }
    
    const contentType = mimeTypeMap[fileExt] || 'image/jpeg'

    console.log(`Uploading to course-thumbnails bucket: ${filePath} (${contentType})`)

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('course-thumbnails')
      .upload(filePath, buffer, {
        contentType: contentType,
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: 'Failed to upload thumbnail', details: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('course-thumbnails')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
      path: filePath
    })

  } catch (error) {
    console.error('Thumbnail upload error:', error)
    return NextResponse.json({ error: 'Failed to upload thumbnail', details: error.message }, { status: 500 })
  }
}