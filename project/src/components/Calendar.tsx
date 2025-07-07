import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameDay } from 'date-fns';
import ja from 'date-fns/locale/ja';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CalendarProps = {
  selectedDate: Date | null;
  onChange: (date: Date) => void;
  highlightedDates?: Date[];
  minDate?: Date;
};

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onChange,
  highlightedDates = [],
  minDate = new Date()
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
  
  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };
  
  const days = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getDay(days[0]);
  
  const prevMonth = () => {
    setCurrentMonth(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };
  
  const nextMonth = () => {
    setCurrentMonth(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  
  const isDateHighlighted = (date: Date) => {
    return highlightedDates.some(d => isSameDay(d, date));
  };
  
  const isDateSelectable = (date: Date) => {
    return date >= minDate;
  };
  
  return (
    <div className="calendar-container">
      {/* Month selector */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
          aria-label="前の月"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'yyyy年MM月', { locale: ja })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
          aria-label="次の月"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {daysOfWeek.map((day, i) => (
          <div
            key={i}
            className={`text-center py-2 font-medium text-sm ${
              i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            {day}
          </div>
        ))}
        
        {/* Empty cells for days before the first of the month */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10 sm:h-12 p-1" />
        ))}
        
        {/* Calendar days */}
        {days.map((day, i) => {
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const highlighted = isDateHighlighted(day);
          const selectable = isDateSelectable(day);
          const dayClass = `relative h-10 sm:h-12 p-1 ${
            !selectable 
              ? 'text-gray-300 cursor-not-allowed' 
              : highlighted 
                ? 'cursor-pointer hover:bg-blue-100' 
                : 'cursor-pointer hover:bg-gray-100'
          }`;
          
          return (
            <div
              key={i}
              className={dayClass}
              onClick={() => selectable && onChange(day)}
            >
              <div
                className={`h-full w-full flex items-center justify-center rounded-full 
                  ${isSelected ? 'bg-blue-600 text-white font-medium' : ''} 
                  ${isToday(day) && !isSelected ? 'border border-blue-500 text-blue-500' : ''}
                  ${highlighted && !isSelected ? 'bg-blue-100' : ''}
                `}
              >
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;