import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CalendarDays, Globe, Tag, Clock, AlarmClock, CalendarPlus } from "lucide-react";
import { Conference } from "@/types/conference";
import { formatDistanceToNow, parseISO, isValid, format, parse, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { getDeadlineInLocalTime } from '@/utils/dateUtils';
import { getAllDeadlines, getNextUpcomingDeadline, getUpcomingDeadlines, getDaysRemaining, getCountdownColorClass } from '@/utils/deadlineUtils';
import { useTimezone } from "@/utils/timezoneContext";

interface ConferenceDialogProps {
  conference: Conference;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ConferenceDialog = ({ conference, open, onOpenChange }: ConferenceDialogProps) => {
  const { timezone: _tz } = useTimezone(); // subscribe to timezone changes for re-render

  const allDeadlines = getAllDeadlines(conference);
  const nextDeadline = getNextUpcomingDeadline(conference);
  const deadlineDate = nextDeadline ? getDeadlineInLocalTime(nextDeadline.date, nextDeadline.timezone || conference.timezone) : null;
  
  const [countdown, setCountdown] = useState<string>('');

  // Replace the current location string creation with this more verbose version
  const getLocationString = () => {
    console.log('Venue:', conference.venue);
    console.log('City:', conference.city);
    console.log('Country:', conference.country);

    if (conference.venue) {
      return conference.venue;
    }

    const cityCountryArray = [conference.city, conference.country].filter(Boolean);
    console.log('City/Country array after filter:', cityCountryArray);
    
    const cityCountryString = cityCountryArray.join(", ");
    console.log('Final location string:', cityCountryString);

    return cityCountryString || "Location TBD"; // Fallback if everything is empty
  };

  // Use the function result
  const location = getLocationString();

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!deadlineDate || !isValid(deadlineDate)) {
        // Check if there were any submission deadlines at all
        const hasAnySubmission = allDeadlines.some(d => d.type === 'submission');
        setCountdown(hasAnySubmission ? 'Deadline passed' : 'TBD');
        return;
      }

      const now = new Date();
      const difference = deadlineDate.getTime() - now.getTime();

      if (difference <= 0) {
        setCountdown('Deadline passed');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [deadlineDate]);

  const getCountdownColor = () => {
    if (!deadlineDate || !isValid(deadlineDate)) {
      const hasAnySubmission = allDeadlines.some(d => d.type === 'submission');
      return hasAnySubmission ? "text-red-600" : "text-neutral-600";
    }
    const daysRemaining = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysRemaining <= 7) return "text-red-600";
    if (daysRemaining <= 30) return "text-orange-600";
    return "text-green-600";
  };

  const parseDateFromString = (dateStr: string) => {
    try {
      // Handle formats like "October 19-25, 2025" or "Sept 9-12, 2025"
      const [monthDay, year] = dateStr.split(", ");
      const [month, dayRange] = monthDay.split(" ");
      const [startDay] = dayRange.split("-");
      
      // Construct a date string in a format that can be parsed
      const dateString = `${month} ${startDay} ${year}`;
      const date = parse(dateString, 'MMMM d yyyy', new Date());
      
      if (!isValid(date)) {
        // Try alternative format for abbreviated months
        return parse(dateString, 'MMM d yyyy', new Date());
      }
      
      return date;
    } catch (error) {
      console.error("Error parsing date:", error);
      return new Date();
    }
  };

  const createCalendarEvent = (type: 'google' | 'apple') => {
    try {
      // Only add the next upcoming submission deadline to calendar
      if (!nextDeadline) {
        throw new Error('No upcoming submission deadline');
      }
      const targetDeadline = nextDeadline;

      const calDeadlineDate = getDeadlineInLocalTime(targetDeadline.date, targetDeadline.timezone || conference.timezone);
      if (!calDeadlineDate || !isValid(calDeadlineDate)) {
        throw new Error('Invalid deadline date');
      }

      const endDate = new Date(calDeadlineDate.getTime() + (60 * 60 * 1000));

      const formatDateForGoogle = (date: Date) => format(date, "yyyyMMdd'T'HHmmss'Z'");
      const formatDateForApple = (date: Date) => format(date, "yyyyMMdd'T'HHmmss'Z'");

      const title = encodeURIComponent(`${conference.title} ${conference.year} - ${targetDeadline.label}`);
      const locationStr = encodeURIComponent(location);
      const description = encodeURIComponent(
        `${targetDeadline.label} for ${conference.full_name || conference.title}\n` +
        `Dates: ${conference.date}\n` +
        `Location: ${location}\n` +
        (conference.link ? `Website: ${conference.link}` : '')
      );

      if (type === 'google') {
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
          `&text=${title}` +
          `&dates=${formatDateForGoogle(calDeadlineDate)}/${formatDateForGoogle(endDate)}` +
          `&details=${description}` +
          `&location=${locationStr}` +
          `&sprop=website:${encodeURIComponent(conference.link || '')}`;
        window.open(url, '_blank');
      } else {
        const url = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${conference.link || ''}
DTSTART:${formatDateForApple(calDeadlineDate)}
DTEND:${formatDateForApple(endDate)}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${conference.title.toLowerCase().replace(/\s+/g, '-')}-deadline.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error creating calendar event:", error);
      alert("Sorry, there was an error creating the calendar event. Please try again.");
    }
  };

  const generateGoogleMapsUrl = (venue: string | undefined, place: string): string => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue || place)}`;
  };

  const formatDeadlineDisplay = () => {
    if (!deadlineDate || !isValid(deadlineDate)) return null;
    return (
      <div className="text-sm text-neutral-500">
        {format(deadlineDate, "MMMM d, yyyy 'at' HH:mm:ss")}
      </div>
    );
  };

  // Add these new functions to handle consistent date conversion
  const getLocalDeadline = (dateString: string | undefined) => {
    if (!dateString || dateString === 'TBD') return null;
    return getDeadlineInLocalTime(dateString, conference.timezone);
  };

  // Format any deadline date consistently
  const formatDeadlineDate = (dateString: string | undefined) => {
    if (!dateString || dateString === 'TBD') return dateString || 'TBD';
    
    const localDate = getLocalDeadline(dateString);
    if (!localDate || !isValid(localDate)) return dateString;
    
    return format(localDate, "MMMM d, yyyy");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-lg w-full"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-600">
            {conference.title} {conference.year}
            {conference.event_type && (
              <span className={`ml-2 text-sm font-medium px-2 py-0.5 rounded-full ${
                conference.event_type === 'conference' ? 'bg-purple-100 text-purple-800' :
                conference.event_type === 'workshop' ? 'bg-amber-100 text-amber-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                {conference.event_type === 'summer_school' ? 'Summer School' :
                 conference.event_type.charAt(0).toUpperCase() + conference.event_type.slice(1)}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-base text-gray-700">
            {conference.full_name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <CalendarDays className="h-5 w-5 mt-0.5 text-gray-500" />
              <div>
                <p className="font-medium">Dates</p>
                <p className="text-sm text-gray-500">{conference.date}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Globe className="h-5 w-5 mt-0.5 text-gray-500" />
              <div>
                <p className="font-medium">Venue</p>
                <p className="text-sm text-gray-500">
                  {conference.venue || [conference.city, conference.country].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 mt-0.5 text-gray-500" />
              <div className="space-y-2 flex-1">
                <p className="font-medium">Important Deadlines</p>
                <div className="text-sm text-gray-500 space-y-2">
                  {allDeadlines.length > 0 ? (
                    allDeadlines.map((deadline, index) => {
                      const daysRemaining = getDaysRemaining(deadline, conference.timezone);
                      const isPast = daysRemaining !== null && daysRemaining <= 0;
                      const isNext = nextDeadline && deadline.date === nextDeadline.date && deadline.type === nextDeadline.type;
                      const daysColorClass = isPast ? "text-neutral-400" : getCountdownColorClass(daysRemaining);
                      return (
                        <div
                          key={`${deadline.type}-${index}`}
                          className={`rounded-md p-2 ${isNext ? 'bg-purple-50 border border-purple-200' : isPast ? 'bg-gray-50 opacity-60' : 'bg-gray-100'}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className={`flex-1 ${isNext ? 'font-medium text-purple-800' : isPast ? 'line-through text-gray-400' : ''}`}>
                              {deadline.label}: {formatDeadlineDate(deadline.date)}
                              {isNext && <span className="ml-2 text-xs">(Next)</span>}
                            </p>
                            {daysRemaining !== null && (
                              <span className={`text-xs font-medium whitespace-nowrap ${daysColorClass}`}>
                                {daysRemaining > 0
                                  ? `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`
                                  : 'Passed'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-gray-100 rounded-md p-2">
                      <p>No deadlines listed</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <AlarmClock className={`h-5 w-5 mr-3 flex-shrink-0 ${getCountdownColor()}`} />
            <div>
              <span className={`font-medium ${getCountdownColor()}`}>
                {countdown}
              </span>
              {formatDeadlineDisplay()}
            </div>
          </div>

          {conference.fee && (
            <div className="flex items-start gap-2">
              <span className="text-lg mt-0.5">💰</span>
              <div>
                <p className="font-medium">Fee</p>
                <p className="text-sm text-gray-500">{conference.fee}</p>
              </div>
            </div>
          )}

          {conference.funding && (
            <div className="flex items-start gap-2">
              <span className="text-lg mt-0.5">🎓</span>
              <div>
                <p className="font-medium">Funding / Scholarships</p>
                <p className="text-sm text-emerald-600">{conference.funding}</p>
              </div>
            </div>
          )}

          {Array.isArray(conference.tags) && conference.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {conference.tags.map((tag) => (
                <span key={tag} className="tag">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {conference.note && (
            <div 
              className="text-sm text-neutral-600 mt-2 p-3 bg-neutral-50 rounded-lg"
              dangerouslySetInnerHTML={{ 
                __html: conference.note.replace(
                  /<a(.*?)>/g, 
                  '<a$1 style="color: #3b82f6; font-weight: 500; text-decoration: underline; text-underline-offset: 2px;">'
                ) 
              }}
            />
          )}

          <div className="flex items-center justify-between pt-2">
            {conference.link && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-base text-primary hover:underline p-0"
                asChild
              >
                <a
                  href={conference.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit website
                </a>
              </Button>
            )}
            
            {nextDeadline && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm focus-visible:ring-0 focus:outline-none"
                  >
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Add to Calendar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white" align="end">
                  <DropdownMenuItem
                    className="text-neutral-800 hover:bg-neutral-100"
                    onClick={() => createCalendarEvent('google')}
                  >
                    Add to Google Calendar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-neutral-800 hover:bg-neutral-100"
                    onClick={() => createCalendarEvent('apple')}
                  >
                    Add to Apple Calendar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConferenceDialog;
