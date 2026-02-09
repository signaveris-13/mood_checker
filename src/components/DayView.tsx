"use client";

import { MoodEntry, MOOD_CONFIG, MoodValue } from "@/lib/types";
import MoodSelector from "./MoodSelector";

interface DayViewProps {
  selectedDate: string;
  entry: MoodEntry | null;
  onSelectMood: (mood: MoodValue) => void;
  isFuture: boolean;
}

export default function DayView({ selectedDate, entry, onSelectMood, isFuture }: DayViewProps) {
  const dateObj = new Date(selectedDate + "T00:00:00");
  const formatted = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <h2 className="text-lg font-semibold text-gray-700">{formatted}</h2>

      {isFuture ? (
        <p className="text-gray-400">Cannot log mood for future dates</p>
      ) : (
        <>
          <MoodSelector
            selectedMood={entry?.moodValue ?? null}
            onSelect={onSelectMood}
          />
          {entry && (
            <div className="mt-2 flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: MOOD_CONFIG[entry.moodValue as MoodValue].color }}
              />
              <span className="text-gray-600">
                {MOOD_CONFIG[entry.moodValue as MoodValue].label}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
