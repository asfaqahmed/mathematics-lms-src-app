import { supabase } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

const sampleCourses = [
  {
    title: 'Advanced Calculus Fundamentals',
    description: 'Master the fundamentals of calculus with comprehensive lessons covering limits, derivatives, and integrals. Perfect for university-level mathematics.',
    price: 750000, // LKR 7,500 in cents
    category: 'Calculus',
    thumbnail: '/api/placeholder/400/300',
    intro_video: 'https://www.youtube.com/watch?v=WUvTyaaNkzM',
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    title: 'Linear Algebra for Engineers',
    description: 'Comprehensive linear algebra course designed for engineering students. Covers matrices, vector spaces, and eigenvalues.',
    price: 650000, // LKR 6,500 in cents
    category: 'Algebra',
    thumbnail: '/api/placeholder/400/300',
    intro_video: 'https://www.youtube.com/watch?v=fNk_zzaMoSs',
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    title: 'Statistics and Probability',
    description: 'Learn statistical analysis and probability theory with real-world applications. Includes hypothesis testing and regression analysis.',
    price: 550000, // LKR 5,500 in cents
    category: 'Statistics',
    thumbnail: '/api/placeholder/400/300',
    intro_video: 'https://www.youtube.com/watch?v=uhxtUt_-GyM',
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    title: 'Geometry and Trigonometry',
    description: 'Comprehensive geometry and trigonometry course covering shapes, angles, and trigonometric functions.',
    price: 450000, // LKR 4,500 in cents
    category: 'Geometry',
    thumbnail: '/api/placeholder/400/300',
    intro_video: 'https://www.youtube.com/watch?v=mhd9FXYdf4s',
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    title: 'Discrete Mathematics',
    description: 'Essential discrete mathematics for computer science students. Covers logic, sets, functions, and graph theory.',
    price: 600000, // LKR 6,000 in cents
    category: 'Algebra',
    thumbnail: '/api/placeholder/400/300',
    intro_video: 'https://www.youtube.com/watch?v=rdXw7Ps9vxc',
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export async function POST() {
  }

  try {
    // Check if courses already exist
    const { data: existingCourses, error: checkError } = await supabase
      .from('courses')
      .select('id')
      .limit(1)

    if (checkError) {
      console.error('Error checking existing courses:', checkError)
      return NextResponse.json({ error: 'Failed to check existing courses', details: checkError }, { status: 500 })
    }

    if (existingCourses && existingCourses.length > 0) {
      return NextResponse.json({
        message: 'Courses already exist in database',
        count: existingCourses.length 
      })
    }

    // Insert sample courses
    const { data, error } = await supabase
      .from('courses')
      .insert(sampleCourses)
      .select()

    if (error) {
      console.error('Error inserting courses:', error)
      return NextResponse.json({ error: 'Failed to insert courses', details: error }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Sample courses created successfully',
      courses: data,
      count: data.length 
    })

  } catch (error) {
    console.error('Seed courses error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}