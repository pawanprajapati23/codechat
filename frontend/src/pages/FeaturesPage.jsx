import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Video, FileText, Code, Smile, Moon, Shield, Users, Database, Check, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useSEO from '../hooks/useSEO';

const FeaturesPage = () => {
  useSEO(
    'Features',
    'Explore CodeChat features — real-time messaging, WebRTC video calls, file sharing, code highlighting, emoji reactions, dark mode and more.'
  );

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-[#25d366]" />,
      title: 'Real-Time Messaging',
      description: 'Lightning-fast message delivery using Socket.IO with less than 100ms latency.'
    },
    {
      icon: <Video className="w-6 h-6 text-[#25d366]" />,
      title: 'Video & Audio Calls',
      description: 'Crystal clear peer-to-peer WebRTC video and audio calling built right in.'
    },
    {
      icon: <FileText className="w-6 h-6 text-[#25d366]" />,
      title: 'File Sharing',
      description: 'Share documents, images, and files of any format up to 10MB instantly.'
    },
    {
      icon: <Code className="w-6 h-6 text-[#25d366]" />,
      title: 'Code Highlighting',
      description: 'Syntax highlighting for over 100+ programming languages to share snippets easily.'
    },
    {
      icon: <Smile className="w-6 h-6 text-[#25d366]" />,
      title: 'Emoji Reactions',
      description: 'Express yourself quickly by reacting to any message with your favorite emojis.'
    },
    {
      icon: <Moon className="w-6 h-6 text-[#25d366]" />,
      title: 'Dark Mode',
      description: 'Built-in dark theme support to keep your eyes rested during late-night coding.'
    },
    {
      icon: <Shield className="w-6 h-6 text-[#25d366]" />,
      title: 'Secure Auth',
      description: 'Robust security with JWT authentication and OTP verification for your peace of mind.'
    },
    {
      icon: <Users className="w-6 h-6 text-[#25d366]" />,
      title: 'Group Rooms & DMs',
      description: 'Create public rooms for teams or switch to private messaging for 1-on-1 chats.'
    },
    {
      icon: <Database className="w-6 h-6 text-[#25d366]" />,
      title: 'Message History',
      description: 'Persistent MongoDB storage ensures you never lose important conversations.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b141a] text-white font-inter flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
            >
              Everything You Need to Chat Smarter
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-400 max-w-3xl mx-auto"
            >
              Designed for developers, built for everyone. Discover the powerful tools that make CodeChat the ultimate communication platform.
            </motion.p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#1f2c33] rounded-xl p-8 hover:-translate-y-2 transition-transform duration-300 shadow-lg border border-gray-800"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#25d366]/20 to-transparent rounded-lg flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-center mb-12">How We Compare</h2>
            <div className="overflow-x-auto bg-[#1f2c33] rounded-xl shadow-lg border border-gray-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-6 text-gray-400 font-medium">Feature</th>
                    <th className="p-6 text-[#25d366] font-semibold text-lg border-l border-gray-700">CodeChat</th>
                    <th className="p-6 text-gray-300 font-medium border-l border-gray-700">Slack</th>
                    <th className="p-6 text-gray-300 font-medium border-l border-gray-700">Discord</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700/50">
                    <td className="p-6">Developer Focused</td>
                    <td className="p-6 border-l border-gray-700"><Check className="text-[#25d366] w-5 h-5 mx-auto" /></td>
                    <td className="p-6 border-l border-gray-700"><Check className="text-gray-500 w-5 h-5 mx-auto" /></td>
                    <td className="p-6 border-l border-gray-700"><Check className="text-gray-500 w-5 h-5 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="p-6">No Signup Required</td>
                    <td className="p-6 border-l border-gray-700"><Check className="text-[#25d366] w-5 h-5 mx-auto" /></td>
                    <td className="p-6 border-l border-gray-700"><X className="text-red-500 w-5 h-5 mx-auto" /></td>
                    <td className="p-6 border-l border-gray-700"><X className="text-red-500 w-5 h-5 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="p-6">Free Forever</td>
                    <td className="p-6 border-l border-gray-700"><Check className="text-[#25d366] w-5 h-5 mx-auto" /></td>
                    <td className="p-6 border-l border-gray-700"><X className="text-red-500 w-5 h-5 mx-auto" /></td>
                    <td className="p-6 border-l border-gray-700"><Check className="text-gray-500 w-5 h-5 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-6">Open Source</td>
                    <td className="p-6 border-l border-gray-700"><Check className="text-[#25d366] w-5 h-5 mx-auto" /></td>
                    <td className="p-6 border-l border-gray-700"><X className="text-red-500 w-5 h-5 mx-auto" /></td>
                    <td className="p-6 border-l border-gray-700"><X className="text-red-500 w-5 h-5 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-b from-[#1f2c33] to-[#0b141a] rounded-2xl p-12 border border-gray-800">
            <h2 className="text-3xl font-bold mb-6">Ready to upgrade your workflow?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of developers using CodeChat for seamless collaboration.
            </p>
            <a 
              href="/"
              className="inline-flex items-center px-8 py-4 rounded-full bg-[#25d366] text-[#0b141a] font-bold hover:bg-[#20b858] transition-colors"
            >
              Try CodeChat Free
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeaturesPage;
