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

const GITHUB_REPO = "neowangzc/socsci-deadlines";

const DISCIPLINES = [
  { value: "sociology", label: "Sociology" },
  { value: "political-science", label: "Political Science" },
  { value: "economics", label: "Economics" },
  { value: "psychology", label: "Psychology" },
  { value: "linguistics", label: "Linguistics" },
  { value: "communication", label: "Communication" },
  { value: "anthropology", label: "Anthropology" },
  { value: "education", label: "Education" },
  { value: "geography", label: "Geography" },
  { value: "computational-social-science", label: "Computational Social Science" },
  { value: "digital-humanities", label: "Digital Humanities" },
  { value: "multidisciplinary", label: "Multidisciplinary" },
];

const EVENT_TYPES = [
  { value: "conference", label: "Conference" },
  { value: "workshop", label: "Workshop" },
  { value: "summer_school", label: "Summer School" },
];

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
    deadlineDate: "",
    deadlineLabel: "Paper submission deadline",
    city: "",
    country: "",
    eventDates: "",
    fee: "",
    funding: "",
    note: "",
  });

  const update = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const title = `[New Event] ${form.title} ${form.year}`;

    const body = `## Event Information

| Field | Value |
|-------|-------|
| **Name (abbreviation)** | ${form.title} |
| **Full Name** | ${form.fullName} |
| **Year** | ${form.year} |
| **Type** | ${form.eventType} |
| **Discipline** | ${form.discipline} |
| **Website** | ${form.website} |
| **Deadline** | ${form.deadlineDate} |
| **Deadline Label** | ${form.deadlineLabel} |
| **City** | ${form.city} |
| **Country** | ${form.country} |
| **Event Dates** | ${form.eventDates} |
| **Fee** | ${form.fee || 'N/A'} |
| **Funding / Scholarships** | ${form.funding || 'N/A'} |

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

  const isValid = form.title && form.fullName && form.discipline && form.deadlineDate;

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

          {/* Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="deadlineDate">Deadline Date *</Label>
              <Input
                id="deadlineDate"
                type="date"
                value={form.deadlineDate}
                onChange={e => update("deadlineDate", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deadlineLabel">Deadline Label</Label>
              <Input
                id="deadlineLabel"
                placeholder="e.g. Paper submission deadline"
                value={form.deadlineLabel}
                onChange={e => update("deadlineLabel", e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g. New York"
                value={form.city}
                onChange={e => update("city", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="e.g. USA"
                value={form.country}
                onChange={e => update("country", e.target.value)}
              />
            </div>
          </div>

          {/* Event dates */}
          <div className="space-y-1.5">
            <Label htmlFor="eventDates">Event Dates</Label>
            <Input
              id="eventDates"
              placeholder="e.g. August 8-11, 2026"
              value={form.eventDates}
              onChange={e => update("eventDates", e.target.value)}
            />
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
