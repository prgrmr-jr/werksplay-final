import { useEffect, useState } from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

const pad = (n) => String(n).padStart(2, "0");

const formatManila = (iso) =>
    iso
        ? new Date(iso).toLocaleString("en-PH", {
          timeZone: "Asia/Manila",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        : "";

const getTimeLeft = (target) => {
  const diff = new Date(target) - Date.now();
  if (diff <= 0) return null;

  const total = Math.floor(diff / 1000);

  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
};

function TimeUnit({ value, label, color = "text-cyan" }) {
  return (
      <div className="flex min-w-[58px] flex-col items-center rounded-lg bg-white/5 px-2 py-2">
      <span className={`text-xl sm:text-2xl font-bold tabular-nums ${color}`}>
        {pad(value)}
      </span>
        <span className="mt-1 text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </span>
      </div>
  );
}

export default function Countdown({ tournament, compact = false }) {
  const [, force] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => force((v) => v + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const { status, scheduled_at, registration_deadline } = tournament;

  /* ---------- COMPLETED ---------- */

  if (status === "Completed") {
    return compact ? (
        <div className="flex items-center gap-1 text-xs text-green-400">
          <CheckCircleIcon className="h-4 w-4" />
          Finished
        </div>
    ) : (
        <div className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-green-400">
          <CheckCircleIcon className="h-5 w-5" />
          Tournament Finished
        </div>
    );
  }

  /* ---------- LIVE ---------- */

  if (status === "In Progress") {
    return compact ? (
        <div className="flex items-center gap-2 text-xs font-medium text-red-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
          LIVE
        </div>
    ) : (
        <div className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-400">
          <PlayCircleIcon className="h-5 w-5" />
          Live Now
        </div>
    );
  }

  /* ---------- REGISTRATION DEADLINE ---------- */

  if (registration_deadline) {
    const left = getTimeLeft(registration_deadline);

    if (left) {
      return compact ? (
          <div className="flex items-center gap-2 text-xs text-yellow-400">
            <ClockIcon className="h-4 w-4" />
            {pad(left.hours)}h {pad(left.minutes)}m {pad(left.seconds)}s
          </div>
      ) : (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
            <div className="mb-4 flex items-center gap-2 text-yellow-400">
              <ClockIcon className="h-5 w-5" />
              <span className="text-sm font-semibold">
              Registration Ends In
            </span>
            </div>

            <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
              <TimeUnit value={left.days} label="Days" color="text-yellow-400" />
              <TimeUnit value={left.hours} label="Hours" color="text-yellow-400" />
              <TimeUnit value={left.minutes} label="Min" color="text-yellow-400" />
              <TimeUnit value={left.seconds} label="Sec" color="text-yellow-400" />
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-white/40">
              <CalendarDaysIcon className="h-4 w-4" />
              {formatManila(registration_deadline)}
            </div>
          </div>
      );
    }

    return compact ? (
        <div className="text-xs text-red-400">Registration Closed</div>
    ) : (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-red-400">
          Registration Closed
        </div>
    );
  }

  /* ---------- START COUNTDOWN ---------- */

  if (scheduled_at) {
    const left = getTimeLeft(scheduled_at);

    if (!left) return null;

    return compact ? (
        <div className="flex items-center gap-2 text-xs text-cyan">
          <ClockIcon className="h-4 w-4" />
          {pad(left.days)}d {pad(left.hours)}h {pad(left.minutes)}m
        </div>
    ) : (
        <div className="rounded-xl border border-cyan/20 bg-cyan/5 p-4">
          <div className="mb-4 flex items-center gap-2 text-cyan">
            <ClockIcon className="h-5 w-5" />
            <span className="text-sm font-semibold">
            Tournament Starts In
          </span>
          </div>

          <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
            <TimeUnit value={left.days} label="Days" />
            <TimeUnit value={left.hours} label="Hours" />
            <TimeUnit value={left.minutes} label="Min" />
            <TimeUnit value={left.seconds} label="Sec" />
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-white/40">
            <CalendarDaysIcon className="h-4 w-4" />
            {formatManila(scheduled_at)}
          </div>
        </div>
    );
  }

  return null;
}