import { Conference, Deadline } from "@/types/conference";
import { getDeadlineInLocalTime } from './dateUtils';
import { isValid, isPast, parseISO, endOfDay } from "date-fns";

function isCfpDeadline(deadline: Deadline): boolean {
  return deadline.type === 'submission';
}

/**
 * Get all deadlines for a conference
 */
export function getAllDeadlines(conference: Conference): Deadline[] {
  const deadlines: Deadline[] = [];

  if (conference.deadlines && conference.deadlines.length > 0) {
    deadlines.push(...conference.deadlines);
  }

  // Sort deadlines by date
  deadlines.sort((a, b) => {
    const aDate = getDeadlineInLocalTime(a.date, a.timezone || conference.timezone);
    const bDate = getDeadlineInLocalTime(b.date, b.timezone || conference.timezone);
    
    if (!aDate || !bDate) return 0;
    return aDate.getTime() - bDate.getTime();
  });
  
  return deadlines;
}

/**
 * Get the next upcoming CFP deadline for a conference.
 * Only submission-type deadlines (paper, abstract, panel, application) count.
 */
export function getNextUpcomingDeadline(conference: Conference): Deadline | null {
  const allDeadlines = getAllDeadlines(conference);

  if (allDeadlines.length === 0) {
    return null;
  }

  // Only CFP deadlines that are still in the future
  const upcomingCfp = allDeadlines.filter(deadline => {
    if (!isCfpDeadline(deadline)) return false;
    const deadlineDate = getDeadlineInLocalTime(deadline.date, deadline.timezone || conference.timezone);
    return deadlineDate && isValid(deadlineDate) && !isPast(deadlineDate);
  });

  if (upcomingCfp.length === 0) {
    return null;
  }

  upcomingCfp.sort((a, b) => {
    const aDate = getDeadlineInLocalTime(a.date, a.timezone || conference.timezone);
    const bDate = getDeadlineInLocalTime(b.date, b.timezone || conference.timezone);

    if (!aDate || !bDate) return 0;
    return aDate.getTime() - bDate.getTime();
  });

  return upcomingCfp[0];
}

/**
 * Get the next upcoming deadline of any type (submission, notification, registration).
 * Used for display on card when all submissions have passed.
 */
export function getNextUpcomingAnyDeadline(conference: Conference): Deadline | null {
  const allDeadlines = getAllDeadlines(conference);
  const upcoming = allDeadlines.filter(deadline => {
    const deadlineDate = getDeadlineInLocalTime(deadline.date, deadline.timezone || conference.timezone);
    return deadlineDate && isValid(deadlineDate) && !isPast(deadlineDate);
  });
  if (upcoming.length === 0) return null;
  upcoming.sort((a, b) => {
    const aDate = getDeadlineInLocalTime(a.date, a.timezone || conference.timezone);
    const bDate = getDeadlineInLocalTime(b.date, b.timezone || conference.timezone);
    if (!aDate || !bDate) return 0;
    return aDate.getTime() - bDate.getTime();
  });
  return upcoming[0];
}

/**
 * Get the primary deadline for sorting purposes (next upcoming CFP or most recent past CFP)
 */
export function getPrimaryDeadline(conference: Conference): Deadline | null {
  const nextDeadline = getNextUpcomingDeadline(conference);

  if (nextDeadline) {
    return nextDeadline;
  }

  // No upcoming CFP deadlines — return the most recent past CFP deadline
  const allDeadlines = getAllDeadlines(conference);

  const pastCfp = allDeadlines.filter(deadline => {
    if (!isCfpDeadline(deadline)) return false;
    const deadlineDate = getDeadlineInLocalTime(deadline.date, deadline.timezone || conference.timezone);
    return deadlineDate && isValid(deadlineDate);
  });

  if (pastCfp.length === 0) {
    return null;
  }

  pastCfp.sort((a, b) => {
    const aDate = getDeadlineInLocalTime(a.date, a.timezone || conference.timezone);
    const bDate = getDeadlineInLocalTime(b.date, b.timezone || conference.timezone);

    if (!aDate || !bDate) return 0;
    return bDate.getTime() - aDate.getTime();
  });

  return pastCfp[0];
}

/**
 * Check if a conference has any upcoming deadlines
 */
export function hasUpcomingDeadlines(conference: Conference): boolean {
  return getNextUpcomingDeadline(conference) !== null;
}

/**
 * Check whether an event is already over.
 * Past events are defined by event dates (end/start), not submission deadlines.
 */
export function hasEventEnded(conference: Conference): boolean {
  const eventEndDate = conference.end ?? conference.start;
  if (!eventEndDate) return false;

  const parsedDate = parseISO(eventEndDate);
  if (!isValid(parsedDate)) return false;

  return isPast(endOfDay(parsedDate));
}

/**
 * Get all upcoming deadlines sorted by date
 */
export function getUpcomingDeadlines(conference: Conference): Deadline[] {
  const allDeadlines = getAllDeadlines(conference);
  
  // Filter out past deadlines and invalid dates
  const upcomingDeadlines = allDeadlines.filter(deadline => {
    const deadlineDate = getDeadlineInLocalTime(deadline.date, deadline.timezone || conference.timezone);
    return deadlineDate && isValid(deadlineDate) && !isPast(deadlineDate);
  });
  
  // Sort by date
  upcomingDeadlines.sort((a, b) => {
    const aDate = getDeadlineInLocalTime(a.date, a.timezone || conference.timezone);
    const bDate = getDeadlineInLocalTime(b.date, b.timezone || conference.timezone);
    
    if (!aDate || !bDate) return 0;
    return aDate.getTime() - bDate.getTime();
  });
  
  return upcomingDeadlines;
}

/**
 * Get the number of days remaining until a deadline
 * Returns null if the deadline date is invalid
 */
export function getDaysRemaining(deadline: Deadline, fallbackTimezone?: string): number | null {
  const deadlineDate = getDeadlineInLocalTime(deadline.date, deadline.timezone || fallbackTimezone);
  if (!deadlineDate || !isValid(deadlineDate)) return null;
  
  const now = new Date();
  const diff = deadlineDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get the color class for a countdown based on days remaining
 */
export function getCountdownColorClass(daysRemaining: number | null): string {
  if (daysRemaining === null) return "text-neutral-600";
  if (daysRemaining <= 0) return "text-neutral-600";
  if (daysRemaining <= 7) return "text-red-600";
  if (daysRemaining <= 30) return "text-orange-600";
  return "text-green-600";
}
