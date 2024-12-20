export function getWeekDays(): string[] {
    const startDate = new Date();
    const days: string[] = [];
    // Assuming Monday-Saturday
    for (let i = 1; i <= 6; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + (i - startDate.getDay()));
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  }
  
  export function getISOWeekNumber(date: Date): number {
    const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = tempDate.getUTCDay() || 7;
    tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(),0,1));
    return Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  }
  