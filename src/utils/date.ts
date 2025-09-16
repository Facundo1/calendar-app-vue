export function getDaysInMonth(year: number, month: number) {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);

  const startDayOfWeek = firstDay.getDay();
  startDate.setDate(startDate.getDate() - startDayOfWeek);

  const days = [];
  const totalDays = 42;

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    days.push({
      date: new Date(currentDate),
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: currentDate.toDateString() === new Date().toDateString(),
      isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
    });
  }

  return days;
}

export function getCurrentMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const days = [];

  const firstDayOfWeek = firstDay.getDay(); // 0 = Domingo, 1 = Lunes, etc.

  if (firstDayOfWeek > 0) {
    const previousMonth = month === 0 ? 11 : month - 1;
    const previousYear = month === 0 ? year - 1 : year;
    const lastDayOfPreviousMonth = new Date(previousYear, previousMonth + 1, 0);

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = lastDayOfPreviousMonth.getDate() - i;
      const previousDate = new Date(previousYear, previousMonth, day);
      days.push({
        date: new Date(previousDate),
        isCurrentMonth: false,
        isToday: false,
        isWeekend: previousDate.getDay() === 0 || previousDate.getDay() === 6,
      });
    }
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    days.push({
      date: new Date(currentDate),
      isCurrentMonth: true,
      isToday: currentDate.toDateString() === new Date().toDateString(),
      isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
    });
  }

  const lastDayOfWeek = lastDay.getDay(); // 0 = Domingo, 1 = Lunes, etc.
  const daysToAdd = lastDayOfWeek < 6 ? 6 - lastDayOfWeek : 0;

  if (daysToAdd > 0) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let day = 1; day <= daysToAdd; day++) {
      const currentDate = new Date(nextYear, nextMonth, day);
      days.push({
        date: new Date(currentDate),
        isCurrentMonth: false,
        isToday: false,
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
      });
    }
  }

  return days;
}

export function getMonthName(month: number) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month];
}

export function getWeekDays() {
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
}
