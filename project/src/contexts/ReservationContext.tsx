import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  supabase,
  getSubjects,
  createSubject,
  getShifts,
  createShift,
  deleteShift as deleteShiftFromDB,
  getReservations,
  createReservation,
  updateReservation as updateReservationInDB,
  type Subject,
  type Shift,
  type Reservation
} from '../lib/supabase';

type ReservationContextType = {
  subjects: Subject[];
  shifts: Shift[];
  reservations: any[];
  loading: boolean;
  addSubject: (name: string) => Promise<void>;
  addShift: (teacherId: string, date: string, startTime: string, endTime: string, subjects: string[]) => Promise<void>;
  updateShift: (shiftId: string, updatedShift: Partial<Shift>) => Promise<void>;
  deleteShift: (shiftId: string) => Promise<void>;
  addReservation: (studentId: string, shiftId: string, subjectId: string, date: string, startTime: string, endTime: string, notes: string) => Promise<string | null>;
  updateReservation: (reservationId: string, updatedReservation: Partial<Reservation>) => Promise<void>;
  cancelReservation: (reservationId: string) => Promise<void>;
  getTeacherShifts: (teacherId: string) => Shift[];
  getStudentReservations: (studentId: string) => any[];
  getAvailableShiftsForSubject: (subjectId: string, date?: string) => Shift[];
  getAvailableShiftsForDate: (date: string) => Shift[];
  exportToCSV: () => string;
  refreshData: () => Promise<void>;
};

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export const ReservationProvider = ({ children }: { children: ReactNode }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load data from Supabase
  const refreshData = async () => {
    try {
      setLoading(true);
      const [subjectsData, shiftsData, reservationsData] = await Promise.all([
        getSubjects(),
        getShifts(),
        getReservations()
      ]);
      
      setSubjects(subjectsData);
      setShifts(shiftsData);
      setReservations(reservationsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);
  
  const addSubject = async (name: string) => {
    try {
      const newSubject = await createSubject(name);
      setSubjects(prev => [...prev, newSubject]);
    } catch (error) {
      console.error('Error adding subject:', error);
      throw error;
    }
  };
  
  const addShift = async (teacherId: string, date: string, startTime: string, endTime: string, subjectIds: string[]) => {
    try {
      const newShift = await createShift({
        teacher_id: teacherId,
        date,
        start_time: startTime,
        end_time: endTime,
        subjects: subjectIds
      });
      setShifts(prev => [...prev, newShift]);
    } catch (error) {
      console.error('Error adding shift:', error);
      throw error;
    }
  };
  
  const updateShift = async (shiftId: string, updatedShift: Partial<Shift>) => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .update(updatedShift)
        .eq('id', shiftId)
        .select()
        .single();
      
      if (error) throw error;
      
      setShifts(prev => prev.map(shift => 
        shift.id === shiftId ? { ...shift, ...data } : shift
      ));
    } catch (error) {
      console.error('Error updating shift:', error);
      throw error;
    }
  };
  
  const deleteShift = async (shiftId: string) => {
    try {
      // Check if there are any reservations for this shift
      const hasReservations = reservations.some(res => res.shift_id === shiftId && res.status !== 'cancelled');
      if (hasReservations) {
        throw new Error('このシフトには予約があるため削除できません。');
      }
      
      await deleteShiftFromDB(shiftId);
      setShifts(prev => prev.filter(shift => shift.id !== shiftId));
    } catch (error) {
      console.error('Error deleting shift:', error);
      throw error;
    }
  };
  
  const addReservation = async (
    studentId: string, 
    shiftId: string, 
    subjectId: string,
    date: string,
    startTime: string,
    endTime: string,
    notes: string
  ): Promise<string | null> => {
    try {
      // Check if shift exists
      const shift = shifts.find(s => s.id === shiftId);
      if (!shift) return null;
      
      // Check if shift teaches this subject
      if (!shift.subjects.includes(subjectId)) return null;
      
      // Check if there's already a reservation for this shift
      const existingReservation = reservations.find(
        r => r.shift_id === shiftId && r.status !== 'cancelled'
      );
      if (existingReservation) return null;
      
      const newReservation = await createReservation({
        student_id: studentId,
        shift_id: shiftId,
        subject_id: subjectId,
        date,
        start_time: startTime,
        end_time: endTime,
        notes,
        status: 'confirmed'
      });
      
      // Refresh reservations to get the full data with joins
      await refreshData();
      
      return newReservation.id;
    } catch (error) {
      console.error('Error adding reservation:', error);
      return null;
    }
  };
  
  const updateReservation = async (reservationId: string, updatedReservation: Partial<Reservation>) => {
    try {
      await updateReservationInDB(reservationId, updatedReservation);
      await refreshData(); // Refresh to get updated data
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  };
  
  const cancelReservation = async (reservationId: string) => {
    await updateReservation(reservationId, { status: 'cancelled' });
  };
  
  const getTeacherShifts = (teacherId: string) => {
    return shifts.filter(shift => shift.teacher_id === teacherId);
  };
  
  const getStudentReservations = (studentId: string) => {
    return reservations.filter(reservation => reservation.student_id === studentId);
  };
  
  const getAvailableShiftsForSubject = (subjectId: string, date?: string) => {
    // Filter shifts that teach this subject
    let availableShifts = shifts.filter(shift => shift.subjects.includes(subjectId));
    
    // If date is provided, further filter by date
    if (date) {
      availableShifts = availableShifts.filter(shift => shift.date === date);
    }
    
    // Filter out shifts that are already reserved
    return availableShifts.filter(shift => {
      return !reservations.some(
        res => res.shift_id === shift.id && res.status !== 'cancelled'
      );
    });
  };
  
  const getAvailableShiftsForDate = (date: string) => {
    // Filter shifts by date
    let availableShifts = shifts.filter(shift => shift.date === date);
    
    // Filter out shifts that are already reserved
    return availableShifts.filter(shift => {
      return !reservations.some(
        res => res.shift_id === shift.id && res.status !== 'cancelled'
      );
    });
  };
  
  const exportToCSV = () => {
    // Create CSV header
    let csv = 'ID,学生ID,予約日,開始時間,終了時間,科目,ステータス,備考,作成日時\n';
    
    // Add each reservation as a row
    reservations.forEach(res => {
      const subjectName = res.subject?.name || res.subject_id;
      
      csv += `${res.id},${res.student_id},${res.date},${res.start_time},${res.end_time},"${subjectName}",${res.status},"${res.notes.replace(/"/g, '""')}",${res.created_at}\n`;
    });
    
    return csv;
  };
  
  return (
    <ReservationContext.Provider value={{
      subjects,
      shifts,
      reservations,
      loading,
      addSubject,
      addShift,
      updateShift,
      deleteShift,
      addReservation,
      updateReservation,
      cancelReservation,
      getTeacherShifts,
      getStudentReservations,
      getAvailableShiftsForSubject,
      getAvailableShiftsForDate,
      exportToCSV,
      refreshData
    }}>
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
};

// Re-export types for backward compatibility
export type { Subject, Shift, Reservation };