import Head from 'next/head';
import Link from 'next/link';

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Disclaimer - Trending News</title>
        <meta name="description" content="Disclaimer for Trending News website" />
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
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Disclaimer</h1>
          <p className="text-gray-600 mb-8">Last updated: October 19, 2025</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. General Information</h2>
              <p className="text-gray-600 mb-4">
                The information on Trending News is provided for general informational purposes only. All information 
                on the site is provided in good faith, however we make no representation or warranty of any kind, 
                express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or 
                completeness of any information on the site.
              </p>
              <p className="text-gray-600">
                Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred 
                as a result of the use of the site or reliance on any information provided on the site. Your use of 
                the site and your reliance on any information on the site is solely at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. News Content and Sources</h2>
              <p className="text-gray-600 mb-4">
                Trending News aggregates news content from various sources across Africa and internationally. 
                We strive to provide accurate and up-to-date information, but we cannot guarantee:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>The accuracy or completeness of news articles</li>
                <li>The timeliness of information presented</li>
                <li>The reliability of third-party sources</li>
                <li>The absence of errors in translation or interpretation</li>
              </ul>
              <p className="text-gray-600">
                All news articles are attributed to their original sources, and readers are encouraged to verify 
                information through multiple sources before making any decisions based on the content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Editorial Content</h2>
              <p className="text-gray-600 mb-4">
                Our editorial team provides analysis, commentary, and rewritten versions of news articles. 
                These interpretations represent our understanding of events and should not be considered as:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Professional advice (legal, financial, medical, etc.)</li>
                <li>Official statements from governments or organizations</li>
                <li>Endorsements of any political party or candidate</li>
                <li>Investment or business recommendations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. External Links</h2>
              <p className="text-gray-600 mb-4">
                Our website contains links to external websites and resources. These links are provided for 
                convenience and informational purposes only. We have no control over the content, availability, 
                or privacy practices of these external sites.
              </p>
              <p className="text-gray-600">
                The inclusion of any links does not necessarily imply a recommendation or endorse the views 
                expressed within them. We are not responsible for the content of external websites or any 
                damages that may arise from your use of them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Advertising and Sponsored Content</h2>
              <p className="text-gray-600 mb-4">
                Trending News may display advertisements through third-party advertising networks such as Google AdSense. 
                We are not responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>The content of advertisements displayed on our site</li>
                <li>The quality or legitimacy of advertised products or services</li>
                <li>Any transactions between you and advertisers</li>
                <li>The privacy practices of advertising networks</li>
              </ul>
              <p className="text-gray-600">
                Any sponsored content or partnerships will be clearly labeled as such. The presence of advertising 
                does not constitute an endorsement of the advertised products or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Copyright and Fair Use</h2>
              <p className="text-gray-600 mb-4">
                Trending News respects intellectual property rights. We use content from third-party sources under 
                fair use principles for news reporting, commentary, and educational purposes. All content is properly 
                attributed to its original source.
              </p>
              <p className="text-gray-600">
                If you believe your copyright has been infringed, please contact us immediately at 
                legal@trendingnews.com with details of the alleged infringement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. User-Generated Content</h2>
              <p className="text-gray-600">
                While we currently do not accept user comments or submissions, any future user-generated content 
                would be subject to moderation. We reserve the right to remove any content that violates our 
                terms of service or community guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Technical Disclaimers</h2>
              <p className="text-gray-600 mb-4">
                We strive to keep our website running smoothly and up-to-date, but we cannot guarantee:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Continuous availability of the website</li>
                <li>Freedom from technical errors or interruptions</li>
                <li>Compatibility with all devices and browsers</li>
                <li>Protection from malware or security threats</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Geographic Limitations</h2>
              <p className="text-gray-600">
                While Trending News focuses on African news and affairs, our content is accessible globally. 
                However, some content may not be relevant or applicable to users outside of Africa, and local 
                laws and regulations may vary by jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Changes to This Disclaimer</h2>
              <p className="text-gray-600">
                We reserve the right to update or modify this disclaimer at any time without prior notice. 
                Changes will be effective immediately upon posting on this page. Your continued use of the 
                website constitutes acceptance of any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Contact Information</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about this disclaimer, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">Email: legal@trendingnews.com</p>
                <p className="text-gray-600">Contact Form: <Link href="/contact" className="text-blue-600 hover:underline">Contact Page</Link></p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}