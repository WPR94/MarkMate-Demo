import { Link } from 'react-router-dom';

export default function Privacy() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            Last updated: November 7, 2025
          </p>

          <div className="prose dark:prose-invert max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Simple Rubriq ("we", "our", or "us") is committed to protecting your privacy and complying with 
                UK data protection laws, including the UK General Data Protection Regulation (UK GDPR) and the 
                Data Protection Act 2018.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
                you use our essay grading platform. Please read this policy carefully.
              </p>
            </section>

            {/* Data Controller */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Data Controller
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Simple Rubriq is the data controller responsible for your personal data. For data protection 
                queries, please contact us at: <span className="font-medium">privacy@simplrubriq.com</span>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>For Schools:</strong> If you are an educational institution processing student data, please 
                review our{' '}
                <Link to="/dpa" className="text-blue-600 hover:text-blue-700 underline">
                  Data Processing Agreement (DPA)
                </Link>
                .
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                3.1 Personal Information
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, password (encrypted)</li>
                <li><strong>Student Data:</strong> Student names, email addresses (optional), grades, feedback history</li>
                <li><strong>Usage Data:</strong> Login times, features used, actions performed within the platform</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                3.2 Essay Content
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We process essay texts submitted for grading. This content is processed by AI models to generate 
                feedback and is stored securely in our database.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                3.3 Technical Information
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Browser type and version</li>
                <li>IP address (anonymized for analytics)</li>
                <li>Device information</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            {/* Legal Basis for Processing */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Legal Basis for Processing (UK GDPR Article 6)
              </h2>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Contract Performance:</strong> Processing necessary to provide our grading services</li>
                <li><strong>Legitimate Interests:</strong> Improving our platform, preventing fraud, ensuring security</li>
                <li><strong>Legal Obligation:</strong> Complying with UK laws and regulations</li>
                <li><strong>Consent:</strong> For optional features like email notifications (you can withdraw anytime)</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Provide AI-powered essay grading and feedback</li>
                <li>Maintain your account and student records</li>
                <li>Send service-related notifications (feedback generated, system updates)</li>
                <li>Improve our AI models and platform features</li>
                <li>Ensure platform security and prevent abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Data Sharing and Third Parties
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not sell your personal data. We share data only with:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Supabase (Database Provider):</strong> Stores user accounts, essays, feedback (UK/EU servers)</li>
                <li><strong>OpenAI (AI Provider):</strong> Processes essay content to generate feedback (data not used for training)</li>
                <li><strong>Vercel (Hosting Provider):</strong> Hosts the web application</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                All third-party providers are contractually bound to protect your data and comply with UK GDPR.
              </p>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Your Data Protection Rights (UK GDPR)
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You have the following rights under UK GDPR:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Delete your account and all associated data</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for optional features</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                To exercise these rights, visit your{' '}
                <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 underline">
                  Account Settings
                </Link>{' '}
                or contact us at privacy@simplrubriq.com.
              </p>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Data Security
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We implement industry-standard security measures:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Encryption in transit (HTTPS/TLS)</li>
                <li>Encryption at rest for database storage</li>
                <li>Row-level security policies</li>
                <li>Regular security audits and monitoring</li>
                <li>Password hashing with bcrypt</li>
                <li>Session timeout after inactivity</li>
              </ul>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Data Retention
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We retain your data for as long as your account is active. When you delete your account:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>All personal data, essays, and feedback are permanently deleted within 30 days</li>
                <li>Anonymized usage statistics may be retained for platform improvement</li>
                <li>Backup copies are securely deleted within 90 days</li>
              </ul>
            </section>

            {/* Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Cookies and Tracking
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use essential cookies for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Authentication (keeping you logged in)</li>
                <li>Security (preventing CSRF attacks)</li>
                <li>Preferences (theme selection, tour completion)</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                We do not use advertising or tracking cookies. You can manage cookies through your browser settings.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Children's Privacy
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Simple Rubriq is designed for teachers and educators, not students. If student data is entered by 
                teachers, it is processed lawfully under the school's data protection obligations. We do not knowingly 
                collect data directly from children under 13.
              </p>
            </section>

            {/* International Transfers */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                12. International Data Transfers
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Your data is primarily stored in UK/EU data centers. When data is transferred internationally 
                (e.g., to OpenAI for processing), we ensure adequate safeguards are in place, including Standard 
                Contractual Clauses (SCCs) approved by the ICO.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                13. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                We may update this policy from time to time. We will notify you of significant changes via email 
                or a prominent notice on our platform. Continued use after changes constitutes acceptance.
              </p>
            </section>

            {/* Contact and Complaints */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                14. Contact Us and Complaints
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                For privacy questions or to exercise your rights, contact us:
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-900 dark:text-white font-medium">Simple Rubriq Data Protection</p>
                <p className="text-gray-700 dark:text-gray-300">Email: privacy@simplrubriq.com</p>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                You have the right to lodge a complaint with the UK Information Commissioner's Office (ICO):
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mt-2">
                <p className="text-gray-900 dark:text-white font-medium">Information Commissioner's Office</p>
                <p className="text-gray-700 dark:text-gray-300">Website: ico.org.uk</p>
                <p className="text-gray-700 dark:text-gray-300">Helpline: 0303 123 1113</p>
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
