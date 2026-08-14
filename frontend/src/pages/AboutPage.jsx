import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Shield, Terminal, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSEO } from '../hooks/useSEO';

const AboutPage = () => {
  useSEO({
    title: 'About',
    description: 'Learn about CodeChat — the real-time developer chat platform built for seamless communication, code sharing, and collaboration.'
  });

  const stats = [
    { label: 'Open Source', value: '100%' },
    { label: 'Latency', value: '< 100ms' },
    { label: 'Free Forever', value: 'Yes' }
  ];

  const techStack = ['React', 'Node.js', 'Socket.IO', 'MongoDB', 'WebRTC', 'JWT'];

  return (
    <div className="min-h-screen bg-[#0b141a] text-white flex flex-col overflow-y-auto">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              About CodeChat
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Connecting developers worldwide with instant, powerful communication tools.
            </p>
          </motion.div>
        </section>

        {/* Mission Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#1f2c33] p-8 rounded-2xl border border-[#2a3942]"
            >
              <Zap className="w-10 h-10 text-[#25d366] mb-4" />
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-gray-400">Optimized for speed. Messages delivered instantly without delay.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#1f2c33] p-8 rounded-2xl border border-[#2a3942]"
            >
              <Shield className="w-10 h-10 text-[#25d366] mb-4" />
              <h3 className="text-xl font-semibold mb-3">Secure</h3>
              <p className="text-gray-400">Your conversations and code snippets are safe and protected.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-[#1f2c33] p-8 rounded-2xl border border-[#2a3942]"
            >
              <Terminal className="w-10 h-10 text-[#25d366] mb-4" />
              <h3 className="text-xl font-semibold mb-3">Developer-First</h3>
              <p className="text-gray-400">Syntax highlighting, code sharing, and tools built for devs.</p>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">How CodeChat Was Born</h2>
              <div className="space-y-4 text-gray-400 text-lg">
                <p>
                  CodeChat started with a simple realization: developers communicate differently. We share code, debug together, and need tools that understand our workflow.
                </p>
                <p>
                  Built by a developer for developers, CodeChat emerged from the desire to have a dedicated, lightning-fast platform where tech discussions don't get lost in the noise of general-purpose chat apps.
                </p>
                <p>
                  Today, it's a testament to the power of open-source and community-driven development.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="aspect-square md:aspect-video rounded-3xl bg-gradient-to-br from-[#1f2c33] to-[#0b141a] border border-[#2a3942] flex items-center justify-center p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#25d366]/5 blur-3xl rounded-full"></div>
              <Terminal className="w-24 h-24 text-[#25d366]/50" />
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-8 bg-[#1f2c33]/50 rounded-2xl border border-[#2a3942]"
              >
                <div className="text-4xl font-bold text-[#25d366] mb-2">{stat.value}</div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24 text-center">
          <h2 className="text-3xl font-bold mb-10">Powered By</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="px-6 py-3 bg-[#1f2c33] rounded-full border border-[#2a3942] text-gray-300 font-medium"
              >
                {tech}
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-b from-[#1f2c33] to-[#0b141a] p-12 rounded-3xl border border-[#2a3942]">
            <h2 className="text-3xl font-bold mb-6">Ready to join the conversation?</h2>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 bg-[#25d366] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-[#20bd5a] transition-colors"
            >
              Start Chatting Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
