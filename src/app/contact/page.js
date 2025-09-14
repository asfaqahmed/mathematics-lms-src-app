'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiMail, FiPhone, FiMapPin, FiSend,
  FiClock, FiMessageSquare, FiUser
} from 'react-icons/fi'
import { FaWhatsapp, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useUser } from '../layout'
import toast from 'react-hot-toast'

export default function Contact() {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const contactInfo = [
    {
      icon: FiMail,
      title: 'Email',
      content: 'support@mathpro.lk',
      link: 'mailto:support@mathpro.lk'
    },
    {
      icon: FiPhone,
      title: 'Phone',
      content: '+94 75 660 5254',
      link: 'tel:+94756605254'
    },
    {
      icon: FaWhatsapp,
      title: 'WhatsApp',
      content: '+94 75 660 5254',
      link: 'https://wa.me/94756605254'
    },
    {
      icon: FiMapPin,
      title: 'Location',
      content: 'Colombo, Sri Lanka',
      link: 'https://maps.google.com'
    }
  ]

  const socialLinks = [
    { icon: FaFacebook, href: 'https://facebook.com', color: 'hover:text-blue-500' },
    { icon: FaTwitter, href: 'https://twitter.com', color: 'hover:text-blue-400' },
    { icon: FaInstagram, href: 'https://instagram.com', color: 'hover:text-pink-500' },
    { icon: FaLinkedin, href: 'https://linkedin.com', color: 'hover:text-blue-600' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Here you would typically send the form data to your API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      toast.success('Message sent successfully! We\'ll get back to you soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <Header user={user} />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16">
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
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Have questions about our courses? Need support? We're here to help you succeed in your mathematical journey.
            </p>
          </motion.div>

          {/* Contact Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="card h-fit"
              >
                <h2 className="text-2xl font-display font-bold text-white mb-6">
                  Contact Information
                </h2>

                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">{info.title}</h3>
                        <a
                          href={info.link}
                          className="text-gray-400 hover:text-primary-400 transition-colors"
                        >
                          {info.content}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Business Hours */}
                <div className="mt-8 p-4 rounded-lg bg-dark-700/50">
                  <div className="flex items-center space-x-3 mb-3">
                    <FiClock className="w-5 h-5 text-primary-400" />
                    <h3 className="font-semibold text-white">Business Hours</h3>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>8:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>9:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="mt-8">
                  <h3 className="font-semibold text-white mb-4">Follow Us</h3>
                  <div className="flex space-x-4">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 rounded-lg bg-dark-700/50 flex items-center justify-center text-gray-400 ${social.color} transition-colors`}
                      >
                        <social.icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="card"
              >
                <h2 className="text-2xl font-display font-bold text-white mb-6">
                  Send us a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="input pl-10"
                          placeholder="Your full name"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="input pl-10"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="input"
                      placeholder="What can we help you with?"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Message
                    </label>
                    <div className="relative">
                      <FiMessageSquare className="absolute left-3 top-3 text-gray-500" />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        className="input pl-10 resize-none"
                        placeholder="Tell us more about your question or concern..."
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {loading ? (
                      <div className="spinner w-5 h-5 border-2"></div>
                    ) : (
                      <>
                        <FiSend />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}