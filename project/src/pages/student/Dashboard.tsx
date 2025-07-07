import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useReservation } from '../../contexts/ReservationContext';
import { format, parseISO } from 'date-fns';
import ja from 'date-fns/locale/ja';
import { Calendar, Clock, FileText } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { reservations, subjects, cancelReservation, loading } = useReservation();
  const [studentReservations, setStudentReservations] = useState<any[]>([]);
  
  useEffect(() => {
    if (user) {
      // Filter reservations for this student
      const filtered = reservations.filter(res => res.student_id === user.id);
      setStudentReservations(filtered);
    }
  }, [user, reservations]);
  
  const handleCancel = async (id: string) => {
    if (window.confirm('この予約をキャンセルしますか？')) {
      try {
        await cancelReservation(id);
      } catch (error) {
        console.error('Error cancelling reservation:', error);
        alert('キャンセルに失敗しました。');
      }
    }
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
      </div>
      
      {studentReservations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">予約はありません</h3>
          <p className="mt-1 text-sm text-gray-500">
            新しい予約を作成するには「新規予約」をクリックしてください。
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {studentReservations.map((reservation) => {
              const subjectName = reservation.subject?.name || '不明';
              
              return (
                <li key={reservation.id} className="px-6 py-4">
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
                    
                    <div className="mt-4 md:mt-0 flex-shrink-0">
                      {reservation.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancel(reservation.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          キャンセル
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;