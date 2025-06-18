import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

interface AvailabilityCalendarProps {
  doctorId: number | null;
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export default function AvailabilityCalendar({ 
  doctorId, 
  selectedDate, 
  onDateSelect 
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  const { data: availabilityMap, isLoading } = useQuery({
    queryKey: ['/api/calendar', doctorId, currentYear, currentMonth],
    queryFn: () => doctorId ? api.getCalendarAvailability(doctorId, currentYear, currentMonth) : {},
    enabled: !!doctorId,
  });

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Check if date is available and not in the past
    const today = new Date();
    const clickedDate = new Date(currentYear, currentMonth - 1, day);
    
    if (clickedDate < today) return;
    if (!availabilityMap?.[day.toString()]) return;
    
    onDateSelect(dateStr);
  };

  const isDateSelected = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return selectedDate === dateStr;
  };

  const isDateAvailable = (day: number) => {
    return availabilityMap?.[day.toString()] === true;
  };

  const isDatePast = (day: number) => {
    const today = new Date();
    const checkDate = new Date(currentYear, currentMonth - 1, day);
    return checkDate < today;
  };

  // Generate calendar days
  const calendarDays = [];
  
  // Previous month's trailing days
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
  
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    calendarDays.push(
      <button
        key={`prev-${day}`}
        className="h-10 text-center text-gray-400 hover:bg-gray-100 rounded"
        disabled
      >
        {day}
      </button>
    );
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const isPast = isDatePast(day);
    const isAvailable = isDateAvailable(day);
    const isSelected = isDateSelected(day);
    
    let buttonClass = "h-10 text-center rounded transition-colors ";
    if (isPast) {
      buttonClass += "text-gray-400 cursor-not-allowed";
    } else if (isSelected) {
      buttonClass += "institutional-primary text-white ring-2 ring-[hsl(207,90%,95%)]";
    } else if (isAvailable) {
      buttonClass += "success-bg text-white hover:bg-[hsl(120,61%,45%)]";
    } else {
      buttonClass += "text-gray-400 hover:bg-gray-100";
    }

    calendarDays.push(
      <button
        key={day}
        className={buttonClass}
        onClick={() => handleDateClick(day)}
        disabled={isPast || !isAvailable}
      >
        {day}
      </button>
    );
  }

  // Next month's leading days to fill the grid
  const totalCells = Math.ceil(calendarDays.length / 7) * 7;
  let nextDay = 1;
  while (calendarDays.length < totalCells) {
    calendarDays.push(
      <button
        key={`next-${nextDay}`}
        className="h-10 text-center text-gray-400 hover:bg-gray-100 rounded"
        disabled
      >
        {nextDay}
      </button>
    );
    nextDay++;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
          <CalendarIcon className="w-5 h-5 text-[hsl(207,90%,54%)] mr-2" />
          Disponibilidad
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="calendar">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-lg">
              {monthNames[currentMonth - 1]} {currentYear}
            </h4>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 42 }, (_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))
            ) : (
              calendarDays
            )}
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 success-bg rounded"></div>
            <span className="text-sm text-gray-600">Disponible</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 institutional-primary rounded"></div>
            <span className="text-sm text-gray-600">Seleccionado</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span className="text-sm text-gray-600">No disponible</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
