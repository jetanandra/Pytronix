import React from 'react';

const faqs = [
  {
    question: 'How do I place an order?',
    answer: 'Browse products, add them to your cart, and proceed to checkout. You will need to create an account or log in to complete your purchase.'
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept credit/debit cards, UPI, and other secure payment options. More payment methods coming soon!'
  },
  {
    question: 'How can I track my order?',
    answer: 'Once your order is shipped, you will receive a tracking link via email. You can also view order status in your account.'
  },
  {
    question: 'Can I return a product?',
    answer: 'Yes, you can return products within 7 days of delivery if they are unused and in original packaging. See our Shipping & Returns page for details.'
  },
  {
    question: 'How do I contact support?',
    answer: 'You can reach us via the Contact page or email support@pytronix.com.'
  }
];

const FAQPage: React.FC = () => (
  <div className="container-custom py-16 min-h-screen">
    <h1 className="text-4xl font-bold mb-8 text-neon-blue font-orbitron text-center">FAQ</h1>
    <div className="max-w-2xl mx-auto">
      {faqs.map((faq, idx) => (
        <div key={idx} className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{faq.question}</h2>
          <p className="text-gray-600 dark:text-soft-gray">{faq.answer}</p>
        </div>
      ))}
    </div>
  </div>
);

export default FAQPage; 