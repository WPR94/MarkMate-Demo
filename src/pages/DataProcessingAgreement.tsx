import { Link } from 'react-router-dom';

export default function DataProcessingAgreement() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Data Processing Agreement (DPA)
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            For Schools and Educational Institutions using Simple Rubriq
          </p>

          <div className="prose dark:prose-invert max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                This Data Processing Agreement ("DPA") forms part of the Terms of Service between the educational 
                institution ("Data Controller") and Simple Rubriq ("Data Processor") for the processing of personal 
                data in accordance with UK GDPR and Data Protection Act 2018.
              </p>
            </section>

            {/* Definitions */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Definitions
              </h2>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Personal Data:</strong> Student names, email addresses (optional), essay content, grades, and feedback</li>
                <li><strong>Processing:</strong> Any operation performed on personal data, including storage, analysis, and AI-powered grading</li>
                <li><strong>Data Subject:</strong> Students whose personal data is processed</li>
                <li><strong>Controller:</strong> The school or educational institution using Simple Rubriq</li>
                <li><strong>Processor:</strong> Simple Rubriq and its sub-processors (Supabase, OpenAI)</li>
              </ul>
            </section>

            {/* Scope and Purpose */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Scope and Purpose of Processing
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Simple Rubriq processes personal data solely for the purpose of:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Providing AI-powered essay grading services</li>
                <li>Generating structured feedback based on teacher-defined rubrics</li>
                <li>Storing student records and grade history</li>
                <li>Providing analytics and reporting to teachers</li>
              </ul>
            </section>

            {/* Data Controller Obligations */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Data Controller Obligations
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The Controller (school) warrants that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>It has lawful authority to process student data under UK GDPR Article 6</li>
                <li>It has obtained necessary consents from students or guardians where required</li>
                <li>It complies with all applicable data protection laws</li>
                <li>It provides fair processing notices to data subjects</li>
                <li>It maintains records of processing activities</li>
              </ul>
            </section>

            {/* Data Processor Obligations */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Data Processor Obligations
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Simple Rubriq (Processor) commits to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Process personal data only on documented instructions from the Controller</li>
                <li>Ensure confidentiality of persons authorized to process personal data</li>
                <li>Implement appropriate technical and organizational security measures (see Section 5)</li>
                <li>Engage sub-processors only with prior written consent</li>
                <li>Assist the Controller in responding to data subject rights requests</li>
                <li>Delete or return personal data upon termination of services</li>
                <li>Make available all information necessary to demonstrate compliance</li>
              </ul>
            </section>

            {/* Security Measures */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Security Measures (UK GDPR Article 32)
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Simple Rubriq implements the following security measures:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Encryption:</strong> TLS/HTTPS for data in transit, AES-256 for data at rest</li>
                <li><strong>Access Control:</strong> Row-level security (RLS) policies, role-based access</li>
                <li><strong>Authentication:</strong> Secure password hashing (bcrypt), session management</li>
                <li><strong>Monitoring:</strong> Audit logs, security alerts, intrusion detection</li>
                <li><strong>Backup:</strong> Daily encrypted backups with 90-day retention</li>
                <li><strong>Incident Response:</strong> 72-hour breach notification protocol</li>
              </ul>
            </section>

            {/* Sub-Processors */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Sub-Processors
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Simple Rubriq uses the following approved sub-processors:
              </p>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 mb-4">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Sub-Processor</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Service</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Supabase</td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Database & Auth</td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">UK/EU (AWS)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">OpenAI</td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">AI Grading</td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">USA (SCCs)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Vercel</td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Hosting</td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Global CDN</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-gray-700 dark:text-gray-300">
                All sub-processors are bound by Standard Contractual Clauses (SCCs) for international transfers.
              </p>
            </section>

            {/* Data Subject Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Data Subject Rights Assistance
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Simple Rubriq will assist the Controller in responding to data subject requests within 72 hours:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Access Requests:</strong> Export all student data via Account Settings</li>
                <li><strong>Rectification:</strong> Edit student records directly in the platform</li>
                <li><strong>Erasure:</strong> Delete individual students or entire account</li>
                <li><strong>Portability:</strong> JSON export of all data</li>
              </ul>
            </section>

            {/* Data Breach Notification */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Data Breach Notification
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                In the event of a personal data breach, Simple Rubriq will notify the Controller within 72 hours 
                via email at the registered contact address. The notification will include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-4">
                <li>Nature of the breach and categories of data affected</li>
                <li>Likely consequences of the breach</li>
                <li>Measures taken to address the breach</li>
                <li>Recommendations for Controller action</li>
              </ul>
            </section>

            {/* Data Retention and Deletion */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Data Retention and Deletion
              </h2>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Data is retained while the Controller's account is active</li>
                <li>Upon account deletion, all personal data is permanently deleted within 30 days</li>
                <li>Backup copies are securely deleted within 90 days</li>
                <li>No data is retained beyond legal requirements</li>
              </ul>
            </section>

            {/* Audit Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Audit Rights
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                The Controller has the right to audit Simple Rubriq's compliance with this DPA. Audits may be conducted 
                once per year with 30 days' notice. Simple Rubriq will provide all necessary documentation and access.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Termination
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Upon termination of services, Simple Rubriq will:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-4">
                <li>Delete or return all personal data within 30 days</li>
                <li>Provide written certification of deletion if requested</li>
                <li>Ensure sub-processors also delete personal data</li>
              </ul>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                12. Governing Law
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                This DPA is governed by the laws of England and Wales and subject to UK GDPR and DPA 2018.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                13. Contact for DPA Execution
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                To execute this Data Processing Agreement for your institution, contact:
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-900 dark:text-white font-medium">Simple Rubriq Legal Department</p>
                <p className="text-gray-700 dark:text-gray-300">Email: dpa@simplrubriq.com</p>
                <p className="text-gray-700 dark:text-gray-300">Subject: DPA Execution Request</p>
              </div>
            </section>
          </div>

          {/* Back Link */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/privacy"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              ← Back to Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
