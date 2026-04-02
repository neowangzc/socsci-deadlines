import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

const GITHUB_REPO = "neowangzc/socsci-deadlines";

const DISCIPLINES = [
  { value: "multidisciplinary", label: "Multidisciplinary" },
  { value: "sociology", label: "Sociology" },
  { value: "political-science", label: "Political Science" },
  { value: "economics", label: "Economics" },
  { value: "psychology", label: "Psychology" },
  { value: "linguistics", label: "Linguistics" },
  { value: "communication", label: "Communication" },
  { value: "education", label: "Education" },
  { value: "computational-social-science", label: "Computational Social Science" },
];

const EVENT_TYPES = [
  { value: "conference", label: "Conference" },
  { value: "workshop", label: "Workshop" },
  { value: "summer_school", label: "Summer School" },
];

const DEADLINE_TYPES = [
  { value: "paper", label: "Paper submission deadline" },
  { value: "panel", label: "Panel proposal deadline" },
  { value: "application", label: "Application deadline" },
  { value: "notification", label: "Acceptance notification" },
];

const TIMEZONES = [
  { value: "AoE", label: "AoE (Anywhere on Earth)" },
  { value: "UTC-12", label: "UTC-12" },
  { value: "UTC-11", label: "UTC-11 (Samoa)" },
  { value: "UTC-10", label: "UTC-10 (Hawaii)" },
  { value: "UTC-9", label: "UTC-9 (Alaska)" },
  { value: "UTC-8", label: "UTC-8 (Pacific)" },
  { value: "UTC-7", label: "UTC-7 (Mountain)" },
  { value: "UTC-6", label: "UTC-6 (Central US/Mexico)" },
  { value: "UTC-5", label: "UTC-5 (Eastern US/Colombia)" },
  { value: "UTC-4", label: "UTC-4 (Atlantic/Chile)" },
  { value: "UTC-3", label: "UTC-3 (Brazil/Argentina)" },
  { value: "UTC-2", label: "UTC-2" },
  { value: "UTC-1", label: "UTC-1 (Azores)" },
  { value: "UTC", label: "UTC" },
  { value: "UTC+1", label: "UTC+1 (Central Europe)" },
  { value: "UTC+2", label: "UTC+2 (Eastern Europe/Israel)" },
  { value: "UTC+3", label: "UTC+3 (Moscow/Turkey)" },
  { value: "UTC+4", label: "UTC+4 (Gulf/Georgia)" },
  { value: "UTC+5", label: "UTC+5 (Pakistan)" },
  { value: "UTC+5:30", label: "UTC+5:30 (India)" },
  { value: "UTC+6", label: "UTC+6 (Bangladesh)" },
  { value: "UTC+7", label: "UTC+7 (Thailand/Vietnam)" },
  { value: "UTC+8", label: "UTC+8 (China/Singapore)" },
  { value: "UTC+9", label: "UTC+9 (Japan/Korea)" },
  { value: "UTC+10", label: "UTC+10 (Australia East)" },
  { value: "UTC+11", label: "UTC+11" },
  { value: "UTC+12", label: "UTC+12 (New Zealand)" },
  { value: "UTC+13", label: "UTC+13 (Tonga)" },
];

interface DeadlineEntry {
  label: string;
  date: string;
  time: string;
  timezone: string;
}

interface SubmitEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubmitEventDialog = ({ open, onOpenChange }: SubmitEventDialogProps) => {
  const [form, setForm] = useState({
    title: "",
    fullName: "",
    year: new Date().getFullYear() + 1,
    eventType: "conference",
    discipline: "",
    website: "",
    venue: "",
    city: "",
    country: "",
    startDate: "",
    endDate: "",
    fee: "",
    funding: "",
    note: "",
  });

  const [deadlines, setDeadlines] = useState<DeadlineEntry[]>([
    { label: "Paper submission deadline", date: "", time: "23:59", timezone: "AoE" },
  ]);

  const update = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateDeadline = (index: number, field: keyof DeadlineEntry, value: string) => {
    setDeadlines(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d));
  };

  const addDeadline = () => {
    setDeadlines(prev => [...prev, { label: "", date: "", time: "23:59", timezone: "AoE" }]);
  };

  const removeDeadline = (index: number) => {
    if (deadlines.length > 1) {
      setDeadlines(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    const title = `[New Event] ${form.title} ${form.year}`;

    const deadlineRows = deadlines
      .filter(d => d.date)
      .map(d => {
        let label = d.label;
        if (label.startsWith("__other__:")) label = label.slice(10);
        if (label === "__other__" || !label) label = "TBD";
        const timeStr = d.time || "23:59";
        return `| ${label} | ${d.date} ${timeStr} | ${d.timezone || 'AoE'} |`;
      })
      .join('\n');

    const body = `## Event Information

| Field | Value |
|-------|-------|
| **Name (abbreviation)** | ${form.title} |
| **Full Name** | ${form.fullName} |
| **Year** | ${form.year} |
| **Type** | ${form.eventType} |
| **Discipline** | ${form.discipline} |
| **Website** | ${form.website} |
| **Venue** | ${form.venue || 'N/A'} |
| **City** | ${form.city} |
| **Country** | ${form.country} |
| **Start Date** | ${form.startDate} |
| **End Date** | ${form.endDate} |
| **Fee** | ${form.fee || 'N/A'} |
| **Funding / Scholarships** | ${form.funding || 'N/A'} |

## Deadlines

| Label | Date & Time | Timezone |
|-------|-------------|----------|
${deadlineRows}

${form.note ? `### Additional Notes\n${form.note}` : ''}

---
*Submitted via Social Science Deadlines web form*`;

    const url = `https://github.com/${GITHUB_REPO}/issues/new?` +
      `title=${encodeURIComponent(title)}&` +
      `body=${encodeURIComponent(body)}&` +
      `labels=${encodeURIComponent('new-event')}`;

    window.open(url, '_blank');
    onOpenChange(false);
  };

  const hasValidDeadline = deadlines.some(d => d.date);
  const isValid = form.title && form.fullName && form.discipline && hasValidDeadline;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-purple-600">
            Submit a New Event
          </DialogTitle>
          <DialogDescription>
            Fill out the form below. It will open a GitHub Issue with the details pre-filled — you just need to click "Submit" on GitHub.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Row 1: Title + Year */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="title">Abbreviation *</Label>
              <Input
                id="title"
                placeholder="e.g. ASA, SICSS"
                value={form.title}
                onChange={e => update("title", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                value={form.year}
                onChange={e => update("year", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Full name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="e.g. American Sociological Association Annual Meeting"
              value={form.fullName}
              onChange={e => update("fullName", e.target.value)}
            />
          </div>

          {/* Row 2: Event type + Discipline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Event Type *</Label>
              <Select value={form.eventType} onValueChange={v => update("eventType", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {EVENT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Discipline *</Label>
              <Select value={form.discipline} onValueChange={v => update("discipline", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {DISCIPLINES.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              placeholder="https://..."
              value={form.website}
              onChange={e => update("website", e.target.value)}
            />
          </div>

          {/* Deadlines - dynamic list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Deadlines *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700 gap-1 h-7"
                onClick={addDeadline}
              >
                <Plus className="h-3.5 w-3.5" />
                Add deadline
              </Button>
            </div>
            {deadlines.map((dl, index) => (
              <div key={index} className="rounded-md border border-neutral-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500">Deadline {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-neutral-400 hover:text-red-500"
                    onClick={() => removeDeadline(index)}
                    disabled={deadlines.length <= 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {/* Label */}
                <Select
                  value={dl.label.startsWith("__other__") || (!DEADLINE_TYPES.some(t => t.label === dl.label) && dl.label !== "") ? "__other__" : dl.label}
                  onValueChange={v => {
                    if (v === "__other__") {
                      updateDeadline(index, "label", "__other__");
                    } else {
                      updateDeadline(index, "label", v);
                    }
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {DEADLINE_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.label}>{t.label}</SelectItem>
                    ))}
                    <SelectItem value="__other__">Other (custom)</SelectItem>
                  </SelectContent>
                </Select>
                {(dl.label === "__other__" || dl.label.startsWith("__other__:")) && (
                  <Input
                    placeholder="Enter custom label..."
                    className="h-8 text-sm"
                    value={dl.label.startsWith("__other__:") ? dl.label.slice(10) : ""}
                    onChange={e => updateDeadline(index, "label", `__other__:${e.target.value}`)}
                  />
                )}
                {/* Date + Time + Timezone */}
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="date"
                    className="h-9"
                    value={dl.date}
                    onChange={e => updateDeadline(index, "date", e.target.value)}
                  />
                  <Input
                    type="time"
                    className="h-9"
                    value={dl.time}
                    onChange={e => updateDeadline(index, "time", e.target.value)}
                  />
                  <Select
                    value={dl.timezone}
                    onValueChange={v => updateDeadline(index, "timezone", v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {TIMEZONES.map(tz => (
                        <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              placeholder="e.g. Tohoku University"
              value={form.venue}
              onChange={e => update("venue", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g. Sendai"
                value={form.city}
                onChange={e => update("city", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="e.g. Japan"
                value={form.country}
                onChange={e => update("country", e.target.value)}
              />
            </div>
          </div>

          {/* Event dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={e => update("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={e => update("endDate", e.target.value)}
              />
            </div>
          </div>

          {/* Fee + Funding */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fee">Registration Fee</Label>
              <Input
                id="fee"
                placeholder="e.g. $300 / €200 student"
                value={form.fee}
                onChange={e => update("fee", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="funding">Funding / Scholarships</Label>
              <Input
                id="funding"
                placeholder="e.g. Travel grants available"
                value={form.funding}
                onChange={e => update("funding", e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="note">Additional Notes</Label>
            <Textarea
              id="note"
              placeholder="Any other relevant info..."
              value={form.note}
              onChange={e => update("note", e.target.value)}
              rows={2}
            />
          </div>

          {/* Submit */}
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={!isValid}
            onClick={handleSubmit}
          >
            Submit via GitHub Issue
          </Button>
          <p className="text-xs text-neutral-500 text-center">
            This will open GitHub in a new tab with the form data pre-filled. You need a GitHub account to submit.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitEventDialog;
