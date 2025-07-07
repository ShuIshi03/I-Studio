import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useReservation } from '../../contexts/ReservationContext';
import { format, parseISO } from 'date-fns';
import ja from 'date-fns/locale/ja';
import { Calendar, Clock, Download, User, Filter, FileText, Users } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { shifts, reservations, subjects, exportToCSV, loading } = useReservation();
  const [allShifts, setAllShifts] = useState<any[]>([]);
  const [allReservations, setAllReservations] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [viewMode, setViewMode] = useState<'shifts' | 'reservations'>('shifts');

  useEffect(() => {
    setAllShifts(shifts);
    setAllReservations(reservations);
  }, [shifts, reservations]);

  const handleExportShiftsCSV = () => {
    // Create CSV header for shifts
    let csv = 'シフトID,教員ID,日付,開始時間,終了時間,担当科目,予約状況\n';
    
    // Add each shift as a row
    allShifts.forEach(shift => {
      const subjectNames = shift.subjects
        .map((id: string) => subjects.find(s => s.id === id)?.name || id)
        .join('・');
      
      // Check if shift has reservation
      const hasReservation = allReservations.some(
        res => res.shift_id === shift.id && res.status !== 'cancelled'
      );
      
      csv += `${shift.id},${shift.teacher_id},${shift.date},${shift.start_time},${shift.end_time},"${subjectNames}",${hasReservation ? '予約済み' : '空き'}\n`;
    });
    
    // Create a blob from the CSV string
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `shifts-data-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportReservationsCSV = () => {
    const csv = exportToCSV();
    
    // Create a blob from the CSV string
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reservations-data-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return '確認済';
      case 'completed': return '完了';
      case 'cancelled': return 'キャンセル';
      default: return '未確認';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Statistics
  const totalShifts = allShifts.length;
  const totalReservations = allReservations.filter(r => r.status !== 'cancelled').length;
  const occupancyRate = totalShifts > 0 ? Math.round((totalReservations / totalShifts) * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">管理者ダッシュボード</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleExportShiftsCSV}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-1" />
            シフトCSV
          </button>
          <button
            onClick={handleExportReservationsCSV}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-1" />
            予約CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    総シフト数
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalShifts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    総予約数
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalReservations}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    稼働率
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {occupancyRate}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              データ一覧
            </h3>
            
            <div className="mt-3 sm:mt-0 flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  id="view-shifts"
                  name="view-mode"
                  type="radio"
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  checked={viewMode === 'shifts'}
                  onChange={() => setViewMode('shifts')}
                />
                <label htmlFor="view-shifts" className="ml-2 block text-sm font-medium text-gray-700">
                  シフト一覧
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="view-reservations"
                  name="view-mode"
                  type="radio"
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  checked={viewMode === 'reservations'}
                  onChange={() => setViewMode('reservations')}
                />
                <label htmlFor="view-reservations" className="ml-2 block text-sm font-medium text-gray-700">
                  予約一覧
                </label>
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'shifts' ? (
          // Shifts View
          <div>
            {allShifts.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">シフトはありません</h3>
                <p className="mt-1 text-sm text-gray-500">
                  現在、登録されているシフトはありません。
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {allShifts.map((shift) => {
                  const shiftSubjects = shift.subjects
                    .map((id: string) => subjects.find(s => s.id === id))
                    .filter(Boolean);
                  
                  const hasReservation = allReservations.some(
                    res => res.shift_id === shift.id && res.status !== 'cancelled'
                  );

                  return (
                    <li key={shift.id} className="px-4 py-4 sm:px-6">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                hasReservation ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {hasReservation ? '予約済み' : '空き'}
                            </span>
                            <p className="ml-2 text-sm font-medium text-gray-900">
                              教員ID: {shift.teacher_id.substring(0, 8)}...
                            </p>
                          </div>
                          
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <span>
                              {format(parseISO(shift.date), 'yyyy年MM月dd日(EEE)', { locale: ja })}
                            </span>
                          </div>
                          
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <span>
                              {shift.start_time} 〜 {shift.end_time}
                            </span>
                          </div>
                          
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {shiftSubjects.map((subject: any) => subject && (
                                <span
                                  key={subject.id}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {subject.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          // Reservations View
          <div>
            {allReservations.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">予約はありません</h3>
                <p className="mt-1 text-sm text-gray-500">
                  現在、予約はありません。
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {allReservations.map((reservation) => {
                  const subjectName = reservation.subject?.name || '不明';
                  const shift = allShifts.find(s => s.id === reservation.shift_id);
                  
                  return (
                    <li key={reservation.id} className="px-4 py-4 sm:px-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(reservation.status)}`}
                            >
                              {getStatusText(reservation.status)}
                            </span>
                            <p className="ml-2 text-sm font-medium text-gray-900">
                              {subjectName}
                            </p>
                          </div>
                          
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <span>学生: {reservation.student?.name || `ID: ${reservation.student_id.substring(0, 8)}...`} | 教員ID: {shift?.teacher_id.substring(0, 8)}...</span>
                          </div>
                          
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <span>
                              {format(parseISO(reservation.date), 'yyyy年MM月dd日(EEE)', { locale: ja })}
                            </span>
                          </div>
                          
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <span>
                              {reservation.start_time} 〜 {reservation.end_time}
                            </span>
                          </div>
                          
                          {reservation.notes && (
                            <div className="mt-2 text-sm text-gray-500">
                              <p className="line-clamp-2">{reservation.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;