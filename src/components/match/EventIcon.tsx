"use client";
import {
  Circle,
  Repeat2,
  Square,
  CircleOff,
  Video,
  Ban,
  Trophy,
} from "lucide-react";

export function EventIcon({ type, detail }: { type: string; detail: string }) {
  const base = "w-4 h-4";
  if (type === "Goal") {
    if (/Penalty Missed/i.test(detail))
      return <CircleOff className={`${base} text-red-500`} />;
    if (/Penalty/i.test(detail))
      return (
        <div className="relative">
          <Circle className={`${base} text-green-500`} />
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-green-900">
            P
          </span>
        </div>
      );
    if (/Own Goal/i.test(detail))
      return (
        <div className="relative">
          <Circle className={`${base} text-orange-500`} />
          <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-white">
            OG
          </span>
        </div>
      );
    return <Circle className={`${base} text-green-500`} />;
  }
  if (/Substitution/i.test(type) || type === "subst")
    return <Repeat2 className={`${base} text-cyan-500`} />;
  if (/Card/i.test(type)) {
    if (/Red/i.test(detail))
      return (
        <Square
          className={`${base} text-red-600 fill-red-600 stroke-red-600`}
        />
      );
    if (/Yellow/i.test(detail))
      return (
        <Square
          className={`${base} text-yellow-400 fill-yellow-400 stroke-yellow-400`}
        />
      );
  }
  if (/Penalty Missed/i.test(detail))
    return <CircleOff className={`${base} text-red-500`} />;
  if (/Penalty/i.test(detail))
    return (
      <div className="relative">
        <Circle className={`${base} text-green-500`} />
        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-green-900">
          P
        </span>
      </div>
    );
  if (/VAR/i.test(type) || /VAR/i.test(detail))
    return <Video className={`${base} text-indigo-500`} />;
  if (/Foul/i.test(detail)) return <Ban className={`${base} text-rose-500`} />;
  if (/Trophy|Winner/i.test(detail))
    return <Trophy className={`${base} text-amber-500`} />;
  return <Circle className={`${base} text-neutral-400`} />;
}
