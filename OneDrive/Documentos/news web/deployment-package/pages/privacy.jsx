import Head from 'next/head';
import Link from 'next/link';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Privacy Policy - Trending News</title>
        <meta name="description" content="Privacy Policy for Trending News - Learn how we protect your privacy and handle your data" />
      </Head>

      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="brand-logo-container">
              <img src="/logo.jpg" alt="Trending News" className="brand-logo-img" />
              <span className="brand-text">Trending News</span>
            </Link>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Effective Date: December 2024</p>
          <p className="text-gray-600 mb-8">Last updated: October 17, 2025</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
              <p className="text-gray-600 mb-4">
                Trending News collects information to provide better services to our users. We collect information in the following ways:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Information you give us:</strong> When you contact us, we may collect your name, email address, and message content.</li>
                <li><strong>Information we get from your use of our services:</strong> We collect information about how you use our website, such as pages viewed and time spent on site.</li>
                <li><strong>Cookies and similar technologies:</strong> We use cookies to improve your browsing experience and analyze site traffic.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Information</h2>
              <p className="text-gray-600 mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process and respond to your inquiries</li>
                <li>Send you relevant news updates (with your consent)</li>
                <li>Analyze site usage to improve user experience</li>
                <li>Protect against fraud and abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Information Sharing</h2>
              <p className="text-gray-600 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to outside parties except in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With trusted service providers who assist us in operating our website</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Cookies and Tracking</h2>
              <p className="text-gray-600 mb-4">
                Our website uses cookies to enhance your experience. Cookies are small files stored on your device that help us:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Remember your preferences</li>
                <li>Understand how you use our website</li>
                <li>Improve our services</li>
                <li>Provide relevant advertisements (through Google AdSense)</li>
              </ul>
              <p className="text-gray-600 mt-4">
                You can control cookies through your browser settings. However, disabling cookies may affect the functionality of our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Third-Party Services</h2>
              <p className="text-gray-600 mb-4">Our website may include third-party services such as:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Google AdSense:</strong> For displaying advertisements</li>
                <li><strong>News APIs:</strong> For fetching news content</li>
                <li><strong>Analytics services:</strong> For understanding site usage</li>
              </ul>
              <p className="text-gray-600 mt-4">
                These services have their own privacy policies, which we encourage you to review.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Data Security</h2>
              <p className="text-gray-600">
                We implement appropriate security measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Your Rights</h2>
              <p className="text-gray-600 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Disable cookies through your browser</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-600">
                Our website is not directed to children under 13. We do not knowingly collect personal information from children under 13. 
                If you believe we have collected such information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-600">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new 
                privacy policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about this privacy policy, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">Email: privacy@trendingnews.com</p>
                <p className="text-gray-600">Contact Form: <Link href="/contact" className="text-blue-600 hover:underline">Contact Page</Link></p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}