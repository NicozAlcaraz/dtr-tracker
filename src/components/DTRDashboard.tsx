import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { format } from "date-fns";
import { Clock, LogIn, LogOut, Plus, Calendar } from "lucide-react";
import { formatDuration, formatTime, calculateDailyHours } from "../utils/timeHelpers";
import ManualEntryModal from "./ManualEntryModal";
import CalendarView from "./CalendarView";

const MOCK_USER_ID = "NicozAlcaraz";

export default function DTRDashboard() {
  const todayDateStr = format(new Date(), "yyyy-MM-dd");

  // Convex Hooks
  const logs = useQuery(api.dtr.getLogs, { userId: MOCK_USER_ID });
  const totalHours = useQuery(api.dtr.getTotalHours, { userId: MOCK_USER_ID });
  const clockIn = useMutation(api.dtr.clockIn);
  const clockOut = useMutation(api.dtr.clockOut);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [selectedLog, setSelectedLog] = useState<Doc<"dtr_logs"> | null>(null);

  // State derived from queries
  const todayLog = logs?.find((log) => log.date === todayDateStr);
  const isClockedIn = !!todayLog && !todayLog.timeOut;

  const handleClockInOut = async () => {
    const now = new Date().toISOString();
    try {
      if (isClockedIn && todayLog) {
        await clockOut({ id: todayLog._id, timeOut: now });
      } else {
        await clockIn({ userId: MOCK_USER_ID, date: todayDateStr, timeIn: now });
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleDayClick = (dateStr: string, log: Doc<"dtr_logs"> | undefined) => {
    setSelectedDate(dateStr);
    setSelectedLog(log || null);
    setIsModalOpen(true);
  };

  if (logs === undefined || totalHours === undefined) {
    return <div className="p-4 sm:p-8 text-center text-gray-500">Loading your tracker...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">

        {/* Header & Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 gap-4 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Clock className="text-blue-600 shrink-0" size={24} />
              <span className="truncate">Nicolai's Internship Time Tracker</span>
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Adidas OJT</p>
          </div>
          <div className="w-full sm:w-auto bg-blue-50 border border-blue-100 p-3 sm:p-4 rounded-lg text-center min-w-[150px]">
            <p className="text-[10px] sm:text-xs text-blue-600 font-semibold uppercase tracking-wider">Total Hours</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-900">{formatDuration(totalHours)}</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleClockInOut}
            className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-3 px-4 sm:px-6 rounded-lg text-white font-medium transition-colors touch-manipulation w-full sm:w-auto ${
              isClockedIn ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isClockedIn ? <LogOut size={20} /> : <LogIn size={20} />}
            {isClockedIn ? "Clock Out" : "Clock In Now"}
          </button>

          <button
            onClick={() => {
              setSelectedDate(undefined);
              setSelectedLog(null);
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4 sm:px-6 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-colors shadow-sm touch-manipulation w-full sm:w-auto"
          >
            <Plus size={20} /> Manual Entry
          </button>
        </div>

        {/* CalendarView */}
        <CalendarView logs={logs} onDayClick={handleDayClick} />

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs sm:text-sm whitespace-nowrap">
                  <th className="px-4 py-3 sm:p-4 font-medium">Date</th>
                  <th className="px-4 py-3 sm:p-4 font-medium">Time In</th>
                  <th className="px-4 py-3 sm:p-4 font-medium">Time Out</th>
                  <th className="px-4 py-3 sm:p-4 font-medium text-right">Hours Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm sm:text-base">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 sm:p-8 text-center text-gray-400">No logs found. Start clocking in!</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50/50 transition-colors whitespace-nowrap">
                      <td className="px-4 py-3 sm:p-4 flex items-center gap-2 text-gray-900 font-medium">
                        <Calendar size={16} className="text-gray-400 shrink-0" />
                        {log.date}
                      </td>
                      <td className="px-4 py-3 sm:p-4 text-gray-600">{formatTime(log.timeIn)}</td>
                      <td className="px-4 py-3 sm:p-4 text-gray-600">
                        {log.timeOut ? formatTime(log.timeOut) : <span className="text-amber-500 text-xs sm:text-sm bg-amber-50 px-2 py-1 rounded-full">Active</span>}
                      </td>
                      <td className="px-4 py-3 sm:p-4 text-right font-medium text-gray-900">
                        {formatDuration(calculateDailyHours(log.timeIn, log.timeOut))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      <ManualEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={MOCK_USER_ID}
        selectedDate={selectedDate}
        existingLog={selectedLog}
      />
    </div>
  );
}