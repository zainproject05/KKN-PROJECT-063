import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function SessionCountdown({ closesAt, date }: { closesAt: string; date: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Parse date and time to create a target Date object
      // Sometimes date is in different format, let's just make sure it's valid
      const targetDate = new Date(`${date}T${closesAt}:00`);
      const now = new Date();
      const diffMs = targetDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft("Waktu Habis");
        return;
      }

      const diffSecs = Math.floor(diffMs / 1000);
      const hours = Math.floor(diffSecs / 3600);
      const minutes = Math.floor((diffSecs % 3600) / 60);
      const seconds = diffSecs % 60;

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [closesAt, date]);

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.05] border border-white/10 text-white shadow-sm">
      <Clock size={11} className="text-emerald-400 animate-pulse" />
      <span className="text-[10px] font-mono font-black tracking-widest">{timeLeft}</span>
    </div>
  );
}
