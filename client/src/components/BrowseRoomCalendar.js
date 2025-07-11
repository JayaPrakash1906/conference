import React, { useState } from 'react';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import isToday from 'dayjs/plugin/isToday';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(weekday);
dayjs.extend(isToday);
dayjs.extend(isSameOrAfter);

const BrowseRoomCalendar = ({ selectedDate, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(dayjs());

  const today = dayjs();
  const daysInMonth = currentDate.daysInMonth();
  const startDay = currentDate.startOf('month').day();
  const currentMonth = currentDate.format('MMMM YYYY');

  const getDayBoxes = () => {
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = currentDate.date(day);
      const isPast = date.isBefore(today, 'day');
      const isSelected = selectedDate.isSame(date, 'day');

      days.push(
        <div
          key={day}
          onClick={() => {
            if (!isPast) onDateSelect(date);
          }}
          className={`text-center p-2 rounded-full transition-all text-sm sm:text-base cursor-pointer
            ${isPast ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-blue-100'}
            ${isSelected && !isPast ? 'bg-blue-500 text-white' : ''}
          `}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const handleMonthChange = (direction) => {
    const newDate = currentDate.add(direction, 'month');
    setCurrentDate(newDate);
    
    // If the selected date is not in the new month, update it to the first available date
    if (!selectedDate.isSame(newDate, 'month')) {
      let firstAvailableDate = newDate.startOf('month');
      if (firstAvailableDate.isBefore(today, 'day')) {
        firstAvailableDate = today;
      }
      onDateSelect(firstAvailableDate);
    }
  };

  return (
    <div className="max-w-sm sm:max-w-md mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6 text-xs sm:text-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => handleMonthChange(-1)}
          className="text-lg sm:text-xl font-bold px-2 hover:text-blue-500"
          disabled={currentDate.isSame(today, 'month')}
        >
          &lt;
        </button>
        <h2 className="text-sm sm:text-base font-semibold">{currentMonth}</h2>
        <button
          onClick={() => handleMonthChange(1)}
          className="text-lg sm:text-xl font-bold px-2 hover:text-blue-500"
        >
          &gt;
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 text-center text-gray-600 mb-2 text-xs sm:text-sm">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {getDayBoxes()}
      </div>

      {/* Selected Date Display */}
      <div className="mt-4 text-center text-gray-600 text-xs sm:text-sm">
        Selected: {selectedDate.format('ddd, MMM D, YYYY')}
      </div>
    </div>
  );
};

export default BrowseRoomCalendar;
