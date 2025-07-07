import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useReservation } from '../../contexts/ReservationContext';
import Calendar from '../../components/Calendar';
import { format, parseISO } from 'date-fns';
import { Clock, Trash2, PlusCircle, Plus } from 'lucide-react';
import { ja } from 'date-fns/locale';

const TeacherShift = () => {
  const { user } = useAuth();
  const { subjects, shifts, addShift, deleteShift, addSubject, loading } = useReservation();
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [teacherShifts, setTeacherShifts] = useState<any[]>([]);
  
  // New shift form state
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  // New subject form state
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  
  useEffect(() => {
    if (user) {
      const filtered = shifts.filter(shift => shift.teacher_id === user.id);
      setTeacherShifts(filtered);
    }
  }, [user, shifts]);
  
  const handleAddShift = async () => {
    if (!user || !selectedDate || !startTime || !endTime || selectedSubjects.length === 0) {
      alert('すべての項目を入力してください。');
      return;
    }
    
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    
    // Check for overlapping shifts
    const overlapping = teacherShifts.some(shift => {
      if (shift.date !== dateString) return false;
      
      const existingStart = shift.start_time;
      const existingEnd = shift.end_time;
      
      // Check if new shift overlaps with existing shift
      return (startTime < existingEnd && endTime > existingStart);
    });
    
    if (overlapping) {
      alert('選択した時間帯に既存のシフトと重複があります。');
      return;
    }
    
    try {
      await addShift(user.id, dateString, startTime, endTime, selectedSubjects);
      alert('シフトを追加しました。');
      
      // Reset form
      setStartTime('09:00');
      setEndTime('10:30');
      setSelectedSubjects([]);
    } catch (error) {
      console.error('Error adding shift:', error);
      alert('シフトの追加に失敗しました。');
    }
  };
  
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) {
      alert('科目名を入力してください。');
      return;
    }
    
    try {
      await addSubject(newSubjectName.trim());
      setNewSubjectName('');
      setShowSubjectForm(false);
    } catch (error) {
      console.error('Error adding subject:', error);
      alert('科目の追加に失敗しました。');
    }
  };
  
  const handleDelete = async (shiftId: string) => {
    if (window.confirm('このシフトを削除しますか？')) {
      try {
        await deleteShift(shiftId);
      } catch (error: any) {
        console.error('Error deleting shift:', error);
        alert(error.message || 'シフトの削除に失敗しました。');
      }
    }
  };
  
  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };
  
  // Find all dates that have shifts for this teacher
  const shiftDates = teacherShifts.map(shift => parseISO(shift.date));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">シフト管理</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            新規シフト登録
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            シフト時間と担当科目を登録してください
          </p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">日付を選択</label>
              <Calendar
                selectedDate={selectedDate}
                onChange={setSelectedDate}
                highlightedDates={shiftDates}
                minDate={new Date()}
              />
            </div>
            
            <div className="sm:col-span-3 space-y-6">
              <div>
                <label htmlFor="start-time" className="block text-sm font-medium text-gray-700">
                  開始時間
                </label>
                <select
                  id="start-time"
                  name="start-time"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                >
                  {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'].map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="end-time" className="block text-sm font-medium text-gray-700">
                  終了時間
                </label>
                <select
                  id="end-time"
                  name="end-time"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                >
                  {['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'].map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    担当科目
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSubjectForm(true)}
                    className="inline-flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    新規科目を追加
                  </button>
                </div>
                
                {showSubjectForm && (
                  <form onSubmit={handleAddSubject} className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        placeholder="新しい科目名"
                        className="flex-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        追加
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSubjectForm(false)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        キャンセル
                      </button>
                    </div>
                  </form>
                )}
                
                <div className="space-y-2">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={`subject-${subject.id}`}
                          name={`subject-${subject.id}`}
                          type="checkbox"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          checked={selectedSubjects.includes(subject.id)}
                          onChange={() => handleSubjectToggle(subject.id)}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={`subject-${subject.id}`} className="font-medium text-gray-700">
                          {subject.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={handleAddShift}
                  disabled={!selectedDate || selectedSubjects.length === 0 || !startTime || !endTime}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  シフトを追加
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            登録済みシフト一覧
          </h3>
        </div>
        
        {teacherShifts.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">シフトはありません</h3>
            <p className="mt-1 text-sm text-gray-500">
              上記のフォームからシフトを追加してください。
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {teacherShifts.map((shift) => {
              const shiftSubjects = shift.subjects
                .map((id: string) => subjects.find(s => s.id === id))
                .filter(Boolean);
                
              return (
                <li key={shift.id} className="px-4 py-4 sm:px-6">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <span>
                          {format(parseISO(shift.date), 'yyyy年MM月dd日 (EEE)', { locale: ja })}
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
                    
                    <div>
                      <button
                        type="button"
                        onClick={() => handleDelete(shift.id)}
                        className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                        <span className="sr-only">削除</span>
                      </button>
                    </div>
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

export default TeacherShift;