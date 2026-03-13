function padNumber(value: number): string {
  return value.toString().padStart(2, "0");
}

export function getTodayDateValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${padNumber(now.getMonth() + 1)}-${padNumber(now.getDate())}`;
}

export function getCurrentTimeValue(): string {
  const now = new Date();
  return `${padNumber(now.getHours())}:${padNumber(now.getMinutes())}`;
}

export function isValidMonthValue(value: string): boolean {
  return /^\d{4}-\d{2}$/.test(value);
}

export function isValidDateValue(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidTimeValue(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function parseMonthValue(value?: string | null): string {
  if (value && isValidMonthValue(value)) {
    return value;
  }

  return getTodayDateValue().slice(0, 7);
}

export function buildDateValue(year: number, monthIndex: number, day: number): string {
  return `${year}-${padNumber(monthIndex + 1)}-${padNumber(day)}`;
}

export function getMonthBounds(monthValue: string): {
  monthValue: string;
  year: number;
  monthIndex: number;
  startDate: string;
  endDate: string;
  daysInMonth: number;
} {
  const [yearValue, monthPart] = parseMonthValue(monthValue).split("-");
  const year = Number(yearValue);
  const monthIndex = Number(monthPart) - 1;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  return {
    monthValue: `${yearValue}-${monthPart}`,
    year,
    monthIndex,
    startDate: buildDateValue(year, monthIndex, 1),
    endDate: buildDateValue(year, monthIndex, daysInMonth),
    daysInMonth,
  };
}

export function getMonthLabel(monthValue: string): string {
  const { year, monthIndex } = getMonthBounds(monthValue);
  return new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));
}

export function shiftMonthValue(monthValue: string, offset: number): string {
  const { year, monthIndex } = getMonthBounds(monthValue);
  const next = new Date(year, monthIndex + offset, 1);

  return `${next.getFullYear()}-${padNumber(next.getMonth() + 1)}`;
}

export function formatAppointmentDateLong(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, day));
}

export function isDateInMonth(dateValue: string, monthValue: string): boolean {
  return dateValue.startsWith(`${parseMonthValue(monthValue)}-`);
}

export function getDefaultSelectedDay(monthValue: string, dayValue?: string | null): string {
  if (dayValue && isValidDateValue(dayValue) && isDateInMonth(dayValue, monthValue)) {
    return dayValue;
  }

  const today = getTodayDateValue();

  if (isDateInMonth(today, monthValue)) {
    return today;
  }

  const { year, monthIndex } = getMonthBounds(monthValue);
  return buildDateValue(year, monthIndex, 1);
}

export function buildMonthCalendar(
  monthValue: string,
  countsByDate: Map<string, number>,
  selectedDate: string
): Array<
  | {
      kind: "empty";
      key: string;
    }
  | {
      kind: "day";
      key: string;
      date: string;
      dayNumber: number;
      count: number;
      isSelected: boolean;
      isToday: boolean;
    }
> {
  const { year, monthIndex, daysInMonth } = getMonthBounds(monthValue);
  const firstDayWeekIndex = new Date(year, monthIndex, 1).getDay();
  const leadingEmptyCount = (firstDayWeekIndex + 6) % 7;
  const cells: Array<
    | {
        kind: "empty";
        key: string;
      }
    | {
        kind: "day";
        key: string;
        date: string;
        dayNumber: number;
        count: number;
        isSelected: boolean;
        isToday: boolean;
      }
  > = [];

  for (let index = 0; index < leadingEmptyCount; index += 1) {
    cells.push({
      kind: "empty",
      key: `empty-${index}`,
    });
  }

  const today = getTodayDateValue();

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = buildDateValue(year, monthIndex, day);
    cells.push({
      kind: "day",
      key: date,
      date,
      dayNumber: day,
      count: countsByDate.get(date) ?? 0,
      isSelected: date === selectedDate,
      isToday: date === today,
    });
  }

  return cells;
}
