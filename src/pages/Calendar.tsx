import { useState } from "react";
import conferencesData from "@/utils/conferenceLoader";
import { Conference } from "@/types/conference";
import { Tag, X, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { parseISO, format, isValid, isSameDay } from "date-fns";

// Compare dates by YYYY-MM-DD only, ignoring time
function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function dateInRange(date: Date, start: Date, end: Date): boolean {
  const d = toDateStr(date), s = toDateStr(start), e = toDateStr(end);
  return d >= s && d <= e;
}
import Header from "@/components/Header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const categoryColors: Record<string, string> = {
  "sociology": "bg-purple-500",
  "political-science": "bg-blue-500",
  "economics": "bg-green-500",
  "psychology": "bg-orange-500",
  "linguistics": "bg-teal-500",
  "communication": "bg-pink-500",
  "education": "bg-amber-500",
  "computational-social-science": "bg-cyan-500",
  "multidisciplinary": "bg-gray-500",
};

const categoryNames: Record<string, string> = {
  "sociology": "Sociology",
  "political-science": "Political Science",
  "economics": "Economics",
  "psychology": "Psychology",
  "linguistics": "Linguistics",
  "communication": "Communication",
  "education": "Education",
  "computational-social-science": "Computational Social Science",
  "multidisciplinary": "Multidisciplinary",
};

const orderedCategories = [
  "sociology",
  "political-science",
  "economics",
  "psychology",
  "linguistics",
  "communication",
  "education",
  "computational-social-science",
  "multidisciplinary",
] as const;

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isYearView, setIsYearView] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: Date | null, events: { deadlines: Conference[], conferences: Conference[] } }>({
    date: null,
    events: { deadlines: [], conferences: [] }
  });
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(orderedCategories)
  );
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const safeParseISO = (dateString: string | undefined | number | Date): Date | null => {
    if (!dateString) return null;
    if (dateString === 'TBD') return null;
    try {
      // Vite YAML plugin may parse dates as Date objects
      if (dateString instanceof Date) {
        // Re-create in local timezone using date components
        return new Date(dateString.getUTCFullYear(), dateString.getUTCMonth(), dateString.getUTCDate());
      }
      const dateStr = typeof dateString === 'number' ? dateString.toString() : String(dateString);
      // Extract YYYY-MM-DD part (ignore time)
      const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (match) {
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      }
      const parsedDate = parseISO(dateStr);
      return isValid(parsedDate) ? parsedDate : null;
    } catch {
      return null;
    }
  };

  const getDayEvents = (date: Date) => {
    const conferences = selectedCategories.size > 0 ? conferencesData.filter((conf: Conference) => {
      const startDate = safeParseISO(conf.start);
      const endDate = safeParseISO(conf.end);
      const matchesCategory = Array.isArray(conf.tags) &&
        conf.tags.some(tag => selectedCategories.has(tag));

      if (!matchesCategory) return false;

      if (startDate && endDate) {
        return dateInRange(date, startDate, endDate);
      } else if (startDate) {
        return isSameDay(startDate, date);
      }
      return false;
    }) : [];

    const filterBySearch = (list: Conference[]) => list.filter(conf =>
      searchQuery === "" ||
      conf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conf.full_name && conf.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return {
      deadlines: [] as Conference[],
      conferences: filterBySearch(conferences)
    };
  };

  const renderEventPreview = (events: { deadlines: Conference[], conferences: Conference[] }) => {
    if (events.deadlines.length === 0 && events.conferences.length === 0) return null;
    return (
      <div className="p-2 max-w-[200px]">
        {events.deadlines.length > 0 && (
          <div className="mb-2">
            <p className="font-semibold text-red-500">Deadlines:</p>
            {events.deadlines.map(conf => (
              <div key={conf.id} className="text-sm">{conf.title} {conf.year}</div>
            ))}
          </div>
        )}
        {events.conferences.length > 0 && (
          <div>
            <p className="font-semibold text-purple-600">Events:</p>
            {events.conferences.map(conf => (
              <div key={conf.id} className="text-sm">{conf.title} {conf.year}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getConferenceLineStyle = (date: Date) => {
    if (selectedCategories.size === 0) return [];

    return conferencesData
      .filter((conf: Conference) => {
        const startDate = safeParseISO(conf.start);
        const endDate = safeParseISO(conf.end);
        const matchesCategory = selectedCategories.size > 0 &&
          (Array.isArray(conf.tags) && conf.tags.some(tag => selectedCategories.has(tag)));
        return startDate && endDate && dateInRange(date, startDate, endDate) && matchesCategory;
      })
      .map((conf: Conference) => {
        const startDate = safeParseISO(conf.start);
        const endDate = safeParseISO(conf.end);
        if (!startDate || !endDate) return null;

        let style = "w-[calc(100%+1rem)] -left-2 relative";
        if (toDateStr(date) === toDateStr(startDate)) style += " rounded-l-sm";
        if (toDateStr(date) === toDateStr(endDate)) style += " rounded-r-sm";

        const tag = conf.tags && conf.tags[0] ? conf.tags[0] : "multidisciplinary";
        const color = categoryColors[tag] || "bg-gray-500";

        return { style, color };
      })
      .filter(Boolean) as { style: string; color: string }[];
  };

  const renderDayContent = (date: Date) => {
    const dayEvents = getDayEvents(date);
    const hasEvents = dayEvents.deadlines.length > 0 || dayEvents.conferences.length > 0;
    const conferenceStyles = getConferenceLineStyle(date);

    const handleDayClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedDayEvents({ date, events: dayEvents });
    };

    return (
      <div className="relative w-full h-full flex flex-col" onClick={handleDayClick}>
        <div className="h-10 flex items-center justify-center">
          <span>{format(date, 'd')}</span>
        </div>
        <div className="absolute bottom-2 left-0 right-0 flex flex-col-reverse gap-[1px]">
          {conferenceStyles.map((style, index) => (
            <div key={`conf-${index}`} className={`h-[2px] ${style.style} ${style.color}`} />
          ))}
        </div>
        {hasEvents && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="absolute inset-0" />
              <TooltipContent>
                {renderEventPreview(dayEvents)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  const renderEventDetails = (conf: Conference) => {
    const startDate = safeParseISO(conf.start);
    const endDate = safeParseISO(conf.end);
    const location = [conf.city, conf.country].filter(Boolean).join(", ");

    return (
      <div className="border-b last:border-b-0 pb-4 last:pb-0 mb-4 last:mb-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-neutral-900">{conf.title} {conf.year}</h3>
            {conf.full_name && (
              <p className="text-sm text-neutral-600 mb-2">{conf.full_name}</p>
            )}
          </div>
          {conf.link && (
            <a href={conf.link} target="_blank" rel="noopener noreferrer"
              className="text-purple-500 hover:text-purple-600 text-sm">
              Website &rarr;
            </a>
          )}
        </div>
        <div className="space-y-2 mt-3">
          {startDate && (
            <div className="flex items-start gap-2">
              <span className="font-medium text-sm">Date:</span>
              <span className="text-sm">
                {format(startDate, 'MMMM d')}
                {endDate ? ` - ${format(endDate, 'MMMM d, yyyy')}` : `, ${format(startDate, 'yyyy')}`}
              </span>
            </div>
          )}
          {location && (
            <div className="flex items-start gap-2">
              <span className="font-medium text-sm">Location:</span>
              <span className="text-sm">{conf.venue || location}</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.isArray(conf.tags) && conf.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-100">
              <Tag className="h-3 w-3 mr-1" />
              {categoryNames[tag] || tag}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const categories = orderedCategories
    .filter(category => conferencesData.some((conf: Conference) => conf.tags?.includes(category)))
    .map(category => [category, categoryColors[category]]);

  const renderLegend = () => (
    <div className="flex flex-wrap gap-3 justify-center items-center mb-4">
      {categories.map(([tag, color]) => (
        <TooltipProvider key={tag}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  const next = new Set(selectedCategories);
                  if (next.has(tag)) next.delete(tag); else next.add(tag);
                  setSelectedCategories(next);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 transition-all cursor-pointer ${selectedCategories.has(tag) ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
              >
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-sm">{categoryNames[tag] || tag}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent><p>Toggle {categoryNames[tag] || tag}</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}

      {selectedCategories.size < orderedCategories.length && (
        <button onClick={() => setSelectedCategories(new Set(orderedCategories))}
          className="text-sm text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg border border-green-200 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Select All
        </button>
      )}
      {selectedCategories.size > 0 && (
        <button onClick={() => setSelectedCategories(new Set())}
          className="text-sm text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 flex items-center gap-2">
          <X className="h-4 w-4" /> Deselect All
        </button>
      )}
    </div>
  );

  const renderViewToggle = () => (
    <div className="flex flex-col items-center gap-4 mb-6">
      <div className="bg-neutral-100 rounded-lg p-1 inline-flex">
        <button onClick={() => setIsYearView(false)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!isYearView ? 'bg-white shadow-sm text-purple-600' : 'text-neutral-600 hover:text-neutral-900'}`}>
          Month View
        </button>
        <button onClick={() => setIsYearView(true)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isYearView ? 'bg-white shadow-sm text-purple-600' : 'text-neutral-600 hover:text-neutral-900'}`}>
          Year View
        </button>
      </div>
      {isYearView && (
        <div className="flex items-center gap-4">
          <button onClick={() => { setCurrentYear(currentYear - 1); setSelectedDate(new Date(currentYear - 1, 0, 1)); }}
            className="p-2 hover:bg-neutral-100 rounded-full" aria-label="Previous year">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="text-lg font-semibold">{currentYear}</span>
          <button onClick={() => { setCurrentYear(currentYear + 1); setSelectedDate(new Date(currentYear + 1, 0, 1)); }}
            className="p-2 hover:bg-neutral-100 rounded-full" aria-label="Next year">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header onSearch={setSearchQuery} />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {renderViewToggle()}
          {renderLegend()}
          <div className="grid grid-cols-1 gap-8">
            <div className="mx-auto w-full max-w-4xl">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                numberOfMonths={isYearView ? 12 : 1}
                showOutsideDays={false}
                defaultMonth={new Date(currentYear, 0)}
                month={isYearView ? new Date(currentYear, 0) : currentMonth}
                onMonthChange={(m) => { setCurrentMonth(m); setSelectedDate(m); }}
                fromMonth={isYearView ? new Date(currentYear, 0) : undefined}
                toMonth={isYearView ? new Date(currentYear, 11) : undefined}
                className="bg-white rounded-lg p-6 shadow-sm mx-auto w-full"
                components={{
                  Day: ({ date, displayMonth, ...props }) => {
                    if (date.getMonth() !== displayMonth.getMonth()) return null;
                    return (
                      <div role="button" tabIndex={0} {...props} className="w-full h-full p-2 cursor-pointer">
                        {renderDayContent(date)}
                      </div>
                    );
                  },
                }}
                classNames={{
                  months: `grid ${isYearView ? 'grid-cols-3 gap-4' : ''} justify-center`,
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center mb-4",
                  caption_label: "text-lg font-semibold",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-16 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 hover:bg-neutral-50",
                  day: "h-16 w-10 p-0 font-normal hover:bg-neutral-100 rounded-lg transition-colors",
                  day_today: "bg-neutral-100 text-purple-600 font-semibold",
                  day_outside: "hidden",
                  nav: "space-x-1 flex items-center",
                  nav_button: isYearView ? "hidden" : "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1"
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={selectedDayEvents.date !== null}
        onOpenChange={() => setSelectedDayEvents({ date: null, events: { deadlines: [], conferences: [] } })}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="dialog-description">
          <DialogHeader>
            <DialogTitle>
              Events for {selectedDayEvents.date ? format(selectedDayEvents.date, 'MMMM d, yyyy') : ''}
            </DialogTitle>
            <div id="dialog-description" className="text-sm text-neutral-600">
              Conference details and deadlines for this date.
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDayEvents.events.deadlines.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-red-500 mb-3">Submission Deadlines</h3>
                <div className="space-y-4">
                  {selectedDayEvents.events.deadlines.map(conf => (
                    <div key={conf.id}>{renderEventDetails(conf)}</div>
                  ))}
                </div>
              </div>
            )}
            {selectedDayEvents.events.conferences.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-purple-600 mb-3">Events</h3>
                <div className="space-y-4">
                  {selectedDayEvents.events.conferences.map(conf => (
                    <div key={conf.id}>{renderEventDetails(conf)}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
