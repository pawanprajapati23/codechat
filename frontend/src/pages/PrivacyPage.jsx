import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useSEO from '../hooks/useSEO';

const PrivacyPage = () => {
  useSEO(
    'Privacy Policy',
    'CodeChat Privacy Policy — how we collect, use, and protect your personal information.'
  );

  const sections = [
    { id: 'collect', title: 'Information We Collect' },
    { id: 'use', title: 'How We Use Information' },
    { id: 'storage', title: 'Data Storage & Security' },
    { id: 'cookies', title: 'Cookies' },
    { id: 'third-party', title: 'Third-Party Services' },
    { id: 'children', title: "Children's Privacy" },
    { id: 'changes', title: 'Changes to Policy' },
    { id: 'contact', title: 'Contact' }
  ];

  return (
    <div className="min-h-screen bg-[#0b141a] text-white font-inter flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-gray-400">Last updated: August 14, 2026</p>
          </div>

          <div className="flex flex-col md:flex-row gap-12">
            {/* Table of Contents sidebar */}
            <div className="w-full md:w-1/4">
              <div className="sticky top-24 bg-[#1f2c33] p-6 rounded-xl border border-gray-800">
                <h3 className="font-semibold text-lg mb-4">Table of Contents</h3>
                <ul className="space-y-3">
                  {sections.map(section => (
                    <li key={section.id}>
                      <a 
                        href={`#${section.id}`} 
                        className="text-gray-400 hover:text-[#25d366] text-sm transition-colors block"
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Content */}
            <div className="w-full md:w-3/4 space-y-12 text-gray-300 leading-relaxed">
              <section id="collect" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
                <p className="mb-4">
                  We collect information to provide better services to all our users. When you use CodeChat, we may collect the following types of information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account Information:</strong> If you create an account, we collect your name, email address, and password (hashed).</li>
                  <li><strong>Usage Data:</strong> We collect data about how you interact with our services, such as IP addresses, browser types, and usage times.</li>
                  <li><strong>Communication Data:</strong> We store messages, files, and other content you transmit through the platform to provide the chat service.</li>
                </ul>
              </section>

              <section id="use" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Information</h2>
                <p className="mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our services.</li>
                  <li>Process transactions and send related information.</li>
                  <li>Send technical notices, updates, security alerts, and support messages.</li>
                  <li>Respond to your comments, questions, and customer service requests.</li>
                  <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
                </ul>
              </section>

              <section id="storage" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-4">3. Data Storage & Security</h2>
                <p>
                  We implement robust security measures to protect your personal information. Data is stored securely in MongoDB databases with appropriate encryption and access controls. While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee its absolute security.
                </p>
              </section>

              <section id="cookies" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-4">4. Cookies</h2>
                <p>
                  We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
              </section>

              <section id="third-party" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-4">5. Third-Party Services</h2>
                <p>
                  We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
                </p>
              </section>

              <section id="children" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-4">6. Children's Privacy</h2>
                <p>
                  Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Information, please contact us.
                </p>
              </section>

              <section id="changes" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-4">7. Changes to Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
                </p>
              </section>

              <section id="contact" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-4">8. Contact</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us by email at: <a href="mailto:diplomawithbtech@gmail.com" className="text-[#25d366] hover:underline">diplomawithbtech@gmail.com</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
