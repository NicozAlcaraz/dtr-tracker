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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-6 w-full max-w-full overflow-hidden">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex gap-1 sm:gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg touch-manipulation transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 sm:px-3 sm:py-1 text-sm font-medium hover:bg-gray-100 rounded-lg touch-manipulation transition-colors flex-1 sm:flex-none"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg touch-manipulation transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs sm:text-sm font-medium text-gray-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="truncate" title={day}>
            {/* Show 1 letter on ultra-small screens, full 3 letters on bigger screens */}
            <span className="sm:hidden">{day.charAt(0)}</span>
            <span className="hidden sm:inline">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
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
                min-h-[64px] sm:min-h-[80px] p-1 sm:p-2 rounded-lg border cursor-pointer transition-all hover:border-blue-400 hover:shadow-sm flex flex-col justify-between touch-manipulation overflow-hidden
                ${!isCurrentMonth ? "bg-gray-50/50 text-gray-400 border-transparent" : "bg-white border-gray-100"}
                ${isToday(day) ? "ring-2 ring-blue-500 ring-offset-1" : ""}
                ${dailyLog ? "bg-blue-50/30" : ""}
              `}
            >
              <span className={`text-xs sm:text-sm font-medium ${isToday(day) ? "text-blue-600" : ""}`}>
                {format(day, "d")}
              </span>

              {dailyLog && (
                <div className="mt-1 flex justify-center sm:justify-start">
                  {dailyLog.timeOut ? (
                    <span className="inline-block px-1 sm:px-2 py-0.5 bg-green-100 text-green-700 text-[10px] sm:text-xs font-semibold rounded sm:rounded-md w-full sm:w-auto text-center truncate">
                      {hours.toFixed(1)}<span className="hidden sm:inline">h</span>
                    </span>
                  ) : (
                    <span className="inline-block px-1 sm:px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] sm:text-xs font-semibold rounded sm:rounded-md w-full sm:w-auto text-center truncate">
                      <span className="sm:hidden">On</span>
                      <span className="hidden sm:inline">Active</span>
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