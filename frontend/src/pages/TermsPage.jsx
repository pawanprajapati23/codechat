import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useSEO from '../hooks/useSEO';

const TermsPage = () => {
  useSEO(
    'Terms of Service',
    'CodeChat Terms of Service — rules and guidelines for using our real-time chat platform.'
  );

  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'license', title: 'Use License' },
    { id: 'prohibited', title: 'Prohibited Uses' },
    { id: 'disclaimer', title: 'Disclaimer' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'governing', title: 'Governing Law' },
    { id: 'contact', title: 'Contact' }
  ];

  return (
    <div className="min-h-screen bg-[#0b141a] text-white font-inter flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
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
              <section id="acceptance" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using CodeChat ("we", "our", or "us"), you accept and agree to be bound by the terms and provisions of this agreement. In addition, when using CodeChat's specific services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this service will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section id="license" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-4">2. Use License</h2>
                <p className="mb-4">
                  Permission is granted to temporarily use the CodeChat platform for personal, non-commercial, and commercial communication purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>modify or copy the underlying materials or source code without permission;</li>
                  <li>use the materials for any illegal purpose;</li>
                  <li>attempt to decompile or reverse engineer any software contained on CodeChat's website;</li>
                  <li>remove any copyright or other proprietary notations from the materials;</li>
                </ul>
              </section>

              <section id="prohibited" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-4">3. Prohibited Uses</h2>
                <p className="mb-4">In using the CodeChat service, you agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Transmit any material that is abusive, harassing, tortious, defamatory, vulgar, pornographic, obscene, libelous, or otherwise objectionable;</li>
                  <li>Transmit any unsolicited or unauthorized advertising, promotional materials, spam, or chain letters;</li>
                  <li>Transmit any material that contains software viruses or any other malicious computer code, files, or programs;</li>
                  <li>Interfere with or disrupt the service or servers or networks connected to the service.</li>
                </ul>
              </section>

              <section id="disclaimer" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-4">4. Disclaimer</h2>
                <p>
                  The materials on CodeChat's web site are provided "as is". CodeChat makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights. Further, CodeChat does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its Internet web site or otherwise relating to such materials or on any sites linked to this site.
                </p>
              </section>

              <section id="liability" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-4">5. Limitation of Liability</h2>
                <p>
                  In no event shall CodeChat or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption,) arising out of the use or inability to use the materials on CodeChat's Internet site, even if CodeChat or a CodeChat authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </section>

              <section id="governing" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-4">6. Governing Law</h2>
                <p>
                  Any claim relating to CodeChat's web site shall be governed by the laws of the jurisdiction without regard to its conflict of law provisions.
                </p>
              </section>

              <section id="contact" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-4">7. Contact</h2>
                <p>
                  If you have any questions about these Terms, please contact us at: <a href="mailto:diplomawithbtech@gmail.com" className="text-[#25d366] hover:underline">diplomawithbtech@gmail.com</a>
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

export default TermsPage;
