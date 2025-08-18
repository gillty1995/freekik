"use client";
import { useEffect, useState } from "react";

interface Props {
  status: string | null;
  elapsed: number | null;
  className?: string;
}

const ACTIVE_STATUSES = new Set(["1H", "2H", "ET", "1ET", "2ET", "P"]);

export function MatchClock({ status, elapsed, className }: Props) {
  const [ref, setRef] = useState<{
    baseAt: number;
    baseElapsed: number;
    status: string;
  } | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (status && elapsed != null && ACTIVE_STATUSES.has(status)) {
      setRef({ baseAt: Date.now(), baseElapsed: elapsed, status });
    } else if (status && !ACTIVE_STATUSES.has(status)) {
      setRef(null);
    }
  }, [status, elapsed]);

  // Tick
  useEffect(() => {
    if (!ref) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [ref]);

  function format(): string | null {
    if (!status) return null;

    // Non‑active simple labels
    if (!ref || !ACTIVE_STATUSES.has(status)) {
      if (status === "HT") return "HT";
      if (status === "FT") return "FT";
      if (status === "P") return "PEN";
      return elapsed != null ? `${elapsed}'` : null;
    }

    const deltaSec = Math.floor((now - ref.baseAt) / 1000);
    const totalSec = ref.baseElapsed * 60 + deltaSec;
    const totalMin = Math.floor(totalSec / 60);
    const sec = (totalSec % 60).toString().padStart(2, "0");

    const plusFmt = (base: number) => `${base}+${totalMin - base}'${sec}`;

    switch (status) {
      case "1H":
        return totalMin > 45 ? plusFmt(45) : `${totalMin}'${sec}`;
      case "2H":
        return totalMin > 90 ? plusFmt(90) : `${totalMin}'${sec}`;
      case "1ET":
      case "ET":
        return totalMin > 105 ? plusFmt(105) : `${totalMin}'${sec}`;
      case "2ET":
        return totalMin > 120 ? plusFmt(120) : `${totalMin}'${sec}`;
      case "P":
        return "PEN";
      default:
        return `${totalMin}'${sec}`;
    }
  }

  const display = format();
  if (!display) return null;
  return (
    <span className={className ?? "font-mono text-emerald-600"}>
      ⏱ {display}
    </span>
  );
}
