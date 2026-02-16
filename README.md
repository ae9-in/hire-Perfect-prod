# Hireperfect - AI-Enabled Proctored Assessment Platform

A production-ready full-stack web application for conducting secure, AI-monitored online assessments with real-time cheating prevention and performance analytics.

![Hireperfect](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-green?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwind-css)

## 🚀 Features

### 🔐 Secure Authentication
- JWT-based authentication
- Role-based access control (Admin & Candidate)
- Password hashing with bcrypt
- Forgot password functionality

### 🎯 Assessment System
- **6 Categories** with **36 Assessments** (6 per category)
  - Soft Skills
  - Programming Fundamentals
  - IT Specializations
  - MBA Core
  - Data & Analytics
  - Corporate Readiness
- MCQ, Scenario-based, and Coding questions
- 30-minute timed exams
- Question randomization
- Auto-submit on timeout

### 🤖 AI Proctoring
- Real-time webcam monitoring
- Face detection using MediaPipe
- Eye tracking and head movement detection
- Multiple face detection
- Tab switch detection
- Screen minimize detection
- Violation warning system
- Auto-termination after 5 violations

### 🔒 Security Features
- Full-screen enforcement
- Right-click disabled
- Copy-paste prevention
- Developer tools blocked
- Keyboard shortcut locks
- Screen capture prevention

### 💰 Payment Integration
- Razorpay integration
- Three pricing tiers:
  - Individual Assessment: ₹500
  - Category Combo (6 assessments): ₹1000
  - Full Bundle (36 assessments): ₹4000
- Secure payment verification
- Transaction history

### 📊 Analytics & Reporting
- Performance tracking
- Score breakdowns
- Violation logs
- Attempt history
- Admin analytics dashboard

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4

**Backend:**
- Next.js API Routes
- Node.js
- MongoDB with Mongoose

**Authentication:**
- JWT (jsonwebtoken)
- bcryptjs

**Payment:**
- Razorpay

**AI/ML:**
- MediaPipe (Face Detection)
- TensorFlow.js

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB installed locally or MongoDB Atlas account
- Razorpay account (for payments)

### Setup Steps

1. **Clone the repository**
```bash
cd hireperfect
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/hireperfect
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hireperfect

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

4. **Seed the database**
```bash
npm run seed
```

This will create:
- Admin user: `admin@hireperfect.com` / `admin123`
- Test candidate: `candidate@test.com` / `test123`
- 6 categories
- 36 assessments
- Sample questions for each assessment

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 Usage

### For Candidates

1. **Sign Up / Login**
   - Create an account or login with test credentials
   - Email: `candidate@test.com`
   - Password: `test123`

2. **Purchase Assessments**
   - Browse available assessments
   - Choose individual, category combo, or full bundle
   - Complete payment via Razorpay

3. **Take Assessments**
   - Start an exam
   - Grant webcam permissions for proctoring
   - Complete within 30 minutes
   - Submit and view results

### For Admins

1. **Login**
   - Email: `admin@hireperfect.com`
   - Password: `admin123`

2. **Manage Platform**
   - View all users
   - Manage categories and assessments
   - Add/edit questions
   - Monitor violations
   - View analytics and revenue

## 📁 Project Structure

```
hireperfect/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── assessments/       # Assessment endpoints
│   │   ├── payment/           # Payment endpoints
│   │   └── violations/        # Violation logging
│   ├── dashboard/             # Candidate dashboard
│   ├── exam/                  # Exam interface
│   ├── login/                 # Login page
│   ├── signup/                # Signup page
│   └── page.tsx               # Landing page
├── components/
│   ├── ui/                    # Reusable UI components
│   └── exam/                  # Exam-specific components
├── lib/
│   ├── db.ts                  # MongoDB connection
│   ├── auth.ts                # Authentication utilities
│   ├── razorpay.ts            # Payment integration
│   └── constants.ts           # App constants
├── models/                    # Mongoose models
│   ├── User.ts
│   ├── Category.ts
│   ├── Assessment.ts
│   ├── Question.ts
│   ├── Purchase.ts
│   ├── Attempt.ts
│   ├── Violation.ts
│   └── Transaction.ts
├── middleware/
│   └── auth.ts                # Auth middleware
└── scripts/
    └── seed.ts                # Database seeding
```

## 🎨 UI/UX Features

- Modern SaaS design with blue-purple gradient theme
- Dark mode support
- Glassmorphism effects
- Smooth animations and transitions
- Fully responsive design
- Professional dashboard cards
- Real-time feedback

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Assessments
- `GET /api/assessments` - List assessments with access control
- `POST /api/assessments/[id]/start` - Start exam attempt
- `POST /api/assessments/[id]/submit` - Submit exam answers

### Payments
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment signature

### Violations
- `POST /api/violations/log` - Log proctoring violation

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
# Build image
docker build -t hireperfect .

# Run container
docker run -p 3000:3000 --env-file .env.local hireperfect
```

### Environment Variables for Production

Make sure to set these in your deployment platform:
- `MONGODB_URI` - Production MongoDB connection string
- `JWT_SECRET` - Strong secret key
- `RAZORPAY_KEY_ID` - Live Razorpay key
- `RAZORPAY_KEY_SECRET` - Live Razorpay secret
- `NEXT_PUBLIC_APP_URL` - Production URL
- `NODE_ENV=production`

## 📝 Database Schema

### User
- Email, password (hashed), name, role, phone
- Reset password token and expiry

### Category
- Name, slug, description, order, active status

### Assessment
- Title, description, category reference
- Duration, price, total questions, passing score
- Difficulty, tags

### Question
- Assessment reference, type (MCQ/Scenario/Coding)
- Question text, options, correct answer
- Explanation, points, difficulty

### Purchase
- User reference, purchase type, amount
- Payment ID, order ID, status

### Attempt
- User and assessment references
- Answers, score, percentage
- Start/end time, violations

### Violation
- Attempt reference, type, severity
- Description, timestamp, metadata

### Transaction
- Razorpay order/payment IDs
- Amount, status, error details

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **JWT Secret**: Use a strong, random secret in production
3. **MongoDB**: Use MongoDB Atlas with IP whitelisting
4. **Razorpay**: Use test keys in development, live keys in production
5. **HTTPS**: Always use HTTPS in production
6. **Rate Limiting**: Consider adding rate limiting for API routes
7. **Input Validation**: All inputs are validated on both client and server

## 🤝 Contributing

This is a production-ready application. For modifications:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For issues or questions:
- Check the documentation
- Review the code comments
- Contact the development team

## 🎯 Roadmap

- [ ] Email integration for password reset
- [ ] Advanced code execution for coding questions
- [ ] Detailed analytics dashboard
- [ ] Export results to PDF
- [ ] Bulk question import
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

**Built with ❤️ using Next.js, TypeScript, and MongoDB**
