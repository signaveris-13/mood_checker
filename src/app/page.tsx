"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import ViewSwitcher from "@/components/ViewSwitcher";
import DayView from "@/components/DayView";
import WeekView from "@/components/WeekView";
import MonthView from "@/components/MonthView";
import YearView from "@/components/YearView";
import { ViewMode, MoodEntry, MoodValue } from "@/lib/types";

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function todayStr(): string {
  return toDateStr(new Date());
}

export default function Home() {
  const { data: session, status } = useSession();
  const [view, setView] = useState<ViewMode>("day");
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedYear = parseInt(selectedDate.split("-")[0], 10);
  const selectedMonth = parseInt(selectedDate.split("-")[1], 10) - 1;

  const fetchEntries = useCallback(async (from: string, to: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/moods?from=${from}&to=${to}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;

    let from: string, to: string;

    if (view === "year") {
      from = `${selectedYear}-01-01`;
      to = `${selectedYear}-12-31`;
    } else if (view === "month") {
      from = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      to = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    } else if (view === "week") {
      const d = new Date(selectedDate + "T00:00:00");
      const day = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((day + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      from = toDateStr(monday);
      to = toDateStr(sunday);
    } else {
      from = selectedDate;
      to = selectedDate;
    }

    fetchEntries(from, to);
  }, [status, view, selectedDate, selectedYear, selectedMonth, fetchEntries]);

  const saveMood = async (mood: MoodValue) => {
    const res = await fetch("/api/moods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, moodValue: mood }),
    });
    if (res.ok) {
      const saved = await res.json();
      setEntries((prev) => {
        const filtered = prev.filter((e) => e.date !== saved.date);
        return [...filtered, saved].sort((a, b) => a.date.localeCompare(b.date));
      });
    }
  };

  const navigateDate = (delta: number) => {
    const d = new Date(selectedDate + "T00:00:00");
    if (view === "day") {
      d.setDate(d.getDate() + delta);
    } else if (view === "week") {
      d.setDate(d.getDate() + delta * 7);
    } else if (view === "month") {
      d.setMonth(d.getMonth() + delta);
    } else {
      d.setFullYear(d.getFullYear() + delta);
    }
    const newDate = toDateStr(d);
    if (newDate <= todayStr()) {
      setSelectedDate(newDate);
    }
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setView("day");
  };

  const handleSelectMonth = (month: number) => {
    setSelectedDate(`${selectedYear}-${String(month + 1).padStart(2, "0")}-01`);
    setView("month");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Mood Tracker</h2>
            <p className="text-gray-500">Track your daily mood in seconds</p>
          </div>
          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  const currentEntry = entries.find((e) => e.date === selectedDate) || null;
  const isFuture = selectedDate > todayStr();

  let navLabel: string;
  if (view === "year") {
    navLabel = String(selectedYear);
  } else if (view === "month") {
    navLabel = new Date(selectedYear, selectedMonth).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } else if (view === "week") {
    const d = new Date(selectedDate + "T00:00:00");
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    navLabel = `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${sunday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  } else {
    navLabel = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const canGoForward = (() => {
    const d = new Date(selectedDate + "T00:00:00");
    if (view === "day") d.setDate(d.getDate() + 1);
    else if (view === "week") d.setDate(d.getDate() + 7);
    else if (view === "month") d.setMonth(d.getMonth() + 1);
    else d.setFullYear(d.getFullYear() + 1);
    return toDateStr(d) <= todayStr();
  })();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 flex flex-col gap-4">
        {/* View switcher */}
        <div className="flex justify-center">
          <ViewSwitcher current={view} onChange={setView} />
        </div>

        {/* Date navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setSelectedDate(todayStr())}
            className="text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            {navLabel}
          </button>

          <button
            onClick={() => navigateDate(1)}
            disabled={!canGoForward}
            className={`p-2 rounded-lg ${
              canGoForward ? "hover:bg-gray-100 text-gray-600" : "text-gray-300 cursor-not-allowed"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="text-center text-sm text-gray-400 animate-pulse">Loading...</div>
        )}

        {/* View content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          {view === "day" && (
            <DayView
              selectedDate={selectedDate}
              entry={currentEntry}
              onSelectMood={saveMood}
              isFuture={isFuture}
            />
          )}
          {view === "week" && (
            <WeekView
              selectedDate={selectedDate}
              entries={entries}
              onSelectDate={handleSelectDate}
            />
          )}
          {view === "month" && (
            <MonthView
              year={selectedYear}
              month={selectedMonth}
              entries={entries}
              onSelectDate={handleSelectDate}
            />
          )}
          {view === "year" && (
            <YearView
              year={selectedYear}
              entries={entries}
              onSelectMonth={handleSelectMonth}
            />
          )}
        </div>
      </main>
    </div>
  );
}
