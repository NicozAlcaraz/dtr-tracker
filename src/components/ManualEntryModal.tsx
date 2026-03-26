import { useState, useEffect, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { X, AlertCircle, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  selectedDate?: string;
  existingLog?: {
    _id: Id<"dtr_logs">;
    date: string;
    timeIn: string;
    timeOut?: string;
  } | null;
}

export default function ManualEntryModal({ isOpen, onClose, userId, selectedDate, existingLog }: ManualEntryModalProps) {
  const addManualEntry = useMutation(api.dtr.addManualEntry);
  const updateEntry = useMutation(api.dtr.updateEntry);
  const deleteEntry = useMutation(api.dtr.deleteEntry);

  const [date, setDate] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDate(selectedDate || format(new Date(), "yyyy-MM-dd"));

      if (existingLog) {
        setTimeIn(format(parseISO(existingLog.timeIn), "HH:mm"));
        setTimeOut(existingLog.timeOut ? format(parseISO(existingLog.timeOut), "HH:mm") : "");
      } else {
        setTimeIn("");
        setTimeOut("");
      }
      setError(null);
    }
  }, [isOpen, selectedDate, existingLog]);

  const createIsoString = (dateStr: string, timeStr: string) => {
    const combinedDate = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(combinedDate.getTime())) {
      throw new Error("Invalid time format detected.");
    }
    return combinedDate.toISOString();
  };

  const handleDelete = async () => {
    if (!existingLog) return;
    if (!confirm("Are you sure you want to delete this entry?")) return;

    setIsSubmitting(true);
    try {
      await deleteEntry({ id: existingLog._id });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!date || !timeIn || !timeOut) {
      setError("Please fill out all fields.");
      return;
    }

    if (timeOut <= timeIn) {
      setError("Time Out must be later than Time In.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingLog) {
        await updateEntry({
          id: existingLog._id,
          timeIn: createIsoString(date, timeIn),
          timeOut: createIsoString(date, timeOut),
        });
      } else {
        await addManualEntry({
          userId,
          date,
          timeIn: createIsoString(date, timeIn),
          timeOut: createIsoString(date, timeOut),
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            {existingLog ? "Edit Entry" : "Add Manual Entry"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 sm:p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors touch-manipulation"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1 sm:space-y-1.5">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 sm:p-2.5 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow touch-manipulation"
              disabled={!!existingLog}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-1.5">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Time In</label>
              <input
                type="time"
                value={timeIn}
                onChange={(e) => setTimeIn(e.target.value)}
                className="w-full p-3 sm:p-2.5 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow touch-manipulation"
                required
              />
            </div>
            <div className="space-y-1 sm:space-y-1.5">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Time Out</label>
              <input
                type="time"
                value={timeOut}
                onChange={(e) => setTimeOut(e.target.value)}
                className="w-full p-3 sm:p-2.5 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow touch-manipulation"
                required
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 mt-2 sm:mt-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center border-t border-gray-100 gap-3 sm:gap-0 shrink-0">
            {existingLog ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-1 text-red-600 hover:bg-red-50 px-3 py-3 sm:py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation order-2 sm:order-1 border border-transparent hover:border-red-100"
              >
                <Trash2 size={16} /> Delete
              </button>
            ) : <div className="hidden sm:block"></div>}

            <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors touch-manipulation"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 py-3 sm:py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors touch-manipulation"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}