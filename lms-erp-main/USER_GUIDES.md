# Arohak LMS User Guides

## Table of Contents
1. [Admin User Guide](#admin-user-guide)
2. [Employee User Guide](#employee-user-guide)
3. [Troubleshooting Guide](#troubleshooting-guide)

---

## Admin User Guide

### 1. Getting Started

#### Login Process
1. Navigate to `http://localhost:3000/login`
2. Enter your admin credentials
3. Click "Sign In" button
4. You'll be redirected to the admin dashboard

#### Dashboard Overview
- **Statistics Cards**: Total courses, users, enrollments, certificates
- **Quick Actions**: Create new course, view recent activity
- **Navigation**: Access all admin functions

### 2. Course Management

#### Creating a New Course

**Step 1: Basic Information**
1. Click "Create Course" from dashboard
2. Fill in required fields:
   ```
   Title: [Course Name]
   Description: [Detailed course description]
   Category: [Select appropriate category]
   Level: [Beginner/Intermediate/Advanced]
   Language: [Course language]
   Passing Score: [Minimum quiz percentage, default 70%]
   ```
3. Upload course thumbnail (recommended size: 800x600px)
4. Set course video URL (optional)
5. Set course price (default: 0 for free)
6. Click "Create Course"

**Step 2: Course Structure**
1. After creation, you'll be redirected to course edit page
2. Click "Add Section" to create course modules
3. For each section:
   - Enter section title
   - Click "Add Section"
4. For each section, add lessons:
   - Click "Add Lesson"
   - Enter lesson title
   - Add video URLs:
     - YouTube URL: `https://www.youtube.com/watch?v=VIDEO_ID`
     - SharePoint URL: Direct link to video
     - Google Drive URL: Shareable link
   - Upload lesson documents (PDFs, presentations, etc.)
   - Click "Add Lesson"

**Step 3: Assessment Creation**
1. Click "Add Quiz" button
2. Set quiz details:
   ```
   Quiz Title: [Descriptive quiz name]
   Passing Score: [Minimum percentage to pass]
   ```
3. Add questions:
   - Enter question text
   - Provide 4 answer options
   - Select correct answer (1-4)
   - Click "Add Question" for more questions
4. Click "Add Quiz" when complete

**Step 4: Publishing**
1. Review all course content
2. Test all video links and documents
3. Click "Publish" button
4. Course becomes available to employees

#### Editing Existing Courses

**Quick Edit Mode**
1. Navigate to course edit page
2. Click "Edit Course" button
3. Modify any course settings:
   - Title, description, category
   - Level, language, passing score
   - Video URL, price
   - Upload new thumbnail
4. Click "Save Changes"

**Structure Editing**
1. Add/remove sections as needed
2. Edit lesson content and URLs
3. Update quiz questions and answers
4. Changes are saved automatically

#### Managing Enrollments

**View Student Progress**
1. Navigate to course edit page
2. View enrolled students list
3. Monitor individual progress:
   - Lessons completed
   - Quiz scores
   - Time spent on course

**Course Analytics**
1. Check dashboard statistics
2. Review course completion rates
3. Identify popular courses
4. Track student engagement

### 3. User Management

#### Viewing User Statistics
- Total registered users
- Active enrollments
- Course completion rates
- Certificate issuances

#### User Support
- Reset user passwords
- Troubleshoot login issues
- Assist with course access
- Monitor user activity

---

## Employee User Guide

### 1. Getting Started

#### Registration Process
1. Navigate to `http://localhost:3000/register`
2. Fill in registration form:
   ```
   Full Name: [Your complete name]
   Email: [Your work email]
   Password: [Strong password]
   Confirm Password: [Re-enter password]
   ```
3. Click "Create Account"
4. Check email for welcome message
5. Navigate to login page

#### Login Process
1. Go to `http://localhost:3000/login`
2. Enter your email and password
3. Click "Sign In" button
4. You'll be redirected to your dashboard

### 2. Course Enrollment

#### Browsing Courses
1. From dashboard, click "Browse Courses"
2. Use filters to narrow down options:
   - Category filter
   - Level filter
   - Search by keywords
3. Click on any course to view details

#### Course Information
Each course displays:
- **Title and Description**: Course overview
- **Instructor**: Course creator information
- **Level**: Difficulty level
- **Duration**: Estimated completion time
- **Structure**: Number of sections and lessons
- **Reviews**: Student feedback (if available)

#### Enrolling in a Course
1. Find a course you're interested in
2. Click "Enroll Now" button
3. Confirmation message appears
4. Course appears in your dashboard

### 3. Learning Process

#### Accessing Course Content
1. From dashboard, click on enrolled course
2. View course structure:
   - Sections organize related lessons
   - Lessons contain video content and materials
3. Click on any lesson to start

#### Completing Lessons
1. **Video Content**: Watch embedded videos
   - YouTube videos play directly in the player
   - SharePoint/Google Drive links open in new tabs
2. **Download Materials**: Access supporting documents
   - Click download links for PDFs, presentations
   - Save materials for offline reference
3. **Mark Complete**: Lesson automatically marked as complete

#### Taking Quizzes
1. After completing lessons, take section quizzes
2. Quiz format:
   - Multiple choice questions
   - Select one correct answer
   - Submit when complete
3. **Results**: Immediate feedback on score
4. **Retakes**: Available if you don't pass

#### Tracking Progress
Your dashboard shows:
- **Enrollment Status**: Active courses
- **Progress Percentage**: Completion rate
- **Quiz Scores**: Assessment results
- **Time Spent**: Learning duration

### 4. Certification

#### Earning Certificates
1. Complete all course lessons
2. Pass final assessment with required score
3. Certificate automatically generated
4. Email notification sent with certificate

#### Viewing Certificates
1. Navigate to "Certificates" section
2. View all earned certificates
3. Download PDF versions
4. Share certificate links

#### Certificate Details
Each certificate includes:
- Your name and employee ID
- Course title and completion date
- Final score and instructor name
- Unique certificate ID for verification

### 5. Profile Management

#### Updating Personal Information
1. Navigate to profile settings
2. Update:
   - Name
   - Department
   - Employee ID
3. Click "Save Changes"

#### Password Management
1. Use "Forgot Password" link if needed
2. Check email for reset link
3. Create new strong password
4. Confirm new password

---

## Troubleshooting Guide

### 1. Common Login Issues

#### Problem: Cannot login
**Solutions:**
- Check email and password spelling
- Ensure Caps Lock is off
- Use "Forgot Password" to reset
- Contact admin if account is locked

#### Problem: Account not found
**Solutions:**
- Verify email address is correct
- Check if account was properly registered
- Contact admin for account creation

### 2. Course Content Issues

#### Problem: Videos not playing
**Solutions:**
- Check internet connection
- Try refreshing the page
- Clear browser cache
- Try different browser
- Contact admin if video link is broken

#### Problem: Documents not downloading
**Solutions:**
- Check file permissions
- Try right-click and "Save link as"
- Disable popup blockers
- Contact admin if file is corrupted

#### Problem: Quiz not submitting
**Solutions:**
- Answer all required questions
- Check internet connection
- Refresh page and try again
- Contact admin if quiz has technical issues

### 3. Certificate Issues

#### Problem: Certificate not generated
**Solutions:**
- Ensure all lessons are complete
- Verify passing score achieved
- Check if course is published
- Contact admin for manual certificate generation

#### Problem: Certificate not displaying
**Solutions:**
- Refresh the certificates page
- Check email for certificate notification
- Try downloading certificate PDF
- Contact admin for certificate resend

### 4. Admin Issues

#### Problem: Cannot create course
**Solutions:**
- Verify admin permissions
- Check all required fields are filled
- Ensure thumbnail image is valid format
- Check internet connection

#### Problem: Course not publishing
**Solutions:**
- Ensure course has required content
- Check if all sections have lessons
- Verify quiz is properly configured
- Try publishing again

#### Problem: Users cannot enroll
**Solutions:**
- Ensure course is published
- Check course visibility settings
- Verify user accounts are active
- Contact users to try enrollment again

### 5. Technical Issues

#### Problem: Slow loading pages
**Solutions:**
- Check internet connection speed
- Clear browser cache and cookies
- Disable browser extensions
- Try different browser

#### Problem: File upload failures
**Solutions:**
- Check file size limits
- Ensure file format is supported
- Check internet connection stability
- Try smaller file sizes

#### Problem: Email notifications not received
**Solutions:**
- Check spam/junk folders
- Verify email address is correct
- Contact admin to check email configuration
- Add sender to safe sender list

### 6. Browser Compatibility

#### Recommended Browsers
- **Chrome**: Latest version
- **Firefox**: Latest version
- **Safari**: Latest version
- **Edge**: Latest version

#### Browser Settings
- Enable JavaScript
- Allow cookies
- Disable popup blockers for this site
- Keep browser updated

### 7. Contact Support

#### When to Contact Admin
- Account access issues
- Course content problems
- Certificate issues
- Technical difficulties

#### Information to Provide
- Your name and email
- Course name (if applicable)
- Description of issue
- Steps you've already tried
- Browser and device information

#### Support Channels
- Email: admin@arohak.com
- Internal messaging system
- Phone: [Admin contact number]

---

*This guide provides comprehensive instructions for both admin and employee users. For additional help, contact your system administrator.*
