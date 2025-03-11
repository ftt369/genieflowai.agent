import React from 'react';
import { useThemeStore, type ThemeSchedule } from '@stores/theme/themeStore';
import { cn } from '@utils/cn';

const ThemeScheduler: React.FC = () => {
  const { schedule, updateSchedule } = useThemeStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Auto Theme Schedule</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={schedule.enabled}
            onChange={(e) => updateSchedule({ enabled: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-xs text-muted-foreground">Enable</span>
        </label>
      </div>

      {schedule.enabled && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Light Theme Start</label>
            <input
              type="time"
              value={schedule.lightStart}
              onChange={(e) => updateSchedule({ lightStart: e.target.value })}
              className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Dark Theme Start</label>
            <input
              type="time"
              value={schedule.darkStart}
              onChange={(e) => updateSchedule({ darkStart: e.target.value })}
              className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeScheduler; 