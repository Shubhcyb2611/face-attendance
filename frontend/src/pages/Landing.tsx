import { Camera, Shield, Clock } from 'lucide-react';

interface LandingProps {
  onNavigate: () => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8 inline-block p-4 bg-blue-100 rounded-full">
          <Camera className="w-12 h-12 text-blue-600" />
        </div>

        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          Face Attendance
        </h2>

        <p className="text-xl text-gray-600 mb-8">
          Fast, secure, and accurate attendance tracking using facial recognition technology.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Secure</h3>
            <p className="text-sm text-gray-600">
              Advanced face recognition with high accuracy
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Instant</h3>
            <p className="text-sm text-gray-600">
              Real-time verification in seconds
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <Camera className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Easy</h3>
            <p className="text-sm text-gray-600">
              Just show your face to the camera
            </p>
          </div>
        </div>

        <button
          onClick={onNavigate}
          className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
        >
          Open Camera & Check In
        </button>
      </div>
    </div>
  );
}
