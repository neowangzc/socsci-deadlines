import { Conference } from '@/types/conference';
import { hasUpcomingDeadlines } from './deadlineUtils';

const conferenceModules = import.meta.glob('@/data/conferences/*.yml', { eager: true });
const workshopModules = import.meta.glob('@/data/workshops/*.yml', { eager: true });
const summerSchoolModules = import.meta.glob('@/data/summer_schools/*.yml', { eager: true });

const allConferencesData: Conference[] = [];

for (const path in conferenceModules) {
  const module = conferenceModules[path] as { default: Conference[] };
  if (module.default && Array.isArray(module.default)) {
    module.default.forEach(conf => { if (!conf.event_type) conf.event_type = 'conference'; });
    allConferencesData.push(...module.default);
  }
}

for (const path in workshopModules) {
  const module = workshopModules[path] as { default: Conference[] };
  if (module.default && Array.isArray(module.default)) {
    module.default.forEach(conf => { if (!conf.event_type) conf.event_type = 'workshop'; });
    allConferencesData.push(...module.default);
  }
}

for (const path in summerSchoolModules) {
  const module = summerSchoolModules[path] as { default: Conference[] };
  if (module.default && Array.isArray(module.default)) {
    module.default.forEach(conf => { if (!conf.event_type) conf.event_type = 'summer_school'; });
    allConferencesData.push(...module.default);
  }
}

for (const conf of allConferencesData) {
  if (hasUpcomingDeadlines(conf) && (!Array.isArray(conf.tags) || conf.tags.length === 0)) {
    console.error(
      `"${conf.title}" (${conf.year}) has an upcoming deadline but no tags. ` +
      `Add at least one tag to its YAML file so it appears in filtered views.`
    );
  }
}

export default allConferencesData;
