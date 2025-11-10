import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            Last updated: November 7, 2025
          </p>

          <div className="prose dark:prose-invert max-w-none">
            {/* Agreement */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Agreement to Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                By accessing or using Simple Rubriq ("the Service"), you agree to be bound by these Terms of Service 
                ("Terms"). If you do not agree to these Terms, do not use the Service.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                These Terms constitute a legally binding agreement between you and Simple Rubriq, governed by the laws 
                of England and Wales.
              </p>
            </section>

            {/* Service Description */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Service Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Simple Rubriq is an AI-powered essay grading platform designed for teachers and educators. The Service provides:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Automated essay evaluation using AI technology</li>
                <li>Rubric-based grading and feedback generation</li>
                <li>Student management and grade tracking</li>
                <li>Analytics and reporting tools</li>
              </ul>
            </section>

            {/* Eligibility */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Eligibility
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                You must be at least 18 years old and legally capable of entering into binding contracts to use this Service. 
                By using Simple Rubriq, you represent and warrant that you meet these requirements.
              </p>
            </section>

            {/* Account Registration */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Account Registration and Security
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                To use the Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password and account</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Not share your account credentials with others</li>
              </ul>
            </section>

            {/* Acceptable Use */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Acceptable Use Policy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You agree NOT to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Attempt to gain unauthorized access to the Service or other users' data</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                <li>Use automated tools to scrape or extract data without permission</li>
                <li>Interfere with the proper functioning of the Service</li>
                <li>Impersonate others or misrepresent your affiliation</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Intellectual Property Rights
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                6.1 Your Content
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You retain ownership of essays, rubrics, and other content you submit ("Your Content"). By submitting 
                Your Content, you grant us a limited, non-exclusive license to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Process essays through our AI grading system</li>
                <li>Store and display Your Content within the Service</li>
                <li>Generate feedback and analytics based on Your Content</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                6.2 Our Platform
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Simple Rubriq and all related trademarks, logos, and materials are owned by us or our licensors. 
                You may not use our intellectual property without prior written permission.
              </p>
            </section>

            {/* AI Generated Content */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. AI-Generated Feedback
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong>Important Notice:</strong> Feedback generated by Simple Rubriq is produced using artificial 
                intelligence. While we strive for accuracy, you acknowledge that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>AI feedback is a tool to assist, not replace, educator judgment</li>
                <li>You are responsible for reviewing and verifying all AI-generated feedback</li>
                <li>Final grading decisions remain your professional responsibility</li>
                <li>AI may occasionally produce inaccurate or inappropriate suggestions</li>
              </ul>
            </section>

            {/* Data Protection */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Data Protection and Student Privacy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you are processing student data through Simple Rubriq, you warrant that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>You have lawful authority to process student data</li>
                <li>You comply with all applicable data protection laws (UK GDPR, DPA 2018)</li>
                <li>You have obtained necessary consents from students or guardians</li>
                <li>You will use student data only for educational purposes</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                See our{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                  Privacy Policy
                </Link>{' '}
                for details on how we process data.
              </p>
            </section>

            {/* Disclaimer of Warranties */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Disclaimer of Warranties
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Merchantability or fitness for a particular purpose</li>
                <li>Accuracy, reliability, or availability of the Service</li>
                <li>Freedom from errors, viruses, or other harmful components</li>
                <li>Security or uninterrupted access</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Limitation of Liability
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SIMPLE RUBRIQ SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, data, use, or goodwill</li>
                <li>Service interruptions or errors in AI-generated content</li>
                <li>Unauthorized access to your account or data</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding 
                the claim, or £100, whichever is greater.
              </p>
            </section>

            {/* Indemnification */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Indemnification
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                You agree to indemnify and hold harmless Simple Rubriq from any claims, damages, losses, or expenses 
                arising from: (a) your violation of these Terms, (b) your violation of any law or third-party rights, 
                or (c) your use of the Service.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                12. Termination
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We reserve the right to suspend or terminate your account at any time for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Prolonged inactivity</li>
                <li>Any reason with 30 days' notice</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                You may terminate your account at any time through Account Settings. Upon termination, your data will 
                be deleted according to our data retention policy.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                13. Changes to Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                We may modify these Terms at any time. We will notify you of material changes via email or a prominent 
                notice. Continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                14. Governing Law and Jurisdiction
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the 
                exclusive jurisdiction of the courts of England and Wales.
              </p>
            </section>

            {/* Severability */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                15. Severability
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will remain 
                in full force and effect.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                16. Contact Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                For questions about these Terms, contact us:
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-900 dark:text-white font-medium">Simple Rubriq Legal</p>
                <p className="text-gray-700 dark:text-gray-300">Email: legal@simplrubriq.com</p>
              </div>
            </section>
          </div>

          {/* Back Link */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
