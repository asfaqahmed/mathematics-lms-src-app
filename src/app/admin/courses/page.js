'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  FiPlus, FiEdit, FiTrash2, FiEye, FiSearch,
  FiBook, FiUsers, FiToggleLeft,
  FiToggleRight, FiMoreVertical, FiVideo, FiFileText
} from 'react-icons/fi'
import { FaRupeeSign } from "react-icons/fa6"
import { supabase, isAdmin } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { useUser } from '../../layout'
import toast from 'react-hot-toast'

export default function AdminCourses() {
  const { user } = useUser()
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState(null)

  useEffect(() => {
    checkAdminAccess()
  }, [user])

  useEffect(() => {
    filterCourses()
  }, [courses, searchTerm, categoryFilter, statusFilter])

  const checkAdminAccess = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const adminStatus = await isAdmin(user.id)
    if (!adminStatus) {
      toast.error('Access denied. Admin only.')
      router.push('/')
      return
    }

    fetchCourses()
  }

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          lessons(count)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Add lesson count and enrollment count
      const coursesWithStats = data.map(course => ({
        ...course,
        lesson_count: course.lessons?.length || 0,
        enrollment_count: Math.floor(Math.random() * 100) + 1 // Mock data
      }))

      setCourses(coursesWithStats)
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = courses

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(course => course.category === categoryFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'published') {
        filtered = filtered.filter(course => course.published)
      } else if (statusFilter === 'draft') {
        filtered = filtered.filter(course => !course.published)
      } else if (statusFilter === 'featured') {
        filtered = filtered.filter(course => course.featured)
      }
    }

    setFilteredCourses(filtered)
  }

  const toggleCourseStatus = async (courseId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ published: !currentStatus })
        .eq('id', courseId)

      if (error) throw error

      setCourses(prev => prev.map(course =>
        course.id === courseId
          ? { ...course, published: !currentStatus }
          : course
      ))

      toast.success(
        `Course ${!currentStatus ? 'published' : 'unpublished'} successfully`
      )
    } catch (error) {
      console.error('Error updating course status:', error)
      toast.error('Failed to update course status')
    }
  }

  const toggleFeaturedStatus = async (courseId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ featured: !currentStatus })
        .eq('id', courseId)

      if (error) throw error

      setCourses(prev => prev.map(course =>
        course.id === courseId
          ? { ...course, featured: !currentStatus }
          : course
      ))

      toast.success(
        `Course ${!currentStatus ? 'featured' : 'unfeatured'} successfully`
      )
    } catch (error) {
      console.error('Error updating featured status:', error)
      toast.error('Failed to update featured status')
    }
  }

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return

    try {
      // First delete related lessons
      const { error: lessonsError } = await supabase
        .from('lessons')
        .delete()
        .eq('course_id', courseToDelete.id)

      if (lessonsError) throw lessonsError

      // Then delete the course
      const { error: courseError } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseToDelete.id)

      if (courseError) throw courseError

      setCourses(prev => prev.filter(course => course.id !== courseToDelete.id))
      setDeleteModalOpen(false)
      setCourseToDelete(null)
      toast.success('Course deleted successfully')
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error('Failed to delete course')
    }
  }

  const formatCurrency = (amount) => {
    return `LKR ${amount.toLocaleString('en-US')}`
  }

  const getStatusBadge = (course) => {
    if (course.featured) return 'badge-warning'
    if (course.published) return 'badge-success'
    return 'badge-secondary'
  }

  const getStatusText = (course) => {
    if (course.featured) return 'Featured'
    if (course.published) return 'Published'
    return 'Draft'
  }

  if (!user) return null

  return (
    <AdminLayout user={user}>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Courses Management
            </h1>
            <p className="text-gray-400">
              Create and manage your course catalog
            </p>
          </div>
          <Link href="/admin/courses/new" className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0">
            <FiPlus />
            <span>Add New Course</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Categories</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="featured">Featured</option>
            </select>

            {/* Stats */}
            <div className="text-sm text-gray-400">
              Showing {filteredCourses.length} of {courses.length} courses
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="table-auto">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Lessons</th>
                    <th>Students</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <motion.tr
                      key={course.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td>
                        <div className="flex items-center space-x-3">
                          {course.thumbnail_url ? (
                            <img
                              src={course.thumbnail_url}
                              alt={course.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
                              <FiBook className="text-primary-400" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-white">
                              {course.title}
                            </h4>
                            <p className="text-sm text-gray-400 line-clamp-1">
                              {course.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary">
                          {course.category}
                        </span>
                      </td>
                      <td className="font-mono text-green-400">
                        {formatCurrency(course.price)}
                      </td>
                      <td>
                        <div className="flex items-center space-x-1">
                          <FiVideo className="text-gray-400" />
                          <span>{course.lesson_count}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-1">
                          <FiUsers className="text-gray-400" />
                          <span>{course.enrollment_count}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(course)}`}>
                          {getStatusText(course)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/courses/${course.id}`}
                            className="text-gray-400 hover:text-white"
                            title="View Course"
                          >
                            <FiEye />
                          </Link>
                          <Link
                            href={`/admin/courses/${course.id}/edit`}
                            className="text-gray-400 hover:text-primary-400"
                            title="Edit Course"
                          >
                            <FiEdit />
                          </Link>
                          <button
                            onClick={() => toggleCourseStatus(course.id, course.published)}
                            className="text-gray-400 hover:text-green-400"
                            title={course.published ? 'Unpublish' : 'Publish'}
                          >
                            {course.published ? <FiToggleRight /> : <FiToggleLeft />}
                          </button>
                          <button
                            onClick={() => {
                              setCourseToDelete(course)
                              setDeleteModalOpen(true)
                            }}
                            className="text-gray-400 hover:text-red-400"
                            title="Delete Course"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <FiBook className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No courses found
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by creating your first course'
                  }
                </p>
                {(!searchTerm && categoryFilter === 'all' && statusFilter === 'all') && (
                  <Link href="/admin/courses/new" className="btn-primary">
                    Create First Course
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Delete Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-dark-800 rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-xl font-semibold text-white mb-4">
                Delete Course
              </h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete "{courseToDelete?.title}"? This action cannot be undone and will also delete all associated lessons.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false)
                    setCourseToDelete(null)
                  }}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCourse}
                  className="btn-danger"
                >
                  Delete Course
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}