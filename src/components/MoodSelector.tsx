"use client";

import { MOOD_CONFIG, MoodValue } from "@/lib/types";

interface MoodSelectorProps {
  selectedMood: number | null;
  onSelect: (mood: MoodValue) => void;
  disabled?: boolean;
}

export default function MoodSelector({ selectedMood, onSelect, disabled }: MoodSelectorProps) {
  const moods = [1, 2, 3, 4, 5] as MoodValue[];

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg text-gray-600">How do you feel?</p>
      <div className="flex gap-3">
        {moods.map((value) => {
          const config = MOOD_CONFIG[value];
          const isSelected = selectedMood === value;
          return (
            <button
              key={value}
              onClick={() => onSelect(value)}
              disabled={disabled}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl font-bold transition-all ${
                isSelected
                  ? "ring-4 ring-offset-2 scale-110"
                  : "opacity-60 hover:opacity-100 hover:scale-105"
              } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
              style={{
                backgroundColor: config.color,
                color: "white",
                ["--tw-ring-color" as string]: config.color,
              } as React.CSSProperties}
              title={config.label}
            >
              {value}
            </button>
          );
        })}
      </div>
      <div className="flex gap-3 text-xs text-gray-500">
        {moods.map((value) => (
          <span key={value} className="w-14 sm:w-16 text-center">
            {MOOD_CONFIG[value].label}
          </span>
        ))}
      </div>
    </div>
  );
}
