export interface Deadline {
  type: 'submission' | 'notification' | 'registration';
  label: string;
  date: string;
  timezone?: string;
}

export type EventType = 'conference' | 'workshop' | 'summer_school';

export interface Conference {
  id: string;
  title: string;
  full_name?: string;
  year: number;
  link?: string;
  deadline: string;
  deadlines?: Deadline[];
  timezone?: string;
  date: string;
  place?: string;
  city?: string;
  country?: string;
  venue?: string;
  tags?: string[];
  note?: string;
  abstract_deadline?: string;
  start?: string;
  end?: string;
  event_type?: EventType;
  fee?: string;
  funding?: string;
  rebuttal_period_start?: string;
  rebuttal_period_end?: string;
  final_decision_date?: string;
  review_release_date?: string;
  submission_deadline?: string;
  timezone_submission?: string;
  commitment_deadline?: string;
} 