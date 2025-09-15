// Helpers para calcular días del mes, etc.
export function getDaysInMonth(year: number, month: number) {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

// Generar calendario completo con días de meses anteriores y siguientes
export function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);

  // Ajustar al inicio de la semana (domingo = 0)
  const startDayOfWeek = firstDay.getDay();
  startDate.setDate(startDate.getDate() - startDayOfWeek);

  const days = [];
  const totalDays = 42; // 6 semanas * 7 días

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

// Generar calendario con exactamente 1 día anterior y 2 días posterior
export function getCurrentMonthDays(year: number, month: number) {
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const days = [];

  // Agregar exactamente 1 día del mes anterior
  const previousMonth = month === 0 ? 11 : month - 1;
  const previousYear = month === 0 ? year - 1 : year;
  const lastDayOfPreviousMonth = new Date(previousYear, previousMonth + 1, 0);
  const previousDay = lastDayOfPreviousMonth.getDate();

  const previousDate = new Date(previousYear, previousMonth, previousDay);
  days.push({
    date: new Date(previousDate),
    isCurrentMonth: false,
    isToday: false,
    isWeekend: previousDate.getDay() === 0 || previousDate.getDay() === 6,
  });

  // Agregar todos los días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    days.push({
      date: new Date(currentDate),
      isCurrentMonth: true,
      isToday: currentDate.toDateString() === new Date().toDateString(),
      isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
    });
  }

  // Agregar exactamente 2 días del mes siguiente
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  for (let day = 1; day <= 2; day++) {
    const currentDate = new Date(nextYear, nextMonth, day);
    days.push({
      date: new Date(currentDate),
      isCurrentMonth: false,
      isToday: false,
      isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
    });
  }

  return days;
}

// Obtener nombre del mes
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

// Obtener nombres de días de la semana
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
