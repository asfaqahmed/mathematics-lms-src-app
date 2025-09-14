'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi'
import { supabase } from '@/lib/supabase'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CourseCard from '@/components/course/CourseCard'
import { useUser } from '../layout'

export default function Courses() {
  const { user } = useUser()
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Algebra', label: 'Algebra' },
    { value: 'Calculus', label: 'Calculus' },
    { value: 'Geometry', label: 'Geometry' },
    { value: 'Statistics', label: 'Statistics' },
    { value: 'Trigonometry', label: 'Trigonometry' }
  ]

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-250000', label: 'Under LKR 2,500' },
    { value: '250000-500000', label: 'LKR 2,500 - 5,000' },
    { value: '500000-750000', label: 'LKR 5,000 - 7,500' },
    { value: '750000+', label: 'Above LKR 7,500' }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ]

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    filterAndSortCourses()
  }, [courses, searchTerm, selectedCategory, priceRange, sortBy])

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortCourses = () => {
    let filtered = [...courses]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory)
    }

    // Price filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.includes('+')
        ? [parseInt(priceRange.replace('+', '')), Infinity]
        : priceRange.split('-').map(p => parseInt(p))

      filtered = filtered.filter(course => {
        const price = course.price
        return price >= min && (max === Infinity || price <= max)
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'popular':
          return (b.enrollments || 0) - (a.enrollments || 0)
        default:
          return 0
      }
    })

    setFilteredCourses(filtered)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <Header user={user} />

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
              Explore Our <span className="gradient-text">Courses</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Master mathematics with our comprehensive course catalog designed by expert educators
            </p>
          </motion.div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            {/* Price Range */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="input"
            >
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Results Info */}
          <div className="flex justify-between items-center mb-8">
            <p className="text-gray-400">
              Showing {filteredCourses.length} of {courses.length} courses
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'text-primary-400' : 'text-gray-400'}`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'text-primary-400' : 'text-gray-400'}`}
              >
                <FiList />
              </button>
            </div>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className={`grid gap-8 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-4xl mx-auto'}`}>
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
                <p className="text-gray-400">Try adjusting your search criteria</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}