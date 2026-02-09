"use client";

import { MoodEntry, MOOD_CONFIG, MoodValue } from "@/lib/types";

interface WeekViewProps {
  selectedDate: string;
  entries: MoodEntry[];
  onSelectDate: (date: string) => void;
}

function getWeekDates(dateStr: string): string[] {
  const date = new Date(dateStr + "T00:00:00");
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((day + 6) % 7));

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeekView({ selectedDate, entries, onSelectDate }: WeekViewProps) {
  const weekDates = getWeekDates(selectedDate);
  const entryMap = new Map(entries.map((e) => [e.date, e]));
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="py-4">
      <div className="grid grid-cols-7 gap-2">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-gray-400 pb-2">
            {label}
          </div>
        ))}
        {weekDates.map((date, i) => {
          const entry = entryMap.get(date);
          const isToday = date === today;
          const dayNum = new Date(date + "T00:00:00").getDate();

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors hover:bg-gray-100 ${
                isToday ? "ring-2 ring-blue-400" : ""
              }`}
            >
              <span className="text-sm text-gray-600">{dayNum}</span>
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{
                  backgroundColor: entry
                    ? MOOD_CONFIG[entry.moodValue as MoodValue].color
                    : "#E5E7EB",
                }}
              >
                {entry ? entry.moodValue : ""}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
