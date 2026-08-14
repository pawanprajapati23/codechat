import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, MessageCircle, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useSEO from '../hooks/useSEO';

const ContactPage = () => {
  useSEO(
    'Contact',
    'Get in touch with the CodeChat team. Reach out to founder Pawan Prajapati for feedback, partnerships, or support.'
  );

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Just UI state, no backend needed as per requirements
    setIsSent(true);
    setTimeout(() => setIsSent(false), 5000);
    setFormState({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-white font-inter flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Get In Touch
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-400"
            >
              We'd love to hear from you. Reach out for support, feedback, or partnerships.
            </motion.p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Contact Info (Left) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full lg:w-1/3 space-y-6"
            >
              <a 
                href="mailto:diplomawithbtech@gmail.com" 
                className="flex items-start p-6 bg-[#1f2c33] rounded-xl hover:bg-[#2a3b45] transition-colors border border-gray-800 group"
              >
                <div className="p-3 bg-[#25d366]/10 rounded-lg text-[#25d366] group-hover:bg-[#25d366] group-hover:text-[#0b141a] transition-colors mt-1">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-semibold mb-1">Email Us</h3>
                  <p className="text-gray-400 text-sm break-all">diplomawithbtech@gmail.com</p>
                </div>
              </a>

              <a 
                href="https://github.com/pawanprajapati23" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-start p-6 bg-[#1f2c33] rounded-xl hover:bg-[#2a3b45] transition-colors border border-gray-800 group"
              >
                <div className="p-3 bg-gray-800 rounded-lg text-white group-hover:bg-white group-hover:text-black transition-colors mt-1">
                  <Github className="w-6 h-6" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-semibold mb-1">GitHub</h3>
                  <p className="text-gray-400 text-sm break-all">github.com/pawanprajapati23</p>
                </div>
              </a>

              <div className="flex items-start p-6 bg-[#1f2c33] rounded-xl border border-gray-800">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 mt-1">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-semibold mb-1">Chat</h3>
                  <p className="text-gray-400 text-sm">Open the app and say hi!</p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form (Right) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="w-full lg:w-2/3 bg-[#1f2c33] rounded-2xl p-8 border border-gray-800 shadow-xl"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name"
                      required
                      value={formState.name}
                      onChange={handleChange}
                      className="w-full bg-[#0b141a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#25d366] focus:ring-1 focus:ring-[#25d366] transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email"
                      required
                      value={formState.email}
                      onChange={handleChange}
                      className="w-full bg-[#0b141a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#25d366] focus:ring-1 focus:ring-[#25d366] transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject"
                    required
                    value={formState.subject}
                    onChange={handleChange}
                    className="w-full bg-[#0b141a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#25d366] focus:ring-1 focus:ring-[#25d366] transition-colors"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                  <textarea 
                    id="message" 
                    name="message"
                    required
                    rows="5"
                    value={formState.message}
                    onChange={handleChange}
                    className="w-full bg-[#0b141a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#25d366] focus:ring-1 focus:ring-[#25d366] transition-colors resize-none"
                    placeholder="Type your message here..."
                  ></textarea>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-gray-500">We typically respond within 24 hours.</p>
                  <button 
                    type="submit"
                    className="inline-flex items-center px-6 py-3 bg-[#25d366] text-[#0b141a] font-semibold rounded-lg hover:bg-[#20b858] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1f2c33] focus:ring-[#25d366]"
                  >
                    {isSent ? 'Message Sent!' : 'Send Message'}
                    {!isSent && <Send className="w-4 h-4 ml-2" />}
                  </button>
                </div>
                
                {isSent && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-[#25d366]/20 border border-[#25d366]/50 rounded-lg text-[#25d366] text-center font-medium mt-4"
                  >
                    Thanks for reaching out! We'll get back to you soon.
                  </motion.div>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
