import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const TermsOfService = () => {
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
            <FileText className="h-6 w-6 text-blue-800 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            <strong>Last updated:</strong> June 13, 2025
          </p>

          <div className="space-y-8">
            <section className="mb-8">
              <p className="text-gray-700 mb-4">
                These Terms of Service ("ToS") govern your access to and use of the SEO Snap website, platform, products, and services (collectively, the "Service") provided by SEO Snap ("SEO Snap," "we," "us," or "our"). By registering for, accessing, or using the Service, you affirmatively agree to these ToS and our Privacy Policy. If you do not agree to these terms, you must immediately discontinue use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                SEO Snap offers an AI-driven solution designed to generate SEO-related metadata—such as page titles, meta descriptions, and tags—based on user-uploaded images. These ToS set forth the terms and conditions under which we grant you access to the Service, govern your rights and responsibilities, and help protect our proprietary technology.
              </p>
              <p className="text-gray-700 mb-4">
                You acknowledge that these ToS form a legally binding agreement between you and SEO Snap. They apply whether you access the Service directly via our website at www.seosnap.com or through any affiliated platform.
              </p>
              <p className="text-gray-700 mb-4">
                SEO Snap reserves the right to modify or update these ToS at any time. We will provide notice of material changes via email or by posting them on our website. Continued use following changes constitutes acceptance of the updated ToS.
              </p>
              <p className="text-gray-700 mb-4">
                By using the Service, you confirm that you have read, understood, and agree to be bound by these ToS and all referenced policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Age Restriction</h3>
                <p className="text-gray-700 mb-4">
                  To use the Service, you must be at least 13 years of age. If you are between ages 13-17, you must have permission from a parent or legal guardian and agree to these ToS on their behalf. Use by anyone under 13 is strictly prohibited.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Authority to Contract</h3>
                <p className="text-gray-700 mb-4">
                  If accessing the Service on behalf of a company, organization, or other legal entity, you represent and warrant that you have full authority to bind such entity. In such cases, "you" or "your" refers to both the individual user and the entity being represented.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Definitions</h2>
              <p className="text-gray-700 mb-4">The following capitalized terms have the meanings specified throughout this agreement:</p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <p><strong>"Account"</strong> means your user account created on our platform, which includes login credentials, subscription status, and profile information.</p>
                <p><strong>"User," "you," or "your"</strong> refers to any person or entity who accesses or uses the Service under these ToS.</p>
                <p><strong>"User Content"</strong> means any image, text, or other content you upload or submit through the Service.</p>
                <p><strong>"AI-Generated Content"</strong> refers to titles, descriptions, meta tags, or other SEO metadata created by our AI algorithms based on your User Content.</p>
                <p><strong>"Generation"</strong> means each individual instance in which you trigger the Service to generate metadata.</p>
                <p><strong>"Tag"</strong> refers to each distinct SEO meta tag output included in a Generation.</p>
                <p><strong>"Free Plan," "Starter Plan," and "Pro Plan"</strong> refer to our three tiers of subscription-based access, each with specific usage limits.</p>
                <p><strong>"Subscription Plan"</strong> means the particular tier you are enrolled in at any time.</p>
                <p><strong>"Subscription Period"</strong> means the recurring billing cycle associated with your plan, whether monthly or annual.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Account and Registration</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Account Creation</h3>
                <p className="text-gray-700 mb-4">
                  You must register and create an Account to use most features of the Service. During registration, you agree to provide accurate, up-to-date, and complete information, including a valid email address and a secure password.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Account Security</h3>
                <p className="text-gray-700 mb-4">
                  You are responsible for maintaining the confidentiality of your credentials. You agree to notify us immediately if your password or Account is compromised. All activities conducted through your Account are your responsibility—even if unauthorized—unless the cause was wholly attributable to our breach of security.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Unauthorized Access</h3>
                <p className="text-gray-700 mb-4">
                  SEO Snap is not liable for losses arising from unauthorized access to your Account, provided reasonable security measures were in place. We encourage the use of strong, unique passwords and two-factor authentication where available.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.4 Account Termination and Suspension</h3>
                <p className="text-gray-700 mb-4">
                  We may suspend or terminate your Account, with or without notice, if you violate these ToS (including unauthorized submissions, infringement, or fraudulent activity). Termination shall not release you from obligations incurred while your Account was active, including payment obligations, indemnification, and usage compliance.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Subscription Plans & Features</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 General Overview</h3>
                <p className="text-gray-700 mb-4">Our Service offers three subscription tiers:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li><strong>Free Plan:</strong> Limited access with up to 5 Generations and up to 5 Tags per Subscription Period—designed for trial evaluation.</li>
                  <li><strong>Starter Plan:</strong> Includes up to 50 Generations and up to 10 Tags per Subscription Period.</li>
                  <li><strong>Pro Plan:</strong> Includes up to 200 Generations and up to 15 Tags per Subscription Period.</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  Descriptions of features, usage limits, and pricing are provided on our website and within your Account dashboard.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Usage Limits and Access</h3>
                <p className="text-gray-700 mb-4">
                  Each Plan restricts your access based on defined limits. When your usage exceeds your plan's allocated Generations or Tags, you will be blocked from further use until either the start of the next Subscription Period or until you upgrade your Plan. We may, at our discretion, temporarily restrict or reduce usage even on the Free Plan.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5.3 Upgrades and Downgrades</h3>
                <p className="text-gray-700 mb-4">
                  You may upgrade or downgrade between Plans at any time via your Account dashboard. Upgrades become effective immediately on a prorated basis; downgrades take effect at the end of your current Subscription Period. You remain responsible for all applicable fees and any before-period usage.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Free Trial Terms</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Trial Eligibility</h3>
                <p className="text-gray-700 mb-4">
                  Eligible users may enroll in the Free Plan for trial use. This access is limited strictly to 5 Generations and 5 Tags per Subscription Period.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Termination of Trial Access</h3>
                <p className="text-gray-700 mb-4">
                  We may revoke Free Plan access at our discretion—if, for example, a user repeatedly abuses the trial offering or uses the Service in a manner inconsistent with the intent of the plan. Early termination of trial does not waive your responsibility for any Terms violations.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 Transition to Paid Plan</h3>
                <p className="text-gray-700 mb-4">
                  We may offer reminders or prompts to upgrade from Free to Paid Plans during or after the trial. Transitioning requires you to select a Paid Plan and provide payment details as described in Section 7.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Subscription Fees & Billing</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Fee Schedule</h3>
                <p className="text-gray-700 mb-4">
                  Fees for the Starter and Pro Plans are listed on our website and may be updated from time to time. All fees are in USD and exclusive of applicable taxes which may be added to your invoice.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Payment Methods</h3>
                <p className="text-gray-700 mb-4">
                  We support multiple payment processors, including Stripe, PayPal, and others. You agree to provide current, complete, and accurate billing information. By subscribing, you authorize recurring charges on your payment method at the start of each Subscription Period.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">7.3 Billing Authorization</h3>
                <p className="text-gray-700 mb-4">
                  You expressly authorize SEO Snap to charge your designated payment provider for all applicable subscription fees for each Subscription Period until you cancel pursuant to Section 9. If payment is not received or a charge is disputed or declined, we reserve the right to suspend or terminate your Account without notice.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">7.4 Taxes and Charges</h3>
                <p className="text-gray-700 mb-4">
                  You are responsible for all taxes, duties, or charges imposed by any governmental authority. If SEO Snap is required to pay such taxes, we may require reimbursement or invoice the amounts owed.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">7.5 Fee Changes</h3>
                <p className="text-gray-700 mb-4">
                  We may change subscription fees at any time for new customers by posting updated pricing on our website. Existing subscribers will be notified at least 30 days before any price increase—changes will apply at the start of the next Subscription Period.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Billing Authorization & Automatic Renewal</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">8.1 Recurring Billing</h3>
                <p className="text-gray-700 mb-4">
                  By subscribing to a Paid Plan, you authorize SEO Snap to automatically charge your chosen payment method at the beginning of each Subscription Period, without need for further approval.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">8.2 Renewal Notifications</h3>
                <p className="text-gray-700 mb-4">
                  We will attempt to notify you prior to any renewal (e.g., via email or in-app notification), but failure to receive such notice does not cancel your obligation to pay.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">8.3 Failed Payment</h3>
                <p className="text-gray-700 mb-4">
                  If your payment method fails, we may notify you and provide a brief grace period (typically 7–14 days) to update your payment details. If unresolved, we may suspend or terminate your access, without refund, until payment is made.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Cancellation Policy</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">9.1 How to Cancel</h3>
                <p className="text-gray-700 mb-4">
                  You can cancel your subscription at any time through your Account settings. Cancellation will stop automatic renewal at the end of your current Subscription Period.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">9.2 Effect of Cancellation</h3>
                <p className="text-gray-700 mb-4">
                  After you cancel, you retain access to your plan's features through the end of the current Subscription Period.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">9.3 Post-Cancellation</h3>
                <p className="text-gray-700 mb-4">
                  After your Subscription Period ends, your Account will revert to the Free Plan or be deactivated, depending on your usage history. Your remaining data—including previously generated metadata—will be accessible, unless and until you delete your content or request deletion.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. No Refund Policy</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">10.1 Non-Refundable Fees</h3>
                <p className="text-gray-700 mb-4">
                  Subscription fees are non-refundable once payment is processed.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">10.2 Proration & Downgrades</h3>
                <p className="text-gray-700 mb-4">
                  Upgrades are prorated at the time of change. Downgrades take effect at the end of the period, with no credit or refund for unused time.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">10.3 Refund Exceptions</h3>
                <p className="text-gray-700 mb-4">
                  We reserve the discretion to grant refunds in special circumstances (e.g., duplicate charges or software malfunctions), but these are exceptions, not rights.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. User Content License</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">11.1 Your Rights</h3>
                <p className="text-gray-700 mb-4">
                  You retain full ownership of all intellectual property rights in any User Content you upload.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">11.2 License Grant to SEO Snap</h3>
                <p className="text-gray-700 mb-4">
                  By uploading Content, you grant us a non-exclusive, worldwide, royalty-free license to process, reproduce, host, and analyze your Content to deliver Service, protect our rights, and meet legal requirements.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">11.3 User Representation</h3>
                <p className="text-gray-700 mb-4">
                  You represent and warrant that you have all necessary rights—ownership, licenses, consents—to upload Content and grant this license.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">11.4 Prohibited Content</h3>
                <p className="text-gray-700 mb-4">
                  You agree not to upload any content that is unlawful, infringing, defamatory, obscene, or otherwise objectionable. SEO Snap may remove such Content at our discretion and suspend your Account for violations.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. AI-Generated Content Ownership & Use</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">12.1 Ownership of AI Outputs</h3>
                <p className="text-gray-700 mb-4">
                  All AI-Generated Content produced for you belongs to you once generated, and you may use it for any lawful purpose, including commercial use.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">12.2 License Back to SEO Snap</h3>
                <p className="text-gray-700 mb-4">
                  You grant SEO Snap a limited, non-exclusive, royalty-free license to use anonymized, aggregated AI outputs for internal analysis, research, product improvement, or quality assurance.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">12.3 No Warranty</h3>
                <p className="text-gray-700 mb-4">
                  SEO Snap does not guarantee the accuracy, suitability, or performance of AI-Generated Content, nor results from its use. You use outputs at your own risk and discretion.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Acceptable Use & Prohibited Activities</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">13.1 Acceptable Use</h3>
                <p className="text-gray-700 mb-4">
                  You may use the Service for lawful, non-commercial or commercial purposes consistent with these ToS.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">13.2 Prohibited Activities</h3>
                <p className="text-gray-700 mb-4">You must not:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Violate any laws or regulations;</li>
                  <li>Infringe on intellectual property rights;</li>
                  <li>Upload harmful content (malware, spyware, viruses);</li>
                  <li>Attempt to reverse-engineer the AI or Service infrastructure;</li>
                  <li>Use the Service to harass, threaten, or otherwise wrongfully target others;</li>
                  <li>Use bots, scripts, or automation tools to access or scrape the Service;</li>
                  <li>Attempt to overload, damage, or negatively affect the Service.</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">13.3 Enforcement</h3>
                <p className="text-gray-700 mb-4">
                  SEO Snap reserves the right to monitor use and enforce these rules. Violators may have content removed, Accounts suspended, or legal action taken.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Intellectual Property Rights</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">14.1 Our Rights</h3>
                <p className="text-gray-700 mb-4">
                  All Service-related content—including software, visual design, text, AI models, and trademarks—is owned or licensed by SEO Snap, and is protected by U.S. and international intellectual property laws.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">14.2 Limited License to Users</h3>
                <p className="text-gray-700 mb-4">
                  Subject to these ToS, you are granted a limited, non-exclusive, non-transferable, non-sublicensable license to access and use the Service. Except as permitted, you may not copy, distribute, modify, or create derivative works from any of our materials.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">14.3 Infringement Claims</h3>
                <p className="text-gray-700 mb-4">
                  If you believe your intellectual property rights have been infringed, please contact us via the process described in our Privacy Policy.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Third-Party Services & Integrations</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">15.1 Payment Processors</h3>
                <p className="text-gray-700 mb-4">
                  We use third-party payment processors (e.g., Stripe, PayPal) to handle billing; by using our Service, you agree to their respective terms and privacy policies.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">15.2 Service Integrations</h3>
                <p className="text-gray-700 mb-4">
                  We may integrate with third-party platforms (e.g., hosting providers, AI infrastructure). Those providers may collect data as outlined in their own policies; SEO Snap is not responsible for their conduct.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">15.3 No Endorsement</h3>
                <p className="text-gray-700 mb-4">
                  References to third-party products or services do not imply endorsement by SEO Snap.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Privacy & Data Usage</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">16.1 Privacy Policy</h3>
                <p className="text-gray-700 mb-4">
                  Our Privacy Policy governs collection, use, disclosure, and storage of data obtained through the Service. By using the Service, you agree to that policy.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">16.2 Image Handling</h3>
                <p className="text-gray-700 mb-4">
                  We process uploaded images to generate metadata. Unless otherwise disclosed, we delete images after processing or after a defined retention period.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">16.3 Compliance</h3>
                <p className="text-gray-700 mb-4">
                  We comply with applicable data protection laws (e.g., GDPR, CCPA). If you are a California resident with specific rights, refer to our Privacy Policy for details.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Data Retention & Image Deletion</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">17.1 Retention Period</h3>
                <p className="text-gray-700 mb-4">
                  Uploaded images and generated outputs are retained until deletion by you or until our retention policy triggers auto-deletion.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">17.2 User Deletion Requests</h3>
                <p className="text-gray-700 mb-4">
                  You may request deletion of your images and Account data at any time. We will process such requests in accordance with applicable law.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">17.3 Legal Hold</h3>
                <p className="text-gray-700 mb-4">
                  We may retain or disclose data to comply with legal obligations, investigations, or enforcement of our terms.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">18. Security Measures</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">18.1 Industry Standards</h3>
                <p className="text-gray-700 mb-4">
                  We implement reasonable administrative, technical, and physical safeguards to protect user data.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">18.2 Limitations</h3>
                <p className="text-gray-700 mb-4">
                  No system is entirely secure. We are not liable for breach due solely to factors beyond our reasonable control.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">18.3 Reporting</h3>
                <p className="text-gray-700 mb-4">
                  You must promptly notify us of any known or suspected security incidents involving your Account or data.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">19. Disclaimer of Warranties</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">19.1 "AS-IS" Basis</h3>
                <p className="text-gray-700 mb-4">
                  The Service is provided "as is" and "as available," without any warranty. You use the Service at your own risk.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">19.2 No Representations</h3>
                <p className="text-gray-700 mb-4">
                  SEO Snap makes no guarantees about the accuracy, completeness, reliability, performance, effectiveness, or fitness for a particular purpose of any output.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">19.3 No Unintended Reliance</h3>
                <p className="text-gray-700 mb-4">
                  We do not warrant that the Service will improve your SEO rankings or deliver specific business results.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">20. Limitation of Liability</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">20.1 Indirect Damages Excluded</h3>
                <p className="text-gray-700 mb-4">
                  To the fullest extent permitted by law, SEO Snap shall not be liable for any indirect, incidental, punitive, special, or consequential damages.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">20.2 Cap on Direct Damages</h3>
                <p className="text-gray-700 mb-4">
                  Our total liability for direct damages under or relating to these ToS shall not exceed the amount you paid us in the 6 months preceding the event giving rise to the claim.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">20.3 Exceptions</h3>
                <p className="text-gray-700 mb-4">
                  These limitations do not apply to liability resulting from gross negligence or willful misconduct.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">21. Indemnification</h2>
              <p className="text-gray-700 mb-4">You agree to indemnify, defend, and hold SEO Snap and its affiliates harmless from any claims, costs, damages, or expenses (including legal fees) arising from:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Your use of the Service in violation of these ToS,</li>
                <li>Any User Content you submit,</li>
                <li>Interaction with third parties via the Service,</li>
                <li>Infringement of third-party rights due to your actions or omissions.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">22. Term & Termination</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">22.1 Term</h3>
                <p className="text-gray-700 mb-4">
                  These ToS are effective upon your first use of the Service and remain in effect until terminated.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">22.2 Termination by You</h3>
                <p className="text-gray-700 mb-4">
                  You may terminate your Account at any time via your Account settings.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">22.3 Termination by Us</h3>
                <p className="text-gray-700 mb-4">
                  We may suspend or terminate your access for any breach or suspected misuse, with or without notice.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">22.4 Effect of Termination</h3>
                <p className="text-gray-700 mb-4">
                  On termination, your Account will cease access to paid features. We may retain anonymized data but remove personally identifiable information, subject to legal obligations.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">23. Modifications to Terms or Services</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">23.1 Service Changes</h3>
                <p className="text-gray-700 mb-4">
                  We may modify, suspend, or discontinue any aspect of the Service, including features or content, without liability.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">23.2 Updating Terms</h3>
                <p className="text-gray-700 mb-4">
                  We reserve the right to update these ToS. We will notify you of material changes at least 30 days before they take effect. Continued use constitutes acceptance of changes.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">23.3 Review of Terms</h3>
                <p className="text-gray-700 mb-4">
                  It is your responsibility to review the ToS regularly. If you disagree with any changes, your remedy is to stop using the Service.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">24. Governing Law & Dispute Resolution</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">24.1 Governing Law</h3>
                <p className="text-gray-700 mb-4">
                  These ToS shall be governed by the laws of the state in which SEO Snap is registered and operates (as disclosed to users), without regard to its conflict of law provisions.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">24.2 Dispute Resolution</h3>
                <p className="text-gray-700 mb-4">
                  Except for small claims or statutory claims, any dispute shall be resolved by final and binding arbitration under the American Arbitration Association's rules.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">24.3 Location & Fees</h3>
                <p className="text-gray-700 mb-4">
                  Arbitration will occur in the county where SEO Snap is registered. Each party shall bear its own costs, but the arbitrator may award fees as allowed by law.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">24.4 Small Claims & Injunctive Relief</h3>
                <p className="text-gray-700 mb-4">
                  You may bring small claims in your local court. Either party may seek injunctive relief in court to prevent irreparable harm.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">25. Miscellaneous Provisions</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">25.1 Entire Agreement</h3>
                <p className="text-gray-700 mb-4">
                  These ToS, together with the Privacy Policy and any additional policies we reference, constitute the entire agreement between you and SEO Snap.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">25.2 Severability</h3>
                <p className="text-gray-700 mb-4">
                  If a provision is found invalid or unenforceable, the remainder will continue in full force and effect.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">25.3 Waiver</h3>
                <p className="text-gray-700 mb-4">
                  No action or failure to enforce any provision constitutes a waiver of any right under the ToS.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">25.4 Assignment</h3>
                <p className="text-gray-700 mb-4">
                  You may not assign or transfer your rights under these ToS. We may assign our rights to an affiliate or in connection with a merger or acquisition.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">25.5 Force Majeure</h3>
                <p className="text-gray-700 mb-4">
                  We are not liable for delays or failures due to events beyond reasonable control (e.g., acts of God, cyberattack, pandemics).
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">25.6 Notices</h3>
                <p className="text-gray-700 mb-4">
                  We may send notice via email or in-app messaging; you agree to receive electronic communication.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">25.7 Contact</h3>
                <p className="text-gray-700 mb-4">
                  For support, legal, or other inquiries, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2"><strong>SEO Snap</strong></p>
                  <p className="text-gray-700 mb-2">_______________________[Insert Physical Address]</p>
                  <p className="text-gray-700">_______________________Email: [Insert Support/Legal Email]</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;