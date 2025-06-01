import React from 'react';

const BlogPage: React.FC = () => (
  <div className="container-custom py-16 min-h-screen">
    <div className="mb-12 text-center">
      <h1 className="text-4xl font-bold mb-4 text-neon-blue font-orbitron">Blog</h1>
      <p className="text-lg text-gray-600 dark:text-soft-gray max-w-2xl mx-auto">
        Explore our latest articles, tutorials, and news about electronics, IoT, and the maker community.
      </p>
    </div>
    <div className="bg-white dark:bg-light-navy rounded-lg shadow p-8 text-center">
      <p className="text-gray-500 mb-4">No blog posts yet. Stay tuned for updates!</p>
    </div>
  </div>
);

export default BlogPage; 