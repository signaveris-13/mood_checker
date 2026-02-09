export type ViewMode = "day" | "week" | "month" | "year";

export interface MoodEntry {
  id: string;
  date: string;
  moodValue: number;
}

export const MOOD_CONFIG = {
  1: { label: "Terrible", color: "#EF4444", bg: "bg-red-500", text: "text-red-500" },
  2: { label: "Sad", color: "#F97316", bg: "bg-orange-500", text: "text-orange-500" },
  3: { label: "Normal", color: "#9CA3AF", bg: "bg-gray-400", text: "text-gray-400" },
  4: { label: "Good", color: "#86EFAC", bg: "bg-green-300", text: "text-green-300" },
  5: { label: "Brilliant", color: "#22C55E", bg: "bg-green-500", text: "text-green-500" },
} as const;

export type MoodValue = keyof typeof MOOD_CONFIG;
