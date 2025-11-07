import { useEffect, useState } from 'react';
import { User, Clock, TrendingUp, Loader } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface AttendanceRecord {
  id: string;
  user_id: string;
  checked_in_at: string;
  confidence_score: number;
  users: {
    name: string;
    email: string;
  };
}

export default function Dashboard() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCheckIns: 0,
    uniqueUsers: 0,
    averageConfidence: 0,
  });

  useEffect(() => {
    fetchAttendanceRecords();
    const interval = setInterval(fetchAttendanceRecords, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      const { data, error } = await supabase
        .from('attendance_records')
        .select('id, user_id, checked_in_at, confidence_score, users(name, email)')
        .order('checked_in_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const typedData = data as unknown as AttendanceRecord[];
      setRecords(typedData);

      const uniqueUsers = new Set(typedData.map(r => r.user_id)).size;
      const avgConfidence =
        typedData.length > 0
          ? Math.round(
              typedData.reduce((sum, r) => sum + r.confidence_score, 0) / typedData.length
            )
          : 0;

      setStats({
        totalCheckIns: typedData.length,
        uniqueUsers,
        averageConfidence: avgConfidence,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Real-time attendance tracking and statistics</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Check-Ins</p>
                <p className="text-4xl font-bold text-blue-600">{stats.totalCheckIns}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600/20" />
            </div>
            <p className="text-xs text-gray-600">Last 10 records</p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Unique Users</p>
                <p className="text-4xl font-bold text-green-600">{stats.uniqueUsers}</p>
              </div>
              <User className="w-8 h-8 text-green-600/20" />
            </div>
            <p className="text-xs text-gray-600">Individuals checked in</p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Avg Confidence</p>
                <p className="text-4xl font-bold text-purple-600">{stats.averageConfidence}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600/20" />
            </div>
            <p className="text-xs text-gray-600">Recognition accuracy</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Check-Ins</h3>
          </div>

          {records.length === 0 ? (
            <div className="p-12 text-center">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No attendance records yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Check-In Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">
                          {record.users?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                        {record.users?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                        {formatTime(record.checked_in_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            record.confidence_score >= 80
                              ? 'bg-green-100 text-green-700'
                              : record.confidence_score >= 60
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {Math.round(record.confidence_score)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
