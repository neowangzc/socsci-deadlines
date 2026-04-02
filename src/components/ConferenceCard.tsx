import { CalendarDays, Globe, Tag, Clock, AlarmClock } from "lucide-react";
import { Conference } from "@/types/conference";
import { formatDistanceToNow, isValid, isPast } from "date-fns";
import ConferenceDialog from "./ConferenceDialog";
import { useState } from "react";
import { useTimezone } from "@/utils/timezoneContext";
import { getDeadlineInLocalTime } from '@/utils/dateUtils';
import { getNextUpcomingDeadline, getNextUpcomingAnyDeadline, getPrimaryDeadline } from '@/utils/deadlineUtils';

const EVENT_TYPE_STYLES: Record<string, string> = {
  conference: "bg-purple-100 text-purple-800",
  workshop: "bg-amber-100 text-amber-800",
  summer_school: "bg-emerald-100 text-emerald-800",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  conference: "Conference",
  workshop: "Workshop",
  summer_school: "Summer School",
};

const ConferenceCard = ({
  title,
  full_name,
  year,
  date,
  deadline,
  timezone,
  tags = [],
  link,
  note,
  abstract_deadline,
  city,
  country,
  venue,
  event_type,
  fee,
  funding,
  ...conferenceProps
}: Conference) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { timezone: _tz } = useTimezone(); // subscribe to timezone changes for re-render

  const conference = {
    title, full_name, year, date, deadline, timezone, tags, link, note,
    abstract_deadline, city, country, venue, event_type, fee, funding, ...conferenceProps
  };

  const nextDeadline = getNextUpcomingDeadline(conference) || getPrimaryDeadline(conference);
  const displayDeadline = getNextUpcomingAnyDeadline(conference) || nextDeadline;
  const deadlineDate = nextDeadline ? getDeadlineInLocalTime(nextDeadline.date, nextDeadline.timezone || timezone) : null;

  const getTimeRemaining = () => {
    if (!deadlineDate || !isValid(deadlineDate)) return 'TBD';
    if (isPast(deadlineDate)) return 'Deadline passed';
    try {
      return formatDistanceToNow(deadlineDate, { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
  };

  const timeRemaining = getTimeRemaining();
  const location = [city, country].filter(Boolean).join(", ");

  const getCountdownColor = () => {
    if (!deadlineDate || !isValid(deadlineDate)) return "text-neutral-600";
    try {
      const daysRemaining = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysRemaining <= 7) return "text-red-600";
      if (daysRemaining <= 30) return "text-orange-600";
      return "text-green-600";
    } catch {
      return "text-neutral-600";
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('a') &&
        !(e.target as HTMLElement).closest('.tag-button')) {
      setDialogOpen(true);
    }
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    const searchParams = new URLSearchParams(window.location.search);
    const currentTags = searchParams.get('tags')?.split(',') || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    if (newTags.length > 0) {
      searchParams.set('tags', newTags.join(','));
    } else {
      searchParams.delete('tags');
    }
    const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    window.history.pushState({}, '', newUrl);
    window.dispatchEvent(new CustomEvent('urlchange', { detail: { tag } }));
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-primary">
              {title} {year}
            </h3>
            {event_type && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${EVENT_TYPE_STYLES[event_type] || 'bg-gray-100 text-gray-700'}`}>
                {EVENT_TYPE_LABELS[event_type] || event_type}
              </span>
            )}
          </div>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
            </a>
          )}
        </div>

        <div className="flex flex-col gap-2 mb-3">
          <div className="flex items-center text-neutral">
            <CalendarDays className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm truncate">{date}</span>
          </div>
          {location && (
            <div className="flex items-center text-neutral">
              <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm truncate">{location}</span>
            </div>
          )}
          <div className="flex items-center text-neutral">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm truncate">
              {displayDeadline ? `${displayDeadline.label}: ${displayDeadline.date}` : 'TBD'}
            </span>
          </div>
          <div className="flex items-center">
            <AlarmClock className={`h-4 w-4 mr-2 flex-shrink-0 ${getCountdownColor()}`} />
            <span className={`text-sm font-medium truncate ${getCountdownColor()}`}>
              {timeRemaining}
            </span>
          </div>
        </div>

        {Array.isArray(tags) && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                className="tag tag-button"
                onClick={(e) => handleTagClick(e, tag)}
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <ConferenceDialog
        conference={conference}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};

export default ConferenceCard;
