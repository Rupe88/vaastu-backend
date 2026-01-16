-- Supabase Row Level Security Policies
-- Run these after migration to enable database-level security

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_retries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Courses policies
CREATE POLICY "Anyone can view published courses" ON courses
  FOR SELECT USING (status = 'PUBLISHED' OR auth.uid()::text IN (
    SELECT userId FROM users WHERE role = 'ADMIN'
  ));

CREATE POLICY "Instructors can manage their courses" ON courses
  FOR ALL USING (instructorId IN (
    SELECT id FROM instructors WHERE email IN (
      SELECT email FROM users WHERE id = auth.uid()::text
    )
  ));

-- Enrollments policies
CREATE POLICY "Users can view their enrollments" ON enrollments
  FOR SELECT USING (userId = auth.uid()::text);

CREATE POLICY "Users can enroll in courses" ON enrollments
  FOR INSERT WITH CHECK (userId = auth.uid()::text);

-- Payments policies
CREATE POLICY "Users can view their payments" ON payments
  FOR SELECT USING (userId = auth.uid()::text);

CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (userId = auth.uid()::text);

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (userId = auth.uid()::text);

-- Orders policies
CREATE POLICY "Users can view their orders" ON orders
  FOR SELECT USING (userId = auth.uid()::text);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (userId = auth.uid()::text);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create reviews for their enrollments" ON reviews
  FOR INSERT WITH CHECK (
    userId = auth.uid()::text AND
    courseId IN (
      SELECT courseId FROM enrollments
      WHERE userId = auth.uid()::text
    )
  );

-- Blog policies
CREATE POLICY "Anyone can view published blogs" ON blogs
  FOR SELECT USING (status = 'PUBLISHED');

CREATE POLICY "Authors can manage their blogs" ON blogs
  FOR ALL USING (authorId = auth.uid()::text);

-- Comments policies
CREATE POLICY "Anyone can view approved comments" ON blog_comments
  FOR SELECT USING (isApproved = true);

CREATE POLICY "Users can create comments" ON blog_comments
  FOR INSERT WITH CHECK (userId = auth.uid()::text);

-- Audit logs (admin only)
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Contact submissions (admin only for viewing)
CREATE POLICY "Admins can view contact submissions" ON contact_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

CREATE POLICY "Anyone can submit contact forms" ON contact_submissions
  FOR INSERT TO anon WITH CHECK (true);

-- Newsletter subscribers
CREATE POLICY "Users can manage their subscription" ON newsletter_subscribers
  FOR ALL USING (email IN (
    SELECT email FROM users WHERE id = auth.uid()::text
  ));

-- Wishlist policies
CREATE POLICY "Users can manage their wishlist" ON wishlist_items
  FOR ALL USING (userId = auth.uid()::text);

-- Cart policies
CREATE POLICY "Users can manage their cart" ON carts
  FOR ALL USING (userId = auth.uid()::text);

CREATE POLICY "Users can manage their cart items" ON cart_items
  FOR ALL USING (cartId IN (
    SELECT id FROM carts WHERE userId = auth.uid()::text
  ));

-- Certificate policies
CREATE POLICY "Users can view their certificates" ON certificates
  FOR SELECT USING (userId = auth.uid()::text);

-- Assignment policies
CREATE POLICY "Users can view assignments for enrolled courses" ON assignments
  FOR SELECT USING (
    courseId IN (
      SELECT courseId FROM enrollments
      WHERE userId = auth.uid()::text
    )
  );

CREATE POLICY "Users can submit assignments" ON assignment_submissions
  FOR ALL USING (userId = auth.uid()::text);

-- Quiz policies
CREATE POLICY "Users can view quizzes for enrolled courses" ON quizzes
  FOR SELECT USING (
    lessonId IN (
      SELECT l.id FROM lessons l
      JOIN enrollments e ON l.courseId = e.courseId
      WHERE e.userId = auth.uid()::text
    )
  );

CREATE POLICY "Users can attempt quizzes" ON quiz_attempts
  FOR ALL USING (userId = auth.uid()::text);

-- Event policies
CREATE POLICY "Anyone can view upcoming events" ON events
  FOR SELECT USING (status IN ('UPCOMING', 'ONGOING'));

CREATE POLICY "Users can register for events" ON event_registrations
  FOR INSERT WITH CHECK (userId = auth.uid()::text);

-- Gallery policies (public read)
CREATE POLICY "Anyone can view gallery" ON gallery
  FOR SELECT TO authenticated USING (isPublished = true);

-- FAQ policies (public read)
CREATE POLICY "Anyone can view FAQs" ON faqs
  FOR SELECT TO authenticated USING (isActive = true);

-- Testimonial policies (public read)
CREATE POLICY "Anyone can view testimonials" ON testimonials
  FOR SELECT TO authenticated USING (isPublished = true);

-- Success stories policies (public read)
CREATE POLICY "Anyone can view success stories" ON student_success_stories
  FOR SELECT TO authenticated USING (isPublished = true);

-- Product policies
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (status = 'ACTIVE');

-- Coupon policies (admin only for management)
CREATE POLICY "Admins can manage coupons" ON coupons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Expense policies (admin only)
CREATE POLICY "Admins can manage expenses" ON expenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Instructor earnings policies
CREATE POLICY "Instructors can view their earnings" ON instructor_earnings
  FOR SELECT USING (instructorId IN (
    SELECT id FROM instructors WHERE email IN (
      SELECT email FROM users WHERE id = auth.uid()::text
    )
  ));

-- Transaction policies (admin and accountants)
CREATE POLICY "Admins can view transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Affiliate policies
CREATE POLICY "Users can view their affiliate data" ON affiliates
  FOR SELECT USING (userId = auth.uid()::text);

CREATE POLICY "Affiliates can view their earnings" ON affiliate_earnings
  FOR SELECT USING (affiliateId IN (
    SELECT userId FROM affiliates WHERE userId = auth.uid()::text
  ));

-- Live class policies
CREATE POLICY "Users can view live classes for enrolled courses" ON live_classes
  FOR SELECT USING (
    courseId IN (
      SELECT courseId FROM enrollments
      WHERE userId = auth.uid()::text
    ) OR instructorId IN (
      SELECT id FROM instructors WHERE email IN (
        SELECT email FROM users WHERE id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can enroll in live classes" ON live_class_enrollments
  FOR ALL USING (userId = auth.uid()::text);

-- Consultation policies
CREATE POLICY "Admins can manage consultations" ON consultations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

CREATE POLICY "Anyone can submit consultations" ON consultations
  FOR INSERT TO anon WITH CHECK (true);
