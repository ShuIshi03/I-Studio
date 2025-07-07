import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useReservation } from '../../contexts/ReservationContext';
import Calendar from '../../components/Calendar';
import { format, parseISO } from 'date-fns';
import { Clock, BookOpen } from 'lucide-react';
import { ja } from 'date-fns/locale';

const StudentReservation = () => {
  const { user } = useAuth();
  const { subjects, shifts, addReservation, reservations, getAvailableShiftsForDate, getAvailableShiftsForSubject, loading } = useReservation();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [availableShifts, setAvailableShifts] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<'date' | 'subject'>('date');
  
  // Get available shifts based on search type
  useEffect(() => {
    if (!user) return;
    
    if (searchType === 'date' && selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const shifts = getAvailableShiftsForDate(dateString);
      setAvailableShifts(shifts);
      setSelectedShift(null);
    } else if (searchType === 'subject' && selectedSubjectId) {
      const shifts = getAvailableShiftsForSubject(selectedSubjectId);
      setAvailableShifts(shifts);
      setSelectedShift(null);
    }
  }, [searchType, selectedDate, selectedSubjectId, user, getAvailableShiftsForDate, getAvailableShiftsForSubject]);
  
  const handleReservation = async () => {
    if (!user || !selectedShift || !selectedSubjectId) return;
    
    try {
      const reservationId = await addReservation(
        user.id,
        selectedShift.id,
        selectedSubjectId,
        selectedShift.date,
        selectedShift.start_time,
        selectedShift.end_time,
        notes
      );
      
      if (reservationId) {
        alert('予約が完了しました。');
        navigate('/student');
      } else {
        alert('予約に失敗しました。');
      }
    } catch (error) {
      console.error('Error making reservation:', error);
      alert('予約に失敗しました。');
    }
  };
  
  // Find all dates that have available shifts
  const datesWithShifts = shifts
    .filter(shift => {
      // Check if the shift is already reserved
      const isReserved = reservations.some(
        res => res.shift_id === shift.id && res.status !== 'cancelled'
      );
      
      return !isReserved;
    })
    .map(shift => parseISO(shift.date));
  
  const getShiftTeacherName = (shift: any) => {
    // In a real app, this would get the teacher's name from a user list
    // For this example, we'll just use the teacher ID
    return `教員 ID: ${shift.teacher_id.substring(0, 8)}...`;
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
      <h1 className="text-2xl font-semibold text-gray-900">新規予約</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md p-4 sm:p-6">
        <div className="mb-6">
          <div className="flex flex-wrap -mx-2 overflow-hidden">
            <div className="my-2 px-2 w-full overflow-hidden md:w-1/3">
              <div>
                <label className="text-base font-medium text-gray-900">検索方法</label>
                <p className="text-sm text-gray-500">予約の検索方法を選択してください</p>
              </div>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    id="search-date"
                    name="search-type"
                    type="radio"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    checked={searchType === 'date'}
                    onChange={() => setSearchType('date')}
                  />
                  <label htmlFor="search-date" className="ml-3 block text-sm font-medium text-gray-700">
                    日付から検索
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="search-subject"
                    name="search-type"
                    type="radio"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    checked={searchType === 'subject'}
                    onChange={() => setSearchType('subject')}
                  />
                  <label htmlFor="search-subject" className="ml-3 block text-sm font-medium text-gray-700">
                    科目から検索
                  </label>
                </div>
              </div>
            </div>
            
            {searchType === 'date' ? (
              <div className="my-2 px-2 w-full overflow-hidden md:w-2/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">日付を選択</label>
                <Calendar
                  selectedDate={selectedDate}
                  onChange={setSelectedDate}
                  highlightedDates={datesWithShifts}
                  minDate={new Date()}
                />
              </div>
            ) : (
              <div className="my-2 px-2 w-full overflow-hidden md:w-2/3">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  科目を選択
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                >
                  <option value="">選択してください</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        
        {(selectedDate || selectedSubjectId) && (
          <div className="mt-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              利用可能なシフト
            </h3>
            
            {availableShifts.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-sm text-gray-700">
                  選択した条件に合うシフトはありません。
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableShifts.map((shift) => {
                  // Get available subjects for this shift
                  const shiftSubjects = shift.subjects
                    .map((id: string) => subjects.find(s => s.id === id))
                    .filter(Boolean);
                  
                  return (
                    <div
                      key={shift.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedShift?.id === shift.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                      onClick={() => {
                        setSelectedShift(shift);
                        // If we're in date search mode, set the subject to the first available subject
                        if (searchType === 'date' && shiftSubjects.length > 0) {
                          setSelectedSubjectId(shiftSubjects[0].id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{getShiftTeacherName(shift)}</h4>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>{format(parseISO(shift.date), 'yyyy年MM月dd日 (EEE)', { locale: ja })}</span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>{shift.start_time} 〜 {shift.end_time}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex flex-wrap gap-1">
                            {shiftSubjects.map((subject: any) => (
                              <span
                                key={subject.id}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  searchType === 'subject' && selectedSubjectId === subject.id
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <BookOpen className="h-3 w-3 mr-1" />
                                {subject.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {selectedShift && (
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700">
                科目を選択
              </label>
              <select
                id="subject-select"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                disabled={searchType === 'subject'}
              >
                <option value="">科目を選択してください</option>
                {selectedShift.subjects.map((subjectId: string) => {
                  const subject = subjects.find(s => s.id === subjectId);
                  return subject ? (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ) : null;
                })}
              </select>
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                備考（任意）
              </label>
              <textarea
                id="notes"
                rows={3}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                placeholder="質問内容や希望事項があればご記入ください"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
            
            <div className="pt-4">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleReservation}
                disabled={!selectedShift || !selectedSubjectId}
              >
                予約を確定する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentReservation;