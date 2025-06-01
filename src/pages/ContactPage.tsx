import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Replace these with your actual EmailJS values
    const SERVICE_ID = 'service_5ourdnd';
    const TEMPLATE_ID = 'template_2vdwz7h';
    const PUBLIC_KEY = '-HFTNnRWKK5exFNqg';
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          name: form.name,
          email: form.email,
          message: form.message,
        },
        PUBLIC_KEY
      );
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-16 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-neon-blue font-orbitron text-center">Contact Us</h1>
      <div className="grid md:grid-cols-2 gap-12">
        <form ref={formRef} className="bg-white dark:bg-light-navy rounded-2xl shadow-xl p-10 border border-gray-100 dark:border-gray-800" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Send a Message</h2>
          {submitted ? (
            <div className="text-green-600 font-semibold mb-4">Thank you for reaching out! We'll get back to you soon.</div>
          ) : null}
          {error && <div className="text-red-600 font-semibold mb-4">{error}</div>}
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-700 dark:text-soft-gray">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-navy text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition placeholder-gray-400 dark:placeholder-soft-gray text-lg"
              placeholder="Your Name"
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-700 dark:text-soft-gray">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-navy text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition placeholder-gray-400 dark:placeholder-soft-gray text-lg"
              placeholder="you@email.com"
              disabled={loading}
            />
          </div>
          <div className="mb-8">
            <label className="block mb-2 font-medium text-gray-700 dark:text-soft-gray">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-navy text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition placeholder-gray-400 dark:placeholder-soft-gray text-lg resize-none h-36"
              placeholder="Type your message..."
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn-primary w-full py-3 text-lg rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-60" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
        <div className="flex flex-col justify-between gap-8">
          <div className="bg-white dark:bg-light-navy rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 mb-4">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Contact Information</h2>
            <p className="mb-2 text-gray-600 dark:text-soft-gray">Email: <a href="mailto:support@pytronix.com" className="text-neon-blue underline">support@pytronix.com</a></p>
            <p className="mb-2 text-gray-600 dark:text-soft-gray">Phone: <a href="tel:+1234567890" className="text-neon-blue underline">+1 234 567 890</a></p>
            <p className="mb-4 text-gray-600 dark:text-soft-gray">Address: 123 Maker Lane, Tech City, 12345</p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1486.4891809845024!2d94.10083876108493!3d27.25561800049429!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x374137737605a075%3A0xab1234af77a58bc2!2sBijay%20Sarmah!5e0!3m2!1sen!2sin!4v1746388518326!5m2!1sen!2sin"
              width="100%"
              height="360"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Pytronix Location"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 