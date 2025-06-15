import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            to="/" 
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Home
          </Link>
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-blue-800 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            <strong>Last updated:</strong> June 13, 2025
          </p>

          <div className="space-y-8">
            <section className="mb-8">
              <p className="text-gray-700 mb-4">
                At SEO Snap ("we," "us," or "our"), we value your trust in granting us access to your personal information. This Privacy Policy describes what data we collect, how we use and protect it, and your choices regarding that data—whether you're visiting www.seosnap.com, using our services, or otherwise engaging with us.
              </p>
              <p className="text-gray-700 mb-4">
                By accessing or using our website, platform, or services, you acknowledge that you have read and understood this Privacy Policy and consent to its terms. If you do not agree, please do not use or access our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">1.1 Account Information</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Name, email address, password, and other registration details.</li>
                  <li>Subscription metrics, including plan tier, billing cycle, and usage caps.</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">1.2 User Content</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Images uploaded by you to generate metadata.</li>
                  <li>Any text, tags, or descriptive inputs you choose to provide.</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">1.3 Technical & Usage Data</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Device information (e.g., device type, operating system).</li>
                  <li>Log data including IP address, times accessed, errors, and browser type.</li>
                  <li>Usage data such as number of generations, tags created, session duration.</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">1.4 Transactional Information</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Billing and payment information (e.g., billing address). Payment card data is handled exclusively by our payment processors.</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Collect Information</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Direct Collection</h3>
                <p className="text-gray-700 mb-4">
                  You provide personal data when registering, updating profile, uploading images, subscribing, or contacting support.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Automated Collection</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Cookies and similar technologies gather usage details.</li>
                  <li>Analytics tools (e.g., Google Analytics) collect site usage metrics.</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Third-Party Sources</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>From payment processors (e.g., Stripe, PayPal) to validate transactions.</li>
                  <li>From service providers (e.g., hosting, AI infrastructure) under contract with SEO Snap.</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Purpose of Data Collection</h2>
              <p className="text-gray-700 mb-4">We utilize collected data for the following purposes:</p>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Service Delivery & Improvement</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>To process images and generate metadata.</li>
                  <li>To monitor usage and ensure Service functionality.</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Account and Billing Management</h3>
                <p className="text-gray-700 mb-4">
                  To manage subscriptions, process payments, and send invoices or renewal notifications.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Communications & Support</h3>
                <p className="text-gray-700 mb-4">
                  To respond to support inquiries and provide service-related notices, updates, or alerts.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.4 Research & Analytics</h3>
                <p className="text-gray-700 mb-4">
                  To understand usage trends, analyze performance, and improve our AI algorithms and platform.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.5 Legal Compliance & Protection</h3>
                <p className="text-gray-700 mb-4">
                  To help comply with laws, enforce policies, and protect SEO Snap, users, and third parties.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Use of Uploaded Images</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 AI Processing</h3>
                <p className="text-gray-700 mb-4">
                  Images you upload are analyzed to generate SEO metadata. The process is automated and limited to functionality.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Storage and Retention</h3>
                <p className="text-gray-700 mb-4">
                  Images are stored temporarily for processing and may be retained per our data retention policy, unless you request deletion earlier.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 No Resale or Redistribution</h3>
                <p className="text-gray-700 mb-4">
                  Uploaded images are used solely to provide and improve our Service. We do not share or sell your images externally.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.4 Anonymization for R&D Use</h3>
                <p className="text-gray-700 mb-4">
                  With data retention, anonymized outputs may be aggregated to improve service quality without identifying individual users.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Use of AI and Automated Tools</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Overview of AI Use</h3>
                <p className="text-gray-700 mb-4">
                  SEO Snap uses proprietary or licensed AI models to analyze images and produce metadata.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 No Personal Profiling</h3>
                <p className="text-gray-700 mb-4">
                  AI is applied only for generating metadata and not for profiling or decision-making beyond this process.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5.3 Model Training (Aggregate Only)</h3>
                <p className="text-gray-700 mb-4">
                  We may train algorithms on anonymized, aggregated patterns of usage, not personal data.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Similar Technologies</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Types of Cookies</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Essential cookies for site navigation and session management.</li>
                  <li>Analytics cookies to monitor performance and usage.</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 How to Control Cookies</h3>
                <p className="text-gray-700 mb-4">
                  Adjust browser or device settings to decline cookies, though vital features may be impacted. Opt-out of analytics by following instructions in our cookie banner or by visiting third-party policy pages (Google Analytics, etc.).
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 Third-Party Cookies</h3>
                <p className="text-gray-700 mb-4">
                  We may allow third-party providers to place cookies via our platform. Their policies are beyond SEO Snap's control.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Payment Information</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Use of Payment Processors</h3>
                <p className="text-gray-700 mb-4">
                  We utilize Stripe, PayPal, or other third-party processors; we do not store full payment card details ourselves.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Billing Data</h3>
                <p className="text-gray-700 mb-4">
                  We collect billing address and transaction amounts to fulfill orders, but sensitive account data remains with the processor.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">7.3 Shared Responsibility</h3>
                <p className="text-gray-700 mb-4">
                  By paying, you accept both our terms and the payment processors' privacy and security standards.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Legal Bases for Data Processing</h2>
              <p className="text-gray-700 mb-4">Under U.S. privacy law and standards:</p>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">8.1 Contractual Necessity</h3>
                <p className="text-gray-700 mb-4">
                  We process your email, billing, and subscription data to fulfill our agreement and deliver the Service.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">8.2 Legitimate Interests</h3>
                <p className="text-gray-700 mb-4">
                  We analyze usage data to secure, enhance, and maintain the Service, always balancing your reasonable expectations.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">8.3 Compliance</h3>
                <p className="text-gray-700 mb-4">
                  We may process data to respond to lawful requests, legal obligations, or to protect user safety.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">8.4 Consent</h3>
                <p className="text-gray-700 mb-4">
                  You consent to non-essential data processing (e.g., analytics cookies) by accepting our cookie banner or using the Service.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Sharing of Information</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">9.1 Service Providers</h3>
                <p className="text-gray-700 mb-4">
                  Data may be shared with payment processors, hosting platforms, analytics services, or other vendors under strict contractual limits.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">9.2 Legal Compliance</h3>
                <p className="text-gray-700 mb-4">
                  We may disclose data to comply with legal process, enforce our Terms, or respond to legal conditions (like court orders).
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">9.3 Business Transfers</h3>
                <p className="text-gray-700 mb-4">
                  In the event of a reorganization, sale, or asset transfer, only data necessary for the new entity to continue the Service may be transferred.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">9.4 Anonymized and Aggregated Data</h3>
                <p className="text-gray-700 mb-4">
                  We may use or disclose data that's anonymized or aggregated so it can no longer identify individuals.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Data Retention Policy</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">10.1 Retention Duration</h3>
                <p className="text-gray-700 mb-4">
                  We retain your Account and subscription data for the duration of your use and a period after termination as needed for legal compliance (e.g., billing records retention).
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">10.2 Image and Output Retention</h3>
                <p className="text-gray-700 mb-4">
                  User Content and AI-generated metadata are retained until deleted by you or following our data retention schedule (e.g., up to 12 months).
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">10.3 Deletion Requests</h3>
                <p className="text-gray-700 mb-4">
                  If you request data deletion or cancellation, we will remove your personal and image data within a reasonable timeframe, unless retention is legally justified.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">10.4 Legal Holds</h3>
                <p className="text-gray-700 mb-4">
                  If subject to legal or compliance inquiries, we may retain specific data until all obligations are satisfied.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Your Privacy Rights</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">11.1 Access and Correction</h3>
                <p className="text-gray-700 mb-4">
                  You have the right to access the personal information we hold about you. Upon request, we will provide you with a summary of this information and make corrections if it is inaccurate or incomplete.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">11.2 Data Deletion and Portability</h3>
                <p className="text-gray-700 mb-4">
                  You may request the deletion of your data or a copy of your data in a portable format. We will comply within a reasonable timeframe, unless retention is legally required.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">11.3 Objections and Restrictions</h3>
                <p className="text-gray-700 mb-4">
                  You may object to or restrict certain types of data processing, including for direct marketing purposes.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">11.4 Marketing Communications</h3>
                <p className="text-gray-700 mb-4">
                  You may opt out of receiving promotional emails from us by clicking "unsubscribe" in our emails or updating your Account settings.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. California Residents – CCPA Notice</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">12.1 Your Rights Under CCPA</h3>
                <p className="text-gray-700 mb-4">If you are a California resident, you may have the following rights under the California Consumer Privacy Act (CCPA):</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Right to know what personal information we collect and how we use it.</li>
                  <li>Right to request deletion of your personal information.</li>
                  <li>Right to opt out of the sale of your personal information (SEO Snap does not sell personal data).</li>
                  <li>Right to non-discrimination for exercising your privacy rights.</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">12.2 Exercising Your CCPA Rights</h3>
                <p className="text-gray-700 mb-4">
                  You can make requests under the CCPA by contacting us at _________________-[Insert Email] with "CCPA Request" in the subject line. We may need to verify your identity before fulfilling your request.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Children's Privacy – COPPA Compliance</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">13.1 Minimum Age Requirement</h3>
                <p className="text-gray-700 mb-4">
                  Our Service is not intended for children under 13. We do not knowingly collect personal information from anyone under this age.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">13.2 Actions if Underage Use is Detected</h3>
                <p className="text-gray-700 mb-4">
                  If we become aware that a child under 13 has provided us with personal data, we will delete such data immediately and terminate the Account if applicable.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">13.3 Parental Rights</h3>
                <p className="text-gray-700 mb-4">
                  If you are a parent or legal guardian and believe your child has used our Service, please contact us to request account deletion and data removal.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Security Measures</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">14.1 Technical Safeguards</h3>
                <p className="text-gray-700 mb-4">
                  We use encryption, secure server hosting, access controls, and monitoring tools to protect your data.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">14.2 Organizational Measures</h3>
                <p className="text-gray-700 mb-4">
                  Only authorized personnel have access to personal data, and we train our team on data protection principles.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">14.3 No Guarantee</h3>
                <p className="text-gray-700 mb-4">
                  While we take reasonable precautions, no method of transmission or storage is 100% secure. You use our Service at your own risk and are responsible for securing your Account credentials.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. International Data Transfers</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">15.1 U.S.-Based Operations</h3>
                <p className="text-gray-700 mb-4">
                  Our servers and services are based in the United States. If you are accessing from outside the U.S., you consent to transferring your data to and being governed by U.S. privacy laws.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">15.2 Transfer Mechanisms</h3>
                <p className="text-gray-700 mb-4">
                  Where required, we implement safeguards (e.g., Standard Contractual Clauses) for international data transfers in compliance with applicable laws.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Third-Party Links and Services</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">16.1 External Websites</h3>
                <p className="text-gray-700 mb-4">
                  Our website may contain links to third-party websites or services. We are not responsible for their privacy practices or content.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">16.2 User Responsibility</h3>
                <p className="text-gray-700 mb-4">
                  We encourage you to review the privacy policies of those third-party sites before submitting any personal information.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Policy Updates</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">17.1 Right to Update</h3>
                <p className="text-gray-700 mb-4">
                  We may update this Privacy Policy from time to time. When we do, we will revise the "Last Updated" date at the top.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">17.2 Notification of Material Changes</h3>
                <p className="text-gray-700 mb-4">
                  If changes significantly impact your rights or obligations, we will notify you by email or a prominent notice on our website.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">17.3 Continued Use as Acceptance</h3>
                <p className="text-gray-700 mb-4">
                  By continuing to use the Service after changes are posted, you agree to the updated Privacy Policy.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">18. Data Breach Procedures</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">18.1 Breach Notification</h3>
                <p className="text-gray-700 mb-4">
                  If we become aware of a data breach that affects your personal information, we will notify you and any relevant authorities as required by applicable law.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">18.2 Remedial Measures</h3>
                <p className="text-gray-700 mb-4">
                  We will investigate the cause, mitigate the breach, and take appropriate action to prevent recurrence.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">19. Do Not Track & Global Privacy Control (GPC)</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">19.1 Do Not Track</h3>
                <p className="text-gray-700 mb-4">
                  Some browsers support Do Not Track (DNT). We currently do not respond to DNT signals, as there is no consistent industry standard.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">19.2 GPC Signal Recognition</h3>
                <p className="text-gray-700 mb-4">
                  If supported by your browser, we may honor Global Privacy Control signals as a valid request to opt out of certain tracking.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">20. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions, concerns, or to exercise your rights under this Privacy Policy, contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>SEO Snap</strong></p>
                <p className="text-gray-700 mb-2">_________________________[Insert Physical Business Address]</p>
                <p className="text-gray-700 mb-4">Email: [Insert Dedicated Privacy or Support Email]</p>
                <p className="text-gray-700 text-sm">
                  We respond to all inquiries in accordance with applicable law and aim to reply within 30 days.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;