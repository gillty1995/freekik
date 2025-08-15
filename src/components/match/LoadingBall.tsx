"use client";
import React from "react";

interface LoadingBallProps {
  label?: string;
  size?: number;
  fullscreen?: boolean;
}

export function LoadingBall({
  label = "Loading",
  size = 120,
  fullscreen,
}: LoadingBallProps) {
  // Base size, then slightly smaller visual image (80%)
  const base = Math.max(40, size);
  const imgSize = Math.round(base * 0.8);

  const content = (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative"
        style={{ width: base, height: base }}
        role="status"
        aria-label={label}
      >
        <div
          className="absolute inset-0 animate-ball-roll-bounce will-change-transform"
          style={{
            width: imgSize,
            height: imgSize,
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            backgroundImage: "url(/icons/soccerball.png)",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 bg-black/35 rounded-full blur-md animate-ball-shadow"
          style={{
            bottom: -base * 0.16,
            width: base * 0.5,
            height: base * 0.15,
          }}
        />
      </div>
      <div className="font-mono text-xs tracking-wide flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ball-pulse" />
        {label}
      </div>
      <style jsx>{`
        @keyframes roll-bounce-slow {
          0% {
            transform: translate(-50%, -50%) translateY(0) rotate(0deg);
          }
          25% {
            transform: translate(-50%, -50%) translateY(6%) rotate(90deg);
          }
          50% {
            transform: translate(-50%, -50%) translateY(0) rotate(180deg);
          }
          75% {
            transform: translate(-50%, -50%) translateY(6%) rotate(270deg);
          }
          100% {
            transform: translate(-50%, -50%) translateY(0) rotate(360deg);
          }
        }
        @keyframes shadow-slow {
          0%,
          50%,
          100% {
            transform: translate(-50%, 0) scale(1);
            opacity: 0.45;
          }
          25%,
          75% {
            transform: translate(-50%, 0) scale(0.82);
            opacity: 0.3;
          }
        }
        @keyframes pulseDot {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-ball-roll-bounce {
          animation: roll-bounce-slow 6s cubic-bezier(0.55, 0.15, 0.35, 0.95)
            infinite;
        }
        .animate-ball-shadow {
          animation: shadow-slow 6s cubic-bezier(0.55, 0.15, 0.35, 0.95)
            infinite;
        }
        .animate-ball-pulse {
          animation: pulseDot 1.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-ball-roll-bounce,
          .animate-ball-shadow,
          .animate-ball-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/70 backdrop-blur-sm">
        {content}
      </div>
    );
  }
  return <div className="py-6 flex justify-center">{content}</div>;
}
