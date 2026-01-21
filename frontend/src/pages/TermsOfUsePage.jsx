import { Brain, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TermsOfUsePage() {
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
        <h1 className="text-3xl font-bold mb-8">Terms of Use</h1>
        <p className="text-zinc-500 text-sm mb-8">Last Updated: January 2026</p>

        <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using CareerIQ (the "Service"), operated by Aykaa at career-iq.aykaa.me, you agree to be bound by these Terms of Use ("Terms"). If you do not agree to these Terms, you may not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p>
              CareerIQ is a career intelligence platform that analyzes your professional profile (resume, LinkedIn, target role) to generate market interpretation insights. The Service provides analytical observations about how your profile may be perceived in the job market. It does not provide job placement services, recruitment, career coaching, or guarantees of employment outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. User Responsibilities</h2>
            <p className="mb-3">By using the Service, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and truthful information in your resume and profile</li>
              <li>Use the Service for personal, non-commercial purposes only</li>
              <li>Not attempt to reverse-engineer, copy, or redistribute the analysis methodology</li>
              <li>Not upload malicious content, viruses, or harmful files</li>
              <li>Not use the Service for any illegal or unauthorized purpose</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Payment and Pricing</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All prices are displayed in Indian Rupees (INR) and include applicable taxes</li>
              <li>Payment is processed securely through Razorpay</li>
              <li>Your report is generated immediately upon successful payment confirmation</li>
              <li>We reserve the right to modify pricing at any time without prior notice</li>
              <li>Promotional offers and discounts are subject to specific terms and availability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Refund Policy</h2>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-white font-medium mb-3">No Refund Policy for Digital Products</p>
              <p className="mb-3">
                As CareerIQ delivers a digital report instantly upon generation, <span className="text-white font-medium">all sales are final and non-refundable</span>. This policy exists because:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The report is generated using your specific data immediately after payment</li>
                <li>The AI analysis and insights are delivered instantly and cannot be "returned"</li>
                <li>Each report is unique and created exclusively for you</li>
              </ul>
              <p className="mt-4 text-white font-medium">Exceptions:</p>
              <p className="mt-2">
                Refunds will only be considered in the following circumstances, subject to validation:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Technical failure where the report fails to generate completely</li>
                <li>Payment processed but no report delivered due to system error</li>
                <li>Duplicate payment for the same session</li>
              </ul>
              <p className="mt-3">
                To request a refund for technical issues, contact <a href="mailto:support.career-iq@aykaa.me" className="text-primary hover:underline">support.career-iq@aykaa.me</a> within 48 hours of purchase with your session ID and proof of the issue.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Intellectual Property</h2>
            <p>
              The Service, including its analysis methodology, algorithms, design, content, and branding, is owned by Aykaa and protected by intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of the Service without express written permission.
            </p>
            <p className="mt-3">
              Your generated report is licensed for your personal use only. You may share insights from your report but may not resell, republish, or commercially distribute the report content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Disclaimer of Warranties</h2>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <p className="mb-3">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
              </p>
              <p className="mb-3">We specifically disclaim:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Any guarantee of job interviews, offers, or career advancement</li>
                <li>Accuracy of market predictions or recruiter behavior</li>
                <li>That the Service will meet your specific expectations</li>
                <li>That the analysis will result in any particular outcome</li>
              </ul>
              <p className="mt-3">
                The insights provided are analytical observations based on patterns and the information you provide. Individual results vary significantly based on market conditions, industry, location, timing, and factors beyond our control.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, AYKAA AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Loss of profits, revenue, or business opportunities</li>
              <li>Career decisions made based on the report</li>
              <li>Job applications, interviews, or employment outcomes</li>
              <li>Any actions taken or not taken based on the analysis</li>
            </ul>
            <p className="mt-3">
              Our total liability for any claim arising from the Service shall not exceed the amount you paid for the specific report in question.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. Third-Party Disclaimers</h2>
            <p>
              CareerIQ is not affiliated with, endorsed by, or connected to LinkedIn™, Naukri™, Indeed™, Glassdoor™, or any other job platforms, recruitment agencies, or employers. All trademarks are property of their respective owners and used for identification purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Report Access and Expiry</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your report is accessible via a unique link provided after generation</li>
              <li>Reports are available for 30 days from the date of generation</li>
              <li>You may request a PDF copy via email within the access period</li>
              <li>After 30 days, report data is automatically deleted and cannot be recovered</li>
              <li>Save or download your report if you need long-term access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">11. Modifications to Service</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time without prior notice. We may also update these Terms periodically. Continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka, India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">13. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">14. Contact Information</h2>
            <p>
              For questions about these Terms of Use, please contact us at:
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
