# 📚 Mathematics Learning Management System

A modern, comprehensive Learning Management System built specifically for mathematics education. This platform provides a complete solution for course creation, student enrollment, progress tracking, and certificate generation.

## 🚀 Features

### 🎓 **Learning Management**
- **Interactive Course Player**: Video lessons with progress tracking and note-taking
- **Progress Tracking**: Real-time lesson completion and course progress monitoring
- **Certificate Generation**: Automatic PDF certificate generation upon course completion
- **Assignment Submission**: File upload system with multiple format support

### 💳 **Payment Processing**
- **Multiple Payment Methods**: Stripe, PayHere, and bank transfer support
- **Currency Support**: USD, LKR, and INR with automatic conversion
- **Secure Transactions**: PCI-compliant payment processing with webhook verification

### 👨‍💼 **Administration**
- **Course Management**: Create, edit, and manage courses and lessons
- **User Management**: Student enrollment, instructor management, and admin controls
- **Analytics Dashboard**: Course performance, student progress, and revenue analytics
- **Email System**: Automated notifications and communication tools

### 🔐 **Security & Authentication**
- **Multi-factor Authentication**: Secure login with session management
- **Role-based Access Control**: Student, instructor, and admin permission levels
- **Data Encryption**: Sensitive data protection with industry standards

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom component library with accessibility features
- **Animations**: Framer Motion for smooth interactions
- **State Management**: React Context with optimized patterns

### **Backend**
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Authentication**: Supabase Auth with custom middleware
- **File Storage**: Supabase Storage for media files
- **Email**: Nodemailer with SMTP configuration
- **PDF Generation**: PDFKit for certificates and invoices

### **DevOps & Quality**
- **Type Checking**: TypeScript with strict configuration
- **Linting**: ESLint with Next.js and TypeScript rules
- **Testing**: Jest with React Testing Library
- **Code Formatting**: Prettier with consistent rules
- **Error Handling**: Comprehensive error boundary system
- **Logging**: Structured logging with performance monitoring

## 📋 Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **Database**: Supabase account or PostgreSQL database
- **Email Service**: SMTP configuration for notifications

## 🚀 Quick Start

### 1. **Clone and Install**
```bash
git clone <repository-url>
cd mathematics-lms
npm install
```

### 2. **Environment Configuration**
Copy the environment template and configure your settings:

```bash
cp .env.example .env.local
```

Configure the following environment variables:

```env
# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Settings
NEXT_PUBLIC_APP_NAME="Mathematics LMS"
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Payment Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_PAYHERE_MERCHANT_ID=your_payhere_merchant_id

# Email Configuration
SMTP_HOST=your_smtp_host
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Contact Information
NEXT_PUBLIC_WHATSAPP_NUMBER=your_whatsapp_number
NEXT_PUBLIC_ADMIN_WHATSAPP=admin_whatsapp_number
```

### 3. **Database Setup**
Initialize your database with the required tables:

```bash
npm run db:setup
```

### 4. **Development Server**
Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
mathematics-lms/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── api/               # API routes
│   │   ├── courses/           # Course pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── forms/            # Form components
│   │   ├── course/           # Course-specific components
│   │   └── admin/            # Admin components
│   ├── lib/                   # Core utilities
│   │   ├── supabase.ts       # Database client
│   │   ├── errors.ts         # Error handling
│   │   ├── logger.ts         # Logging system
│   │   └── validations.ts    # Input validation schemas
│   ├── utils/                 # Utility functions
│   ├── types/                 # TypeScript type definitions
│   ├── constants/             # Application constants
│   └── config/               # Configuration files
├── public/                    # Static assets
├── styles/                   # Global styles
└── tests/                    # Test files
```

## 🧪 Testing

### **Run Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### **Test Structure**
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API route and database testing
- **E2E Tests**: Full user journey testing

## 🚀 Deployment

### **Production Build**
```bash
npm run build
npm start
```

### **Environment Variables**
Ensure all production environment variables are configured:
- Database connection strings
- Payment gateway credentials
- Email service configuration
- Security keys and tokens

### **Database Migration**
Run database setup in production:
```bash
npm run db:setup:prod
```

## 📚 API Documentation

### **Authentication Endpoints**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### **Course Management**
- `GET /api/courses` - List courses with filtering
- `POST /api/courses` - Create new course (Admin only)
- `GET /api/courses/[id]` - Get course details
- `PUT /api/courses/[id]` - Update course (Admin only)

### **Progress Tracking**
- `POST /api/lessons/progress` - Update lesson progress
- `GET /api/courses/[id]/progress` - Get course progress

### **Payment Processing**
- `POST /api/payments/create-checkout` - Create Stripe checkout
- `POST /api/payments/payhere` - Process PayHere payment
- `POST /api/payments/webhook` - Payment webhooks

## 🎨 Component Library

The project includes a comprehensive UI component library:

### **Core Components**
- **Button**: Multiple variants with loading states
- **Input**: Form inputs with validation
- **Card**: Flexible content containers
- **Modal**: Accessible dialog components
- **Typography**: Consistent text components

### **Form Components**
- **FormField**: Generic form field wrapper
- **LoginForm**: Authentication form
- **CourseForm**: Course creation/editing

### **Usage Example**
```tsx
import { Button, Card, Input } from '@/components/ui'

function MyComponent() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Login</Card.Title>
      </Card.Header>
      <Card.Body>
        <Input label="Email" type="email" required />
        <Button variant="primary" fullWidth>
          Sign In
        </Button>
      </Card.Body>
    </Card>
  )
}
```

## 🔧 Configuration

### **Next.js Configuration**
The project uses Next.js 15 with App Router and the following optimizations:
- Image optimization for course thumbnails
- Automatic code splitting
- Environment variable validation
- Custom webpack configuration for PDF generation

### **TypeScript Configuration**
Strict TypeScript configuration with:
- Path mapping for clean imports
- Comprehensive type checking
- Integration with Next.js types

### **Tailwind Configuration**
Custom design system with:
- Mathematics education color palette
- Responsive breakpoints
- Custom animations and transitions
- Dark mode support

## 📊 Performance

### **Optimization Features**
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component with Supabase CDN
- **Caching**: API response caching with revalidation
- **Bundle Analysis**: Webpack bundle analyzer integration

### **Performance Metrics**
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 3s
- **Time to Interactive**: < 4s
- **Cumulative Layout Shift**: < 0.1

## 🛡️ Security

### **Security Features**
- **Input Validation**: Zod schema validation for all inputs
- **SQL Injection Protection**: Parameterized queries with Supabase
- **XSS Prevention**: Input sanitization and output encoding
- **CSRF Protection**: Token-based request validation
- **Rate Limiting**: API endpoint protection against abuse

### **Data Protection**
- **Encryption**: Sensitive data encryption at rest and in transit
- **Access Control**: Role-based permissions with middleware
- **Audit Logging**: Comprehensive activity logging
- **Privacy Compliance**: GDPR and CCPA compliant data handling

## 🚨 Troubleshooting

### **Common Issues**

1. **Environment Variables**: Ensure all required variables are set
2. **Database Connection**: Verify Supabase credentials and network access
3. **Payment Issues**: Check payment gateway configuration and webhooks
4. **Email Delivery**: Verify SMTP settings and authentication

### **Debugging**
- Check browser console for client-side errors
- Review server logs for API errors
- Use development tools for database queries
- Enable debug logging in development mode

## 🤝 Contributing

### **Development Guidelines**
1. Follow TypeScript strict mode requirements
2. Write comprehensive tests for new features
3. Update documentation for API changes
4. Follow established code formatting and linting rules
5. Ensure accessibility compliance for UI components

### **Pull Request Process**
1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Ensure all tests pass
5. Submit a pull request with detailed description

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Email**: support@mathematicslms.com
- **Documentation**: [docs.mathematicslms.com](https://docs.mathematicslms.com)
- **Community**: [Discord Server](https://discord.gg/mathematicslms)

---

Built with ❤️ for mathematics education