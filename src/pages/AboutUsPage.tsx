import React from 'react';

const AboutUsPage: React.FC = () => (
  <div className="container-custom py-16 min-h-screen">
    <div className="mb-12 text-center">
      <h1 className="text-4xl font-bold mb-4 text-neon-blue font-orbitron">About Us</h1>
      <p className="text-lg text-gray-600 dark:text-soft-gray max-w-2xl mx-auto">
        Phytronix is dedicated to empowering makers, engineers, and innovators with the best electronics and IoT components. Our mission is to make technology accessible, affordable, and inspiring for everyone.
      </p>
    </div>
    <div className="grid md:grid-cols-2 gap-12 mb-16">
      <div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Our Story</h2>
        <p className="text-gray-600 dark:text-soft-gray">
          Founded by passionate engineers, Phytronix started as a small project to help students and hobbyists find quality components. Today, we serve thousands of customers, supporting projects from classrooms to startups.
        </p>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Our Values</h2>
        <ul className="list-disc pl-6 text-gray-600 dark:text-soft-gray">
          <li>Innovation & Learning</li>
          <li>Customer Focus</li>
          <li>Quality & Reliability</li>
          <li>Community & Support</li>
        </ul>
      </div>
    </div>
    <div className="text-center mt-12">
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Want to know more?</h3>
      <p className="text-gray-600 dark:text-soft-gray mb-4">Contact us for partnership, support, or just to say hello!</p>
      <a href="/contact" className="btn-primary">Contact Us</a>
    </div>
  </div>
);

export default AboutUsPage; 