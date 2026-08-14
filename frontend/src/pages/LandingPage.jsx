import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Shield, Video, Code, MessageSquare, Terminal, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useSEO from '../hooks/useSEO';

const LandingPage = () => {
  useSEO(
    'Real-Time Chat for Developers',
    'CodeChat — Lightning-fast real-time chat with video calls, file sharing, and code highlighting. Free forever. No signup required for guests.'
  );

  return (
    <div className="min-h-screen bg-[#0b141a] text-white font-inter overflow-y-auto overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#25d366]/10 text-[#25d366] font-medium text-sm border border-[#25d366]/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#25d366] mr-2 animate-pulse"></span>
              Free & Open Source
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6">
              Chat. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#25d366] to-blue-500">Code.</span> Connect.
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 max-w-lg leading-relaxed">
              The real-time developer chat platform with video calls, code sharing, and instant messaging. No friction, just pure productivity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/app" 
                className="inline-flex justify-center items-center px-8 py-4 text-base font-bold rounded-lg bg-[#25d366] text-[#0b141a] hover:bg-[#20b858] transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_30px_rgba(37,211,102,0.5)]"
              >
                Start Chatting Free <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                to="/about" 
                className="inline-flex justify-center items-center px-8 py-4 text-base font-bold rounded-lg bg-transparent border border-gray-600 text-white hover:bg-gray-800 transition-all"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Chat UI Mockup */}
            <div className="bg-[#111b21] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col h-[500px]">
              {/* Mockup Header */}
              <div className="bg-[#202c33] p-4 flex items-center gap-4 border-b border-gray-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25d366] to-blue-500 flex items-center justify-center font-bold text-white shadow-lg">
                  #
                </div>
                <div>
                  <h3 className="font-semibold text-gray-100">dev-general</h3>
                  <p className="text-xs text-[#25d366]">3 online</p>
                </div>
              </div>
              
              {/* Mockup Body */}
              <div className="flex-grow p-4 space-y-4 overflow-hidden relative">
                {/* Decorative background blur */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#25d366]/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-sm font-bold text-white">A</div>
                  <div>
                    <div className="bg-[#202c33] text-gray-200 rounded-b-xl rounded-tr-xl px-4 py-2 text-sm shadow-md">
                      Hey! Did you check out the new CodeChat update?
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 ml-1">10:01 AM</span>
                  </div>
                </div>

                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-[#25d366] flex-shrink-0 flex items-center justify-center text-sm font-bold text-[#0b141a]">You</div>
                  <div className="items-end flex flex-col">
                    <div className="bg-[#005c4b] text-gray-100 rounded-b-xl rounded-tl-xl px-4 py-2 text-sm shadow-md max-w-[280px]">
                      Yeah, the code highlighting is awesome!
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 mr-1">10:02 AM</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center text-sm font-bold text-white">P</div>
                  <div className="w-full">
                    <div className="bg-[#202c33] text-gray-200 rounded-b-xl rounded-tr-xl p-3 text-sm shadow-md w-full max-w-[320px]">
                      <p className="mb-2">Check out this snippet:</p>
                      <div className="bg-[#0b141a] rounded p-2 font-mono text-xs text-gray-300 border border-gray-800">
                        <span className="text-pink-400">const</span> <span className="text-blue-400">chat</span> = <span className="text-yellow-300">new</span> <span className="text-green-400">CodeChat</span>();<br/>
                        <span className="text-blue-400">chat</span>.<span className="text-yellow-200">connect</span>();
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 ml-1">10:03 AM</span>
                  </div>
                </div>
              </div>

              {/* Mockup Input */}
              <div className="bg-[#202c33] p-3 flex items-center gap-3">
                <div className="flex-grow bg-[#2a3942] rounded-lg px-4 py-2 text-sm text-gray-400">
                  Type a message...
                </div>
                <div className="w-10 h-10 rounded-full bg-[#25d366] flex items-center justify-center text-[#0b141a]">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="border-y border-gray-800 bg-[#111b21]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <Zap className="text-[#25d366] w-6 h-6" />
              <span className="font-semibold text-gray-300">Real-Time</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Shield className="text-[#25d366] w-6 h-6" />
              <span className="font-semibold text-gray-300">Secure</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Video className="text-[#25d366] w-6 h-6" />
              <span className="font-semibold text-gray-300">Video Calls</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Code className="text-[#25d366] w-6 h-6" />
              <span className="font-semibold text-gray-300">Code Highlight</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Chat instantly. No friction.</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Get into a room and start collaborating in seconds. It's that simple.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -z-10"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#1f2c33] p-8 rounded-2xl border border-gray-800 text-center relative"
          >
            <div className="w-12 h-12 bg-[#25d366] text-[#0b141a] font-bold rounded-full flex items-center justify-center text-xl mx-auto mb-6 shadow-[0_0_15px_rgba(37,211,102,0.4)]">1</div>
            <h3 className="text-xl font-bold mb-3">Enter Room Code</h3>
            <p className="text-gray-400">Generate a unique code or enter an existing one to join a room.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-[#1f2c33] p-8 rounded-2xl border border-gray-800 text-center relative"
          >
            <div className="w-12 h-12 bg-[#25d366] text-[#0b141a] font-bold rounded-full flex items-center justify-center text-xl mx-auto mb-6 shadow-[0_0_15px_rgba(37,211,102,0.4)]">2</div>
            <h3 className="text-xl font-bold mb-3">Share With Friends</h3>
            <p className="text-gray-400">Send the room code to your teammates or friends to invite them.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-[#1f2c33] p-8 rounded-2xl border border-gray-800 text-center relative"
          >
            <div className="w-12 h-12 bg-[#25d366] text-[#0b141a] font-bold rounded-full flex items-center justify-center text-xl mx-auto mb-6 shadow-[0_0_15px_rgba(37,211,102,0.4)]">3</div>
            <h3 className="text-xl font-bold mb-3">Start Chatting</h3>
            <p className="text-gray-400">Message, video call, and share code instantly. No account needed!</p>
          </motion.div>
        </div>
      </section>

      {/* Mini Features Showcase */}
      <section className="bg-[#111b21] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for modern teams</h2>
            <p className="text-gray-400 text-lg">Everything you need, nothing you don't.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Zap />, title: "Real-Time Sync", desc: "Socket.IO powered instant messaging" },
              { icon: <Video />, title: "WebRTC Calls", desc: "Peer-to-peer crystal clear video" },
              { icon: <Terminal />, title: "Syntax Highlighting", desc: "Support for 100+ languages" },
              { icon: <Shield />, title: "End-to-End Secure", desc: "Your data stays protected" },
              { icon: <MessageSquare />, title: "Group & DMs", desc: "Public rooms and private chats" },
              { icon: <Code />, title: "Open Source", desc: "Inspect and modify the code" },
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-[#0b141a] rounded-xl border border-gray-800 hover:border-[#25d366]/50 transition-colors">
                <div className="text-[#25d366] mb-4">{feature.icon}</div>
                <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-8">Trusted by developers</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
            <div className="text-2xl md:text-3xl font-bold text-gray-300">100% Free</div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#25d366] hidden md:block"></div>
            <div className="text-2xl md:text-3xl font-bold text-gray-300">Open Source</div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#25d366] hidden md:block"></div>
            <div className="text-2xl md:text-3xl font-bold text-gray-300">Real-Time</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#25d366]/10 pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to chat?</h2>
          <p className="text-xl text-gray-400 mb-10">Join the next generation of developer communication.</p>
          <Link 
            to="/app" 
            className="inline-flex justify-center items-center px-10 py-5 text-lg font-bold rounded-full bg-[#25d366] text-[#0b141a] hover:bg-[#20b858] transition-transform hover:scale-105 shadow-[0_0_30px_rgba(37,211,102,0.4)]"
          >
            Open CodeChat
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
