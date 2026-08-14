import React from 'react';
import { motion } from 'framer-motion';
import { Github, Mail, Code, MapPin, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSEO } from '../hooks/useSEO';

const FounderPage = () => {
  useSEO({
    title: 'Founder — Pawan Prajapati',
    description: 'Meet Pawan Prajapati, the founder of CodeChat — a passionate full-stack developer who built a real-time chat platform for developers.'
  });

  const skills = [
    'React', 'Node.js', 'MongoDB', 'Socket.IO', 
    'WebRTC', 'JavaScript', 'Express', 'Git'
  ];

  const milestones = [
    { year: 'Early Days', desc: 'Fascinated by real-time systems and web technologies.' },
    { year: 'The Idea', desc: 'Realized developers needed better, focused communication tools.' },
    { year: 'Building', desc: 'Started crafting CodeChat from scratch, focusing on speed.' },
    { year: 'Launch', desc: 'Released CodeChat for the developer community.' }
  ];

  return (
    <div className="min-h-screen bg-[#0b141a] text-white flex flex-col overflow-y-auto">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#25d366] to-[#128c7e] flex items-center justify-center text-4xl font-bold text-black mb-6 shadow-lg shadow-[#25d366]/20 border-4 border-[#1f2c33]">
              PP
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Pawan Prajapati</h1>
            <p className="text-xl text-[#25d366] font-medium mb-6">Founder & Developer, CodeChat</p>
            <p className="text-lg text-gray-400 max-w-2xl mb-8">
              "Building the future of developer communication, one line of code at a time."
            </p>
            
            <a 
              href="https://github.com/pawanprajapati23" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1f2c33] hover:bg-[#2a3942] border border-[#2a3942] px-4 py-2 rounded-full transition-colors text-sm font-medium text-gray-300 hover:text-white"
            >
              <Github className="w-4 h-4" />
              github.com/pawanprajapati23
            </a>
          </motion.div>
        </section>

        {/* Story Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#1f2c33]/50 rounded-3xl p-8 md:p-12 border border-[#2a3942]"
          >
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Code className="text-[#25d366]" />
              My Journey
            </h2>
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                As a student turning into a builder, I was always captivated by how real-time applications worked behind the scenes. 
              </p>
              <p>
                I built CodeChat because I saw a gap: developers communicating on platforms that weren't built for them. Code snippets looked terrible, syntax highlighting was non-existent, and the speed just wasn't there.
              </p>
              <p>
                I strongly believe that powerful developer tools should be accessible, free, and open. CodeChat is my contribution to making our daily workflows a bit smoother and a lot more fun.
              </p>
            </div>
            
            <div className="mt-12">
              <h3 className="text-xl font-semibold mb-6 text-white">Timeline</h3>
              <div className="space-y-6">
                {milestones.map((milestone, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[#25d366] mt-2"></div>
                      {idx !== milestones.length - 1 && <div className="w-0.5 h-full bg-[#2a3942] mt-2"></div>}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{milestone.year}</h4>
                      <p className="text-gray-400 text-sm mt-1">{milestone.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Skills & Tech */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mb-20">
          <h2 className="text-2xl font-bold mb-8 text-center">Technical Arsenal</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skills.map((skill, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#1f2c33] border border-[#2a3942] py-4 px-6 rounded-xl text-center text-gray-300 font-medium hover:border-[#25d366]/50 transition-colors"
              >
                {skill}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="bg-gradient-to-b from-[#1f2c33] to-[#0b141a] p-8 md:p-12 rounded-3xl border border-[#2a3942] text-center">
            <h2 className="text-3xl font-bold mb-4">Have an idea? Let's talk</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a 
                href="mailto:diplomawithbtech@gmail.com"
                className="flex items-center justify-center gap-3 bg-[#1f2c33] hover:bg-[#2a3942] border border-[#2a3942] px-6 py-4 rounded-xl transition-colors"
              >
                <Mail className="w-5 h-5 text-[#25d366]" />
                <span className="text-white font-medium">diplomawithbtech@gmail.com</span>
              </a>
              <a 
                href="https://github.com/pawanprajapati23"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#1f2c33] hover:bg-[#2a3942] border border-[#2a3942] px-6 py-4 rounded-xl transition-colors"
              >
                <Github className="w-5 h-5 text-[#25d366]" />
                <span className="text-white font-medium">@pawanprajapati23</span>
                <ExternalLink className="w-4 h-4 text-gray-500 ml-1" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FounderPage;
