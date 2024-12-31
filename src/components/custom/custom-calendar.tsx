import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";

interface StreakData {
  current: number;
  consistency: string;
  longest: number;
  dates?: Date[];
}

interface CustomCalendarProps {
  streakData: StreakData;
}

const CustomCalendar = ({ streakData }: CustomCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const generateCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="text-center py-2.5 text-sm text-gray-300">
          {getDaysInMonth(new Date(currentYear, currentMonth - 1)) - firstDay + i + 1}
        </div>
      );
    }

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDayDate = new Date(currentYear, currentMonth, day);
      const isPracticedDay = streakData.dates?.some(date => 
        new Date(date).toDateString() === currentDayDate.toDateString()
      );
      const isToday = new Date().toDateString() === currentDayDate.toDateString();

      days.push(
        <div
          key={day}
          className={cn(
            "text-center py-2.5 text-sm rounded-[16px] font-medium",
            isPracticedDay ? "bg-[#f8b922] text-white" : "",
            isToday ? "border-2 border-[#5b06be] text-[#5b06be]" : "",
            !isPracticedDay && !isToday ? "hover:bg-gray-50" : ""
          )}
        >
          {day}
        </div>
      );
    }

    // Add empty cells for the remaining days
    const remainingDays = 42 - (days.length); // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push(
        <div key={`next-${i}`} className="text-center py-2.5 text-sm text-gray-300">
          {i}
        </div>
      );
    }

    return days;
  };

  return (
    <Card className="p-3 bg-white rounded-[20px] shadow-lg flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <img 
          src="https://res.cloudinary.com/drkudvyog/image/upload/v1733943686/Calendar_Streak_icon_duha_kwl5pf.png"
          alt="Calendar & Streak Icon"
          className="h-6 w-6"
        />
        <h2 className="text-2xl font-semibold text-[#000000]">Calendar & Streak</h2>
      </div>
      <div className="flex gap-3 mb-6">
        <div className="bg-[#5b06be] text-white px-3 py-2 rounded-[20px] flex-1">
          <div className="text-xs font-medium text-center">Current</div>
          <div className="text-2xl font-bold text-center">{streakData.current}</div>
        </div>
        <div className="bg-[#f8b922] text-white px-3 py-2 rounded-[20px] flex-1">
          <div className="text-xs font-medium text-center">Consistency</div>
          <div className="text-2xl font-bold text-center">{streakData.consistency}</div>
        </div>
        <div className="bg-[#ce00cb] text-white px-3 py-2 rounded-[20px] flex-1">
          <div className="text-xs font-medium text-center">Longest</div>
          <div className="text-2xl font-bold text-center">{streakData.longest}</div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-transparent"
          onClick={handlePrevMonth}
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </Button>
        <div className="text-base font-semibold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-transparent"
          onClick={handleNextMonth}
        >
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2 flex-1">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm text-gray-400 font-medium mb-2">
            {day}
          </div>
        ))}
        {generateCalendarDays()}
      </div>
    </Card>
  );
};

export default CustomCalendar;