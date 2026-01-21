import { Brain, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#050508]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">CareerIQ</span>
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-zinc-500 text-sm mb-8">Last Updated: January 2026</p>

        <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to CareerIQ ("we," "our," or "us"), a product by Aykaa. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our career intelligence service at career-iq.aykaa.me (the "Service").
            </p>
            <p className="mt-3">
              By using the Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this Privacy Policy, please do not access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <p className="mb-3">We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="text-white font-medium">Personal Information:</span> Mobile number, email address (when provided for report delivery)</li>
              <li><span className="text-white font-medium">Professional Information:</span> Resume/CV content, LinkedIn profile URL (optional), target role preferences</li>
              <li><span className="text-white font-medium">Payment Information:</span> Transaction details processed securely through Razorpay (we do not store card details)</li>
              <li><span className="text-white font-medium">Usage Data:</span> IP address, browser type, pages visited, time spent on pages, UTM parameters for marketing attribution</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p className="mb-3">We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To generate your personalized Career Intelligence Report</li>
              <li>To process payments and deliver digital reports</li>
              <li>To send report copies via email when requested</li>
              <li>To improve our analysis algorithms and service quality</li>
              <li>To communicate with you regarding your report or support queries</li>
              <li>To analyze marketing effectiveness and optimize user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Data Processing and AI Analysis</h2>
            <p>
              Your resume and professional information are processed using artificial intelligence (OpenAI) to generate career intelligence insights. This analysis is performed solely for the purpose of creating your report. We do not use your personal data to train AI models or share it with third parties for their marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Data Retention</h2>
            <p>
              We retain your information for a period of 30 days from the date of report generation to allow you to access your report. After this period, your resume, LinkedIn data, and report content are automatically deleted from our systems. Payment records may be retained longer for accounting and legal compliance purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit and at rest, secure cloud infrastructure, and access controls.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Third-Party Services</h2>
            <p className="mb-3">We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="text-white font-medium">Razorpay:</span> Payment processing (governed by Razorpay's privacy policy)</li>
              <li><span className="text-white font-medium">OpenAI:</span> AI-powered analysis (data processed per OpenAI's API terms)</li>
              <li><span className="text-white font-medium">SendGrid:</span> Email delivery for report distribution</li>
              <li><span className="text-white font-medium">MongoDB Atlas:</span> Secure cloud database storage</li>
              <li><span className="text-white font-medium">Google Tag Manager:</span> Analytics and marketing tracking</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request access to your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (subject to legal retention requirements)</li>
              <li>Withdraw consent for marketing communications</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at <a href="mailto:support.career-iq@aykaa.me" className="text-primary hover:underline">support.career-iq@aykaa.me</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. Cookies and Tracking</h2>
            <p>
              We use localStorage and cookies to maintain session information, track UTM parameters for marketing attribution, and improve user experience. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Children's Privacy</h2>
            <p>
              Our Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of the Service after any changes indicates your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">12. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-3">
              <span className="text-white">Email:</span> <a href="mailto:support.career-iq@aykaa.me" className="text-primary hover:underline">support.career-iq@aykaa.me</a>
            </p>
            <p className="mt-1">
              <span className="text-white">Website:</span> <a href="https://career-iq.aykaa.me" className="text-primary hover:underline">career-iq.aykaa.me</a>
            </p>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <button 
            onClick={() => navigate('/')}
            className="text-primary hover:text-primary/80 transition-colors text-sm flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-white/5">
        <p className="text-zinc-700 text-xs text-center">
          © {new Date().getFullYear()} CareerIQ by Aykaa. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
