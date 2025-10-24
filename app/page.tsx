'use client';

import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faChartLine, faBullseye, faCheckSquare, faBuilding, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: faChartLine,
      title: 'Strategic Goals',
      description: 'Buat dan kelola strategic goals perusahaan dengan AI-powered breakdown',
      path: '/dashboard/goals/create',
      color: 'text-blue-600'
    },
    {
      icon: faBullseye,
      title: 'KPI Management',
      description: 'Review, approve, dan assign KPI yang diusulkan AI ke karyawan',
      path: '/dashboard',
      color: 'text-green-600'
    },
    {
      icon: faCheckSquare,
      title: 'Daily Tasks',
      description: 'Pantau dan kelola daily tasks karyawan untuk mencapai KPI',
      path: '/dashboard',
      color: 'text-purple-600'
    },
    {
      icon: faBuilding,
      title: 'Business Units',
      description: 'Kelola unit bisnis dan struktur organisasi',
      path: '/dashboard',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">HRIS Next Gen</h1>
              <p className="text-gray-600">Performance Management System</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              System Active
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Transformasi <span className="text-blue-600">Performance Management</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Sistem HRIS canggih dengan AI-powered goal setting, KPI management otomatis,
            dan tracking daily tasks untuk meningkatkan produktivitas tim Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard/goals/create')}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <FontAwesomeIcon icon={faRocket} className="w-5 h-5" />
              Mulai Buat Goal
              <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faChartLine} className="w-5 h-5" />
              Dashboard Lengkap
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Fitur Utama</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Platform lengkap untuk mengelola performance management dari goal setting hingga daily task tracking
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={() => router.push(feature.path)}
                className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-gray-300"
              >
                <div className={`w-12 h-12 ${feature.color} mb-4`}>
                  <FontAwesomeIcon icon={feature.icon} className="w-full h-full" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                <div className="flex items-center text-sm font-medium text-blue-600">
                  Akses sekarang
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Siap Tingkatkan Performance Tim Anda?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Mulai dengan membuat strategic goal pertama Anda dan biarkan AI membantu breakdown menjadi KPI yang actionable.
          </p>
          <button
            onClick={() => router.push('/dashboard/goals/create')}
            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2 shadow-lg"
          >
            <FontAwesomeIcon icon={faRocket} className="w-5 h-5" />
            Buat Goal Pertama Anda
            <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">HRIS Next Gen</h4>
              <p className="text-gray-400 text-sm">
                Platform performance management modern dengan dukungan AI untuk membantu tim Anda mencapai target.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button
                    onClick={() => router.push('/dashboard/goals/create')}
                    className="hover:text-white transition-colors"
                  >
                    Buat Goal Baru
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="hover:text-white transition-colors"
                  >
                    Dashboard
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Tech Stack</h4>
              <p className="text-gray-400 text-sm">
                Built with Next.js, Prisma, PostgreSQL & AI
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 HRIS Next Gen. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
