import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie } from 'lucide-react';

const CookiePolicy = () => {
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
            <Cookie className="h-6 w-6 text-blue-800 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Cookie Policy</h1>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            <strong>Last updated:</strong> June 13, 2025
          </p>

          <div className="space-y-8">
            <section className="mb-8">
              <p className="text-gray-700 mb-4">
                This Cookie Policy explains how SEO Snap ("SEO Snap," "we," "us," or "our") uses cookies and similar technologies when you visit our website, www.seosnap.com, or use any of our online services (collectively, the "Service").
              </p>
              <p className="text-gray-700 mb-4">
                By using our Service, you consent to our use of cookies as outlined in this policy. You may modify your browser or device settings to control cookies, as described below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files placed on your computer or device when you visit a website. They are widely used to ensure websites function properly, improve user experience, and provide information to website operators.
              </p>
              <p className="text-gray-700 mb-4">Cookies may be:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Session Cookies:</strong> Deleted when you close your browser.</li>
                <li><strong>Persistent Cookies:</strong> Remain on your device for a set period or until manually deleted.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Types of Cookies We Use</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Strictly Necessary Cookies</h3>
                <p className="text-gray-700 mb-4">
                  These cookies are essential to operate the core functions of our website and cannot be disabled in our systems. They include:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Authentication tokens for login</li>
                  <li>Session ID tracking</li>
                  <li>CSRF protection tokens</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Performance and Analytics Cookies</h3>
                <p className="text-gray-700 mb-4">
                  These cookies collect data on how users interact with the site, including which pages are visited and any errors encountered. We use these to improve functionality and user experience.
                </p>
                <p className="text-gray-700 mb-4">Examples include:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Google Analytics</li>
                  <li>Internal traffic logs</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Functionality Cookies</h3>
                <p className="text-gray-700 mb-4">
                  These remember your preferences and settings (e.g., language, previous login credentials) to enhance your experience on return visits.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.4 Targeting and Advertising Cookies</h3>
                <p className="text-gray-700 mb-4">
                  While we do not currently serve third-party advertisements, we may use cookies to measure campaign effectiveness or track referral sources. In the future, these may be used for remarketing or behavioral advertising in a privacy-compliant manner.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">
                We may allow certain trusted third parties to place cookies via our website to assist us in analyzing site traffic, managing sessions, or processing payments. These third-party cookies are subject to their own privacy policies and may include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Stripe (for payment sessions)</li>
                <li>PayPal (for subscription billing)</li>
                <li>Google Analytics (for performance monitoring)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How to Control Cookies</h2>
              <p className="text-gray-700 mb-4">
                You can control or disable cookies using your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>View all stored cookies</li>
                <li>Delete cookies individually or all at once</li>
                <li>Block third-party cookies</li>
                <li>Set preferences for specific websites</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Please note that disabling certain cookies may affect the functionality or availability of parts of the Service.
              </p>
              <p className="text-gray-700 mb-4">Here are links to manage settings in common browsers:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:text-blue-700 underline">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:text-blue-700 underline">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:text-blue-700 underline">Apple Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:text-blue-700 underline">Microsoft Edge</a></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Consent and Changes</h2>
              <p className="text-gray-700 mb-4">
                By continuing to use our website, you consent to our use of cookies unless you opt out or configure your browser to reject them. We will post notice of material changes to this Cookie Policy with an updated "Last Updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Do Not Track and Global Privacy Control</h2>
              <p className="text-gray-700 mb-4">
                Some browsers allow users to send a "Do Not Track" (DNT) signal. SEO Snap currently does not respond to DNT signals due to lack of consistent standards. We may, however, recognize and honor Global Privacy Control (GPC) signals when technically supported.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about this Cookie Policy or your privacy rights, you may contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>SEO Snap</strong></p>
                <p className="text-gray-700 mb-2">________________________[Insert Physical Address]</p>
                <p className="text-gray-700">Email: [Insert Privacy or Support Email]</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;