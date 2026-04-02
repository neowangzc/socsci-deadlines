import { parseISO, isValid } from 'date-fns';

export const getDeadlineInLocalTime = (deadline: string | undefined, _timezone?: string): Date | null => {
  if (!deadline || deadline === 'TBD') return null;

  try {
    const parsedDate = parseISO(deadline);
    if (!isValid(parsedDate)) return null;
    // Truncate to midnight (00:00:00) of that day
    return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
  } catch {
    return null;
  }
};
