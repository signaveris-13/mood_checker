"use client";

import { MoodEntry, MOOD_CONFIG, MoodValue } from "@/lib/types";

interface YearViewProps {
  year: number;
  entries: MoodEntry[];
  onSelectMonth: (month: number) => void;
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getAverageMood(entries: MoodEntry[]): number | null {
  if (entries.length === 0) return null;
  const sum = entries.reduce((acc, e) => acc + e.moodValue, 0);
  return Math.round(sum / entries.length);
}

export default function YearView({ year, entries, onSelectMonth }: YearViewProps) {
  // Group entries by month
  const monthGroups = new Map<number, MoodEntry[]>();
  for (const entry of entries) {
    const m = parseInt(entry.date.split("-")[1], 10) - 1;
    if (!monthGroups.has(m)) monthGroups.set(m, []);
    monthGroups.get(m)!.push(entry);
  }

  return (
    <div className="py-4">
      <h3 className="text-center text-lg font-semibold text-gray-700 mb-4">{year}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {MONTH_LABELS.map((label, i) => {
          const monthEntries = monthGroups.get(i) || [];
          const avgMood = getAverageMood(monthEntries);
          const today = new Date();
          const isFuture = year > today.getFullYear() || (year === today.getFullYear() && i > today.getMonth());

          return (
            <button
              key={label}
              onClick={() => !isFuture && onSelectMonth(i)}
              disabled={isFuture}
              className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${
                isFuture
                  ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                  : "hover:ring-2 hover:ring-blue-300 cursor-pointer"
              }`}
              style={{
                backgroundColor:
                  avgMood && !isFuture ? MOOD_CONFIG[avgMood as MoodValue].color : undefined,
                color: avgMood && !isFuture ? "white" : undefined,
              }}
            >
              <span className="text-sm font-medium">{label}</span>
              {avgMood && !isFuture ? (
                <span className="text-lg font-bold">{avgMood}</span>
              ) : (
                <span className="text-lg">—</span>
              )}
              {!isFuture && (
                <span className="text-xs opacity-75">
                  {monthEntries.length} {monthEntries.length === 1 ? "day" : "days"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
