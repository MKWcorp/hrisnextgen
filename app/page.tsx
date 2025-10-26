'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faBuilding, faArrowRight, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function LandingPage() {
  const router = useRouter();
  const [hasBusinessUnit, setHasBusinessUnit] = useState<boolean | null>(null);
  const [hasUser, setHasUser] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkRequirements();
  }, []);

  const checkRequirements = async () => {
    try {
      // Check Business Units
      const buResponse = await fetch('/api/business-units');
      const businessUnits = await buResponse.json();
      setHasBusinessUnit(businessUnits.length > 0);

      // Check Users
      const userResponse = await fetch('/api/users');
      const users = await userResponse.json();
      setHasUser(users.length > 0);
    } catch (error) {
      console.error('Error checking requirements:', error);
    } finally {
      setIsChecking(false);
    }
  };
  const handleGetStarted = () => {
    if (!hasBusinessUnit || !hasUser) {
      router.push('/dashboard/settings');
    } else {
      router.push('/dashboard/goals');
    }
  };

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
      </header>      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Headline */}
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Stop Bingung Target & OKR! 🤯<br />
            <span className="text-blue-600">Ubah Strategi Jadi Aksi Harian</span> dengan AI.
          </h2>
          
          {/* Sub-headline */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 max-w-3xl mx-auto">
            <p className="text-xl text-gray-800 font-medium">
              <strong className="text-blue-600">HRIS Next Gen:</strong> Platform cerdas pertama yang secara otomatis menerjemahkan 
              <strong> goal perusahaan</strong> menjadi <strong>KPI detail</strong> dan 
              <span className="text-indigo-600"> (segera!) checklist harian</span> karyawan Anda.
            </p>
          </div>

          {/* Requirement Warning */}
          {!isChecking && (!hasBusinessUnit || !hasUser) && (
            <div className="mb-6 max-w-2xl mx-auto bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <FontAwesomeIcon icon={faExclamationTriangle} className="w-6 h-6 text-yellow-600 mt-1" />
                <div className="text-left">
                  <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Setup Diperlukan</h3>
                  <p className="text-sm text-yellow-800 mb-3">
                    Sebelum membuat goal, Anda perlu melengkapi data berikut:
                  </p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {!hasBusinessUnit && (
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <strong>Business Unit</strong> - Minimal 1 unit bisnis
                      </li>
                    )}
                    {!hasUser && (
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <strong>User</strong> - Minimal 1 user
                      </li>
                    )}
                  </ul>
                  <p className="text-xs text-yellow-700 mt-3">
                    💡 <strong>Roles</strong> opsional - bisa diisi atau dibiarkan kosong (nanti akan diisi AI)
                  </p>
                </div>
              </div>
            </div>
          )}          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              disabled={isChecking}
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChecking ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Checking...
                </>
              ) : !hasBusinessUnit || !hasUser ? (
                <>
                  <FontAwesomeIcon icon={faBuilding} className="w-5 h-5" />
                  Setup Awal (Settings)
                  <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faRocket} className="w-5 h-5" />
                  Mulai Buat Goal
                  <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              Pelajari Lebih Lanjut
              <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-red-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Merasa Lelah dengan Target yang Mengawang? 😩
            </h3>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-red-200">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Setiap awal tahun, meeting strategi, penetapan OKR... tapi apakah target besar itu 
              benar-benar sampai ke aktivitas harian tim Anda?
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <div className="text-3xl mb-3">🤔</div>
                <h4 className="font-semibold text-gray-900 mb-2">Manajer Pusing</h4>
                <p className="text-sm text-gray-600">Memecah target jadi tugas konkret</p>
              </div>
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <div className="text-3xl mb-3">📊</div>
                <h4 className="font-semibold text-gray-900 mb-2">HR Kesulitan</h4>
                <p className="text-sm text-gray-600">Melacak progress dan alignment</p>
              </div>
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <div className="text-3xl mb-3">😵</div>
                <h4 className="font-semibold text-gray-900 mb-2">Karyawan Bingung</h4>
                <p className="text-sm text-gray-600">Apa prioritas hari ini?</p>
              </div>
            </div>
            
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-800 font-semibold">
                ❌ Hasilnya? <strong>Disconnect</strong>, target tidak tercapai, dan potensi tim terbuang sia-sia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Perkenalkan HRIS Next Gen:<br />
              <span className="text-blue-600">Pilot Otomatis Kinerja Tim Anda!</span> 🚀
            </h3>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Bayangkan sebuah sistem di mana goal perusahaan secara <strong className="text-blue-600">ajaib</strong> terurai 
              menjadi <strong>KPI yang relevan</strong> untuk setiap peran, bahkan mempertimbangkan 
              <strong> aset (akun socmed, website)</strong> yang mereka kelola.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-blue-200 mb-8">
            <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              🤖 Kami menggunakan AI (Google Gemini) untuk melakukan pekerjaan berat:
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-blue-50 p-5 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-1">Menerjemahkan visi strategis</h5>
                  <p className="text-gray-600">menjadi target yang bisa diukur.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-blue-50 p-5 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-1">Merekomendasikan struktur tim dan KPI</h5>
                  <p className="text-gray-600">yang paling efektif.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-blue-50 p-5 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-1">Menghubungkan setiap KPI</h5>
                  <p className="text-gray-600">ke role dan aset yang tepat.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-blue-50 p-5 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-1">Memberi Anda kendali penuh</h5>
                  <p className="text-gray-600">dengan checkpoint persetujuan.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-100 border-2 border-green-400 rounded-xl p-6 text-center">
            <p className="text-xl text-green-800 font-semibold">
              ✅ Ucapkan selamat tinggal pada spreadsheet KPI manual dan kebingungan prioritas! 👋
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Dari Visi ke Aksi Harian dalam <span className="text-indigo-600">3 Langkah Cerdas</span>
            </h3>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-6 bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl border-2 border-purple-200">
              <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg">
                1
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">📝 Definisikan Goal</h4>
                <p className="text-gray-700 text-lg">
                  Manajer cukup masukkan target utama (misal: <strong>Impresi, Penjualan</strong>).
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 bg-gradient-to-r from-blue-50 to-cyan-50 p-8 rounded-2xl border-2 border-blue-200">
              <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg">
                2
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">🧠✅ AI Berpikir & Manajer Review</h4>
                <p className="text-gray-700 text-lg">
                  AI kami merekomendasikan <strong>strategi, tim, target turunan, dan aset relevan</strong>. 
                  Manajer meninjau, mengedit, dan menyetujui.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border-2 border-green-200">
              <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg">
                3
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">🎯 KPI Spesifik Muncul</h4>
                <p className="text-gray-700 text-lg">
                  AI mengolah data final dan menghasilkan <strong>KPI detail</strong> yang siap ditugaskan. 
                  <span className="text-indigo-600 font-semibold"> (Segera: KPI ini otomatis jadi checklist harian!)</span>
                </p>
              </div>
            </div>
          </div>
        </div>      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">✨ Fitur Unggulan</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Teknologi AI yang membuat pekerjaan Anda lebih mudah dan efektif
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-blue-200 hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">🤖</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">AI Goal Cascading</h4>
              <p className="text-gray-700 text-lg">
                Tak perlu lagi pusing memecah OKR/Target. <strong className="text-blue-600">AI melakukannya untuk Anda.</strong>
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-green-200 hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">🎯</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">KPI Cerdas & Kontekstual</h4>
              <p className="text-gray-700 text-lg">
                KPI yang dihasilkan relevan dengan <strong className="text-green-600">peran, aset (dengan prioritasnya!)</strong>, dan target yang disetujui.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-purple-200 hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">✅</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Checkpoint Manajer</h4>
              <p className="text-gray-700 text-lg">
                Anda tetap memegang kendali. <strong className="text-purple-600">Tinjau dan setujui</strong> rekomendasi AI di setiap tahap krusial.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-orange-200 hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">📊</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Keterhubungan Data</h4>
              <p className="text-gray-700 text-lg">
                Lihat dengan jelas bagaimana <strong className="text-orange-600">setiap KPI terhubung</strong> ke tujuan strategis.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-300 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">📅</div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">
              <span className="bg-yellow-300 px-3 py-1 rounded-lg">🚀 SEGERA!</span> Checklist Harian Otomatis
            </h4>
            <p className="text-gray-700 text-xl">
              Karyawan tahu persis <strong className="text-indigo-600">apa yang harus dilakukan setiap hari</strong> untuk mencapai target.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-4">
            Siap Mengubah Strategi Menjadi Hasil Nyata?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Daftarkan perusahaan Anda untuk early access HRIS Next Gen dan jadilah yang pertama merasakan kemudahan manajemen kinerja berbasis AI!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2 shadow-lg"
            >
              <FontAwesomeIcon icon={faRocket} className="w-5 h-5" />
              Minta Akses Awal
              <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-4 bg-transparent text-white text-lg font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center gap-2"
            >
              Pelajari Lebih Lanjut
              <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
            </button>
          </div>
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
