import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calculateDailyHours } from "../utils/timeHelpers";

interface CalendarViewProps {
  logs: any[];
  onDayClick: (dateStr: string, log: any) => void;
}

export default function CalendarView({ logs, onDayClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "yyyy-MM-dd";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{format(currentDate, "MMMM yyyy")}</h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-medium hover:bg-gray-100 rounded-lg">Today</button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-medium text-gray-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dateStr = format(day, dateFormat);
          const dailyLog = logs.find(log => log.date === dateStr);
          const hours = dailyLog ? calculateDailyHours(dailyLog.timeIn, dailyLog.timeOut) : 0;
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div
              key={day.toString()}
              onClick={() => onDayClick(dateStr, dailyLog)}
              className={`
                min-h-[80px] p-2 rounded-lg border cursor-pointer transition-all hover:border-blue-400 hover:shadow-sm flex flex-col justify-between
                ${!isCurrentMonth ? "bg-gray-50/50 text-gray-400 border-transparent" : "bg-white border-gray-100"}
                ${isToday(day) ? "ring-2 ring-blue-500 ring-offset-1" : ""}
                ${dailyLog ? "bg-blue-50/30" : ""}
              `}
            >
              <span className={`text-sm font-medium ${isToday(day) ? "text-blue-600" : ""}`}>
                {format(day, "d")}
              </span>

              {dailyLog && (
                <div className="mt-1">
                  {dailyLog.timeOut ? (
                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-md">
                      {hours.toFixed(1)}h
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-md">
                      Active
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}