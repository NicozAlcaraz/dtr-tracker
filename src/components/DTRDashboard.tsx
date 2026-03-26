import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { format } from "date-fns";
import { Clock, LogIn, LogOut, Plus, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDuration, formatTime, calculateDailyHours } from "../utils/timeHelpers";
import ManualEntryModal from "./ManualEntryModal";
import CalendarView from "./CalendarView";

const MOCK_USER_ID = "NicozAlcaraz";
const LOGS_PER_PAGE = 5; // You can change how many logs show per page here

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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

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
    return (
      <div className="min-h-screen bg-midnight-slate flex flex-col items-center justify-center p-4">
        {/* Custom Keyframes for the Kickflip Animation */}
        <style>{`
          @keyframes kickflip {
            0% { transform: translateY(0) rotate(0deg); }
            30% { transform: translateY(-40px) rotate(120deg); }
            70% { transform: translateY(-40px) rotate(240deg); }
            100% { transform: translateY(0) rotate(360deg); }
          }
          .animate-kickflip {
            animation: kickflip 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
          @keyframes shadow-pulse {
            0% { transform: scale(1); opacity: 0.2; }
            50% { transform: scale(0.6); opacity: 0.1; }
            100% { transform: scale(1); opacity: 0.2; }
          }
          .animate-shadow {
            animation: shadow-pulse 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
        `}</style>

        <div className="relative flex flex-col items-center">
          {/* Rotating Shoe Animation */}
          <div className="relative z-10 animate-kickflip">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-xl"
            >
              {/* Sneaker Base */}
              <path d="M20.2 13.4c-.6-1-1.6-1.6-2.7-1.8l-3.2-.5-.8-2.5c-.3-.8-1-1.3-1.8-1.4h-2.5c-1.1 0-2 .9-2 2v2.8l-3.5.7c-1.2.2-2.1 1.3-2.1 2.5v2.3c0 1.1.9 2 2 2h14c2.2 0 4-1.8 4-4v-.6c0-.6-.3-1.1-.6-1.5z" />
              {/* 3 Stripes */}
              <path fill="black" d="M11.2 13l-1.5 4.5h1.5l1.5-4.5zm2.5 0l-1.5 4.5h1.5l1.5-4.5zm2.5.5l-1.2 4h1.5l1.2-4z" />
            </svg>
          </div>

          {/* Floor Shadow syncing with the jump */}
          <div className="w-16 sm:w-20 h-3 bg-black rounded-[100%] blur-[4px] mt-2 animate-shadow"></div>

          {/* Loading Text */}
          <h3 className="mt-8 text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-1">
            Lacing up your tracker
            <span className="flex gap-0.5 ml-1">
              <span className="animate-bounce text-white" style={{ animationDelay: "0ms" }}>.</span>
              <span className="animate-bounce text-white" style={{ animationDelay: "150ms" }}>.</span>
              <span className="animate-bounce text-white" style={{ animationDelay: "300ms" }}>.</span>
            </span>
          </h3>
          <p className="text-sm text-white mt-2 font-medium animate-pulse">
            Getting your Adidas OJT data...
          </p>
        </div>
      </div>
    );
  }

  // Pagination Logic
  const totalPages = Math.ceil(logs.length / LOGS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (safeCurrentPage - 1) * LOGS_PER_PAGE;
  const currentLogs = logs.slice(startIndex, startIndex + LOGS_PER_PAGE);

  return (
    <div className="min-h-screen bg-midnight-slate p-4 sm:p-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">

        {/* Header & Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-black p-4 sm:p-6 rounded-xl shadow-sm border border-black gap-4 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Clock className="text-white shrink-0" size={24} />
              <span className="text-white truncate">Nicolai's Internship Time Tracker</span>
            </h1>
            <p className="text-white text-xs sm:text-sm mt-1">Adidas OJT</p>
          </div>
          <div className="w-full sm:w-auto bg-black-200 border border-white p-6 sm:p-4 rounded-lg text-center min-w-[150px]">
            <p className="text-[10px] sm:text-xs text-white font-semibold uppercase tracking-wider">Total Hours</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{formatDuration(totalHours)}</p>
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
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4 sm:px-6 rounded-lg bg-black border border-black text-white hover:bg-gray-500 font-medium transition-colors shadow-sm touch-manipulation w-full sm:w-auto"
          >
            <Plus size={20} /> Manual Entry
          </button>
        </div>

        {/* CalendarView */}
        <CalendarView logs={logs} onDayClick={handleDayClick} />

        {/* Logs Table */}
        <div className="bg-black rounded-xl shadow-sm border border-black overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-white-50 border-b border-white text-white text-xs sm:text-sm whitespace-nowrap">
                  <th className="px-4 py-3 sm:p-4 font-medium">Date</th>
                  <th className="px-4 py-3 sm:p-4 font-medium">Time In</th>
                  <th className="px-4 py-3 sm:p-4 font-medium">Time Out</th>
                  <th className="px-4 py-3 sm:p-4 font-medium text-right">Hours Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 text-sm sm:text-base">
                {currentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 sm:p-8 text-center text-gray-400">No logs found. Start clocking in!</td>
                  </tr>
                ) : (
                  currentLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-white/5 transition-colors whitespace-nowrap">
                      <td className="px-4 py-3 sm:p-4 flex items-center gap-2 text-white font-medium">
                        <Calendar size={16} className="text-white shrink-0" />
                        {log.date}
                      </td>
                      <td className="px-4 py-3 sm:p-4 text-white">{formatTime(log.timeIn)}</td>
                      <td className="px-4 py-3 sm:p-4 text-white">
                        {log.timeOut ? formatTime(log.timeOut) : <span className="text-amber-500 text-xs sm:text-sm bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">Active</span>}
                      </td>
                      <td className="px-4 py-3 sm:p-4 text-right font-medium text-white">
                        {formatDuration(calculateDailyHours(log.timeIn, log.timeOut))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 border-t border-white/20 bg-black">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <span className="text-sm text-gray-400 font-medium">
                Page {safeCurrentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
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