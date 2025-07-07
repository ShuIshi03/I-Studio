import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useReservation } from '../../contexts/ReservationContext';
import { format, parseISO, isFuture } from 'date-fns';
import ja from 'date-fns/locale/ja';
import { Calendar, Clock, Download, User, Filter } from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { reservations, shifts, subjects, updateReservation, exportToCSV, loading } = useReservation();
  const [teacherReservations, setTeacherReservations] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  
  useEffect(() => {
    if (!user) return;
    
    // Get all shifts for this teacher
    const teacherShifts = shifts.filter(shift => shift.teacher_id === user.id);
    const teacherShiftIds = teacherShifts.map(shift => shift.id);
    
    // Get all reservations for this teacher's shifts
    const filtered = reservations.filter(res => teacherShiftIds.includes(res.shift_id));
    
    // Apply filter
    let filteredReservations = filtered;
    if (filter === 'upcoming') {
      filteredReservations = filtered.filter(res => isFuture(parseISO(res.date)));
    } else if (filter === 'past') {
      filteredReservations = filtered.filter(res => !isFuture(parseISO(res.date)));
    }
    
    setTeacherReservations(filteredReservations);
  }, [user, reservations, shifts, filter]);
  
  const handleStatusChange = async (id: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      await updateReservation(id, { status });
    } catch (error) {
      console.error('Error updating reservation status:', error);
      alert('ステータスの更新に失敗しました。');
    }
  };
  
  const handleExportCSV = () => {
    const csv = exportToCSV();
    
    // Create a blob from the CSV string
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `i-studio-reservations-${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
        <h1 className="text-2xl font-semibold text-gray-900">予約一覧</h1>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="h-4 w-4 mr-1" />
          CSVエクスポート
        </button>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              予約リスト
            </h3>
            
            <div className="mt-3 sm:mt-0 flex items-center">
              <Filter className="mr-2 h-4 w-4 text-gray-500" />
              <label htmlFor="filter" className="sr-only">フィルター</label>
              <select
                id="filter"
                name="filter"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'upcoming' | 'past')}
              >
                <option value="all">すべての予約</option>
                <option value="upcoming">今後の予約</option>
                <option value="past">過去の予約</option>
              </select>
            </div>
          </div>
        </div>
        
        {teacherReservations.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">予約はありません</h3>
            <p className="mt-1 text-sm text-gray-500">
              現在、表示する予約はありません。
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {teacherReservations.map((reservation) => {
              const subjectName = reservation.subject?.name || '不明';
              
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
                        <span>学生: {reservation.student?.name || `ID: ${reservation.student_id.substring(0, 8)}...`}</span>
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
                    
                    {reservation.status !== 'cancelled' && (
                      <div className="mt-4 md:mt-0 flex-shrink-0 flex space-x-2">
                        {reservation.status !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(reservation.id, 'completed')}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            完了
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          キャンセル
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;