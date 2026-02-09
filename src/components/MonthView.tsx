"use client";

import { MoodEntry, MOOD_CONFIG, MoodValue } from "@/lib/types";

interface MonthViewProps {
  year: number;
  month: number; // 0-indexed
  entries: MoodEntry[];
  onSelectDate: (date: string) => void;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MonthView({ year, month, entries, onSelectDate }: MonthViewProps) {
  const entryMap = new Map(entries.map((e) => [e.date, e]));
  const today = new Date().toISOString().split("T")[0];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Monday = 0, Sunday = 6
  const startDow = (firstDay.getDay() + 6) % 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = firstDay.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="py-4">
      <h3 className="text-center text-lg font-semibold text-gray-700 mb-4">{monthLabel}</h3>
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-gray-400 pb-1">
            {label}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const entry = entryMap.get(dateStr);
          const isToday = dateStr === today;
          const isFuture = dateStr > today;

          return (
            <button
              key={dateStr}
              onClick={() => !isFuture && onSelectDate(dateStr)}
              disabled={isFuture}
              className={`aspect-square rounded-md flex items-center justify-center text-xs sm:text-sm font-medium transition-colors ${
                isFuture
                  ? "text-gray-300 cursor-not-allowed"
                  : "hover:ring-2 hover:ring-blue-300 cursor-pointer"
              } ${isToday ? "ring-2 ring-blue-500" : ""}`}
              style={{
                backgroundColor: entry
                  ? MOOD_CONFIG[entry.moodValue as MoodValue].color
                  : undefined,
                color: entry ? "white" : undefined,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
