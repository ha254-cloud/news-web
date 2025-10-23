import Head from 'next/head';
import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>About Us - Trending News</title>
        <meta name="description" content="Learn about Trending News - your trusted source for African news and insights" />
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
              <Link href="/about" className="text-gray-900 font-medium">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About Trending News</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Trending News is dedicated to bringing you the latest news and insights from across the African continent. 
              We focus on delivering timely, accurate, and relevant information about African politics, business, technology, 
              sports, and culture to a global audience.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">What We Do</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Curate and analyze news from major African countries including Kenya, Nigeria, South Africa, and Egypt</li>
              <li>Provide original commentary and analysis on African affairs</li>
              <li>Focus on regional insights that matter to African communities and international audiences</li>
              <li>Cover emerging trends in African technology, business, and politics</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Coverage</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Regional Focus</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>East Africa (Kenya, Tanzania, Uganda)</li>
                  <li>West Africa (Nigeria, Ghana, Senegal)</li>
                  <li>Southern Africa (South Africa, Zimbabwe)</li>
                  <li>North Africa (Egypt, Morocco, Tunisia)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Topics</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>Politics & Governance</li>
                  <li>Business & Economy</li>
                  <li>Technology & Innovation</li>
                  <li>Sports & Entertainment</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Editorial Standards</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We are committed to journalistic integrity and accuracy. Our team reviews and analyzes news from 
              multiple sources to provide balanced perspectives on African affairs. We add original commentary 
              and analysis to help readers understand the broader implications of news events.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-2">
                <strong>Email:</strong> editor@trendingnews.com
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Editorial Team:</strong> news@trendingnews.com
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Partnership Inquiries:</strong> partnerships@trendingnews.com
              </p>
              <p className="text-gray-600">
                <strong>Technical Support:</strong> support@trendingnews.com
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
