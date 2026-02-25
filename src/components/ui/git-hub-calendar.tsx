"use client";

import { useState, useEffect } from "react";
import {
  format,
  subDays,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";

interface ContributionDay {
  date: string;
  count: number;
}

interface GitHubCalendarProps {
  data: ContributionDay[];
  colors?: string[];
  onDayClick?: (day: ContributionDay) => void;
}

const GitHubCalendar = ({
  data,
  colors = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
  onDayClick,
}: GitHubCalendarProps) => {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const today = new Date();
  const startDate = subDays(today, 364);
  const weeks = 53;

  useEffect(() => {
    setContributions(
      data.map((item) => ({ ...item, date: new Date(item.date).toISOString().slice(0, 10) }))
    );
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return colors[0];
    if (count === 1) return colors[1];
    if (count === 2) return colors[2];
    if (count === 3) return colors[3];
    return colors[4] || colors[colors.length - 1];
  };

  const renderWeeks = () => {
    const weeksArray = [];
    let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 0 });

    for (let i = 0; i < weeks; i++) {
      const weekDays = eachDayOfInterval({
        start: currentWeekStart,
        end: endOfWeek(currentWeekStart, { weekStartsOn: 0 }),
      });

      weeksArray.push(
        <div key={i} className="flex flex-col gap-1">
          {weekDays.map((day, index) => {
            const dayStr = day.toISOString().slice(0, 10);
            const contribution = contributions.find((c) => c.date === dayStr);
            const color = contribution ? getColor(contribution.count) : colors[0];
            const isFuture = day > today;

            return (
              <div
                key={index}
                className={`w-3 h-3 rounded-[4px] transition-all ${
                  isFuture
                    ? "opacity-20 cursor-default"
                    : "cursor-pointer hover:ring-1 hover:ring-white/40"
                }`}
                style={{ backgroundColor: isFuture ? colors[0] : color }}
                title={`${format(day, "PPP")}: ${contribution?.count || 0} tarefas`}
                onClick={() => {
                  if (!isFuture && onDayClick) {
                    onDayClick({ date: dayStr, count: contribution?.count || 0 });
                  }
                }}
              />
            );
          })}
        </div>
      );

      currentWeekStart = addDays(currentWeekStart, 7);
    }
    return weeksArray;
  };

  const renderMonthLabels = () => {
    const months: JSX.Element[] = [];
    let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 0 });
    let lastMonth = -1;

    for (let i = 0; i < weeks; i++) {
      const month = currentWeekStart.getMonth();
      if (month !== lastMonth) {
        months.push(
          <span
            key={`${month}-${i}`}
            className="text-[10px] text-muted-foreground absolute"
            style={{ left: i * 16 }}
          >
            {format(currentWeekStart, "MMM")}
          </span>
        );
        lastMonth = month;
      }
      currentWeekStart = addDays(currentWeekStart, 7);
    }
    return months;
  };

  const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const totalContributions = contributions.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2 overflow-x-auto">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pt-5 shrink-0">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-3 flex items-center">
              {i % 2 === 1 ? (
                <span className="text-[10px] text-muted-foreground pr-2 leading-none">{label}</span>
              ) : (
                <span className="text-[10px] pr-2 leading-none invisible">{label}</span>
              )}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex-1 min-w-0">
          {/* Month labels */}
          <div className="relative h-5 mb-0.5" style={{ width: weeks * 16 }}>
            {renderMonthLabels()}
          </div>
          {/* Weeks */}
          <div className="flex gap-1">{renderWeeks()}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-muted-foreground">
          {totalContributions} tarefas no último ano
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground">Menos</span>
          {colors.map((c, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-[4px]"
              style={{ backgroundColor: c }}
            />
          ))}
          <span className="text-[10px] text-muted-foreground">Mais</span>
        </div>
      </div>
    </div>
  );
};

export default GitHubCalendar;
