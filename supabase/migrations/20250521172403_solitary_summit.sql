/*
  # Workshop Management System

  1. New Tables
    - `workshops`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `category` (text, not null)
      - `short_description` (text, not null)
      - `description` (text, not null)
      - `image` (text, not null)
      - `gallery` (text[], default '{}')
      - `video_url` (text)
      - `video_thumbnail` (text)
      - `duration` (text, not null)
      - `capacity` (integer, not null)
      - `target_audience` (text, not null)
      - `difficulty_level` (text, not null)
      - `prerequisites` (text)
      - `learning_outcomes` (text[], default '{}')
      - `equipment_provided` (text[], default '{}')
      - `is_featured` (boolean, default false)
      - `created_at` (timestamptz, default now())
    
    - `workshop_categories`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text, not null)
      - `image` (text, not null)
      - `created_at` (timestamptz, default now())
    
    - `workshop_requests`
      - `id` (uuid, primary key)
      - `institution_name` (text, not null)
      - `institution_type` (text, not null)
      - `contact_name` (text, not null)
      - `contact_email` (text, not null)
      - `contact_phone` (text, not null)
      - `workshop_id` (uuid, references workshops.id)
      - `preferred_dates` (date[], not null)
      - `participants` (integer, not null)
      - `additional_requirements` (text)
      - `status` (text, not null, default 'pending')
      - `admin_response` (text)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to view workshops and categories
    - Add policies for admin users to manage workshops, categories, and requests
    - Add policies for public users to submit workshop requests
*/

-- Create workshops table
CREATE TABLE IF NOT EXISTS workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  short_description text NOT NULL,
  description text NOT NULL,
  image text NOT NULL,
  gallery text[] DEFAULT '{}',
  video_url text,
  video_thumbnail text,
  duration text NOT NULL,
  capacity integer NOT NULL,
  target_audience text NOT NULL,
  difficulty_level text NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  prerequisites text,
  learning_outcomes text[] DEFAULT '{}',
  equipment_provided text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create workshop_categories table
CREATE TABLE IF NOT EXISTS workshop_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  image text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create workshop_requests table
CREATE TABLE IF NOT EXISTS workshop_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name text NOT NULL,
  institution_type text NOT NULL CHECK (institution_type IN ('school', 'college', 'corporate', 'ngo', 'government', 'other')),
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  workshop_id uuid REFERENCES workshops(id),
  preferred_dates date[] NOT NULL,
  participants integer NOT NULL,
  additional_requirements text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_response text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_requests ENABLE ROW LEVEL SECURITY;

-- Policies for workshops table
CREATE POLICY "Anyone can view workshops" 
  ON workshops
  FOR SELECT 
  USING (true);

CREATE POLICY "Admin users can manage workshops" 
  ON workshops
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
  WITH CHECK (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

-- Policies for workshop_categories table
CREATE POLICY "Anyone can view workshop categories" 
  ON workshop_categories
  FOR SELECT 
  USING (true);

CREATE POLICY "Admin users can manage workshop categories" 
  ON workshop_categories
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
  WITH CHECK (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

-- Policies for workshop_requests table
CREATE POLICY "Anyone can submit workshop requests" 
  ON workshop_requests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own workshop requests" 
  ON workshop_requests
  FOR SELECT
  USING (contact_email = auth.email());

CREATE POLICY "Admin users can manage workshop requests" 
  ON workshop_requests
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
  WITH CHECK (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

-- Insert sample workshop categories
INSERT INTO workshop_categories (name, description, image)
VALUES 
  ('Drone & Electronics', 'Hands-on workshops focused on drone building, electronics, and circuit design. Perfect for students and hobbyists interested in hardware development.', 'https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg'),
  ('AI & Robotics', 'Explore the world of artificial intelligence and robotics through practical workshops. Learn to build and program robots with modern AI capabilities.', 'https://images.pexels.com/photos/8566472/pexels-photo-8566472.jpeg'),
  ('STEM Education', 'Educational workshops designed for schools and educational institutions. Covering various aspects of Science, Technology, Engineering, and Mathematics.', 'https://images.pexels.com/photos/8926548/pexels-photo-8926548.jpeg');

-- Insert sample workshops
INSERT INTO workshops (
  title, 
  category, 
  short_description, 
  description, 
  image, 
  gallery, 
  video_url, 
  duration, 
  capacity, 
  target_audience, 
  difficulty_level, 
  prerequisites, 
  learning_outcomes, 
  equipment_provided, 
  is_featured
)
VALUES 
  (
    'Drone Building Workshop',
    'Drone & Electronics',
    'Learn to build and program your own drone from scratch in this hands-on workshop.',
    '<p>This comprehensive drone building workshop takes participants through the entire process of building a functional quadcopter drone from individual components.</p><p>Starting with the basics of drone technology and flight principles, participants will assemble the frame, connect electronic components, configure the flight controller, and finally test their creation.</p><h3>What You Will Learn</h3><ul><li>Understanding drone components and their functions</li><li>Proper assembly techniques and best practices</li><li>Flight controller configuration and calibration</li><li>Basic flight maneuvers and safety protocols</li><li>Troubleshooting common issues</li></ul><p>By the end of this workshop, participants will have built their own functional drone and gained the knowledge to customize and maintain it.</p>',
    'https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg',
    ARRAY['https://images.pexels.com/photos/744366/pexels-photo-744366.jpeg', 'https://images.pexels.com/photos/1601217/pexels-photo-1601217.jpeg', 'https://images.pexels.com/photos/1087180/pexels-photo-1087180.jpeg'],
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    '6 hours (1 day)',
    20,
    'High school and college students, hobbyists, and tech enthusiasts',
    'intermediate',
    'Basic understanding of electronics and soldering experience recommended',
    ARRAY['Build a functional quadcopter drone from scratch', 'Configure and calibrate flight controllers', 'Understand the principles of drone flight and control', 'Troubleshoot common drone issues', 'Perform basic flight maneuvers safely'],
    ARRAY['Drone kits (frame, motors, ESCs, flight controller)', 'Soldering equipment', 'Programming tools and software', 'Safety equipment', 'Testing area'],
    true
  ),
  (
    'Introduction to Robotics',
    'AI & Robotics',
    'A beginner-friendly workshop introducing the fundamentals of robotics and programming.',
    '<p>This introductory robotics workshop is designed for beginners who want to explore the exciting world of robotics. Participants will learn the basics of robot design, construction, and programming.</p><p>The workshop combines theoretical knowledge with hands-on activities, allowing participants to build and program their own simple robot by the end of the session.</p><h3>Workshop Content</h3><ul><li>Introduction to robotics concepts and terminology</li><li>Basic mechanical design principles</li><li>Introduction to sensors and actuators</li><li>Programming robots with block-based and text-based languages</li><li>Simple obstacle avoidance and line-following challenges</li></ul><p>This workshop provides a solid foundation for further exploration in robotics and is suitable for students and hobbyists with no prior experience.</p>',
    'https://images.pexels.com/photos/8566472/pexels-photo-8566472.jpeg',
    ARRAY['https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg', 'https://images.pexels.com/photos/4064432/pexels-photo-4064432.jpeg', 'https://images.pexels.com/photos/8566553/pexels-photo-8566553.jpeg'],
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    '4 hours (half-day)',
    25,
    'Students (ages 12+), beginners, and those curious about robotics',
    'beginner',
    'No prior experience required',
    ARRAY['Understand basic robotics concepts and terminology', 'Build a simple robot from provided components', 'Program a robot to perform basic tasks', 'Troubleshoot common robotics issues', 'Complete simple robotics challenges'],
    ARRAY['Robot kits', 'Programming computers/laptops', 'Sensors and actuators', 'Programming software', 'Challenge materials'],
    true
  ),
  (
    'Advanced Machine Learning for Robotics',
    'AI & Robotics',
    'Explore cutting-edge machine learning techniques for robotic systems in this advanced workshop.',
    '<p>This advanced workshop explores the integration of machine learning techniques with robotic systems. Participants will learn how to implement various ML algorithms to enhance robot perception, decision-making, and autonomy.</p><p>The workshop covers both theoretical concepts and practical implementation, with hands-on sessions using real robotic platforms and ML frameworks.</p><h3>Topics Covered</h3><ul><li>Computer vision for robotics</li><li>Reinforcement learning for robot control</li><li>Natural language processing for human-robot interaction</li><li>Sensor fusion and data processing</li><li>Deployment of ML models on robotic hardware</li></ul><p>Participants will work on mini-projects throughout the workshop, culminating in a final project that demonstrates the application of ML in solving a robotics challenge.</p>',
    'https://images.pexels.com/photos/8566270/pexels-photo-8566270.jpeg',
    ARRAY['https://images.pexels.com/photos/8566414/pexels-photo-8566414.jpeg', 'https://images.pexels.com/photos/8566276/pexels-photo-8566276.jpeg'],
    null,
    '2 days (16 hours)',
    15,
    'College students, researchers, professionals in robotics or AI',
    'advanced',
    'Programming experience (Python), basic understanding of machine learning concepts, and familiarity with robotics',
    ARRAY['Implement computer vision algorithms for robot perception', 'Apply reinforcement learning for robot control tasks', 'Develop natural language interfaces for robots', 'Process and fuse data from multiple sensors', 'Deploy ML models on resource-constrained robotic platforms'],
    ARRAY['Advanced robotic platforms', 'GPU-equipped workstations', 'ML frameworks and libraries', 'Various sensors (cameras, LiDAR, etc.)', 'Development environments'],
    false
  ),
  (
    'STEM for Schools: Electronics Basics',
    'STEM Education',
    'An educational workshop designed for schools to introduce students to the fundamentals of electronics.',
    '<p>This STEM workshop is specifically designed for school students to introduce them to the exciting world of electronics. Through a series of engaging activities and experiments, students will learn the basics of circuits, components, and electronic principles.</p><p>The workshop is highly interactive, with students working in small groups to build simple electronic projects that demonstrate key concepts. Our experienced instructors will guide students through each activity, ensuring a safe and educational experience.</p><h3>Workshop Structure</h3><ul><li>Introduction to basic electronic components</li><li>Understanding circuits and current flow</li><li>Building simple LED circuits</li><li>Creating interactive projects with sensors</li><li>Introduction to microcontrollers</li></ul><p>This workshop aligns with STEM curriculum objectives and can be customized to suit different age groups and educational levels.</p>',
    'https://images.pexels.com/photos/8926548/pexels-photo-8926548.jpeg',
    ARRAY['https://images.pexels.com/photos/6153354/pexels-photo-6153354.jpeg', 'https://images.pexels.com/photos/8926558/pexels-photo-8926558.jpeg', 'https://images.pexels.com/photos/8926573/pexels-photo-8926573.jpeg'],
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    '3 hours',
    30,
    'School students (grades 6-12)',
    'beginner',
    'No prior experience required',
    ARRAY['Identify basic electronic components', 'Understand the concept of circuits and current flow', 'Build simple electronic circuits', 'Use sensors to create interactive projects', 'Develop problem-solving skills through electronics'],
    ARRAY['Electronic component kits', 'Breadboards', 'LED circuits', 'Sensors', 'Safety equipment', 'Instructional materials'],
    true
  );