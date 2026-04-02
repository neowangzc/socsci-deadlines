---
title: Social Science Deadlines
emoji: 📚
colorFrom: purple
colorTo: indigo
sdk: docker
app_port: 8080
pinned: false
---

# Social Science Deadlines

Countdowns to top social science conference, workshop & summer school deadlines.

## Features

- Conference / Workshop / Summer School deadline tracking
- Discipline filters: Sociology, Political Science, Economics, Psychology, Linguistics, Communication, Education, Computational Social Science, etc.
- Event type filters: Conference, Workshop, Summer School
- Calendar year view
- Countdown to next submission deadline
- Fee and funding/scholarship information
- Add deadline to Google Calendar / Apple Calendar

## Data Structure

Data is organized by event type:

```
src/data/
├── conferences/    # Conferences
├── workshops/      # Workshops
└── summer_schools/ # Summer Schools
```

Each YAML file can contain multiple years of the same event.

## Contribute

Contributions are very welcome!

To add or update a deadline:
- Fork the repository
- Add a new entry to the appropriate file in [src/data/conferences/](src/data/conferences/), [src/data/workshops/](src/data/workshops/), or [src/data/summer_schools/](src/data/summer_schools/). 
- **Do not update an existing entry of a previous year — add a new entry at the bottom of the file**
- Make sure it has the `title`, `year`, `id`, `full_name`, `link`, `deadlines`, `date`, `start`, `end`, `city`, `country`, `tags` attributes
- Optionally add `venue`, `fee`, `funding`, `note`
- Deadline `type` must be one of:
  - `submission` — paper / abstract / panel submission (**required**, drives countdown)
  - `notification` — acceptance notification
  - `registration` — registration / early-bird / travel grant


Example:bu x
```yaml
- title: ASA
  year: 2026
  id: asa26                                          # lowercase + last two digits of year
  full_name: American Sociological Association Annual Meeting
  link: https://www.asanet.org/2026-annual-meeting/
  deadlines:
    - type: submission
      label: Paper submission deadline
      date: '2026-02-25'
    - type: notification
      label: Acceptance notification
      date: '2026-05-15'
    - type: registration
      label: Early-bird registration deadline
      date: '2026-06-15'
  date: August 7-11, 2026
  start: '2026-08-07'
  end: '2026-08-11'
  city: New York
  country: USA
  venue: Hilton New York Midtown
  tags:
    - sociology
  fee: '$277 member / $148 student'
  funding: Travel grants available,contact meetings@asanet.org before July 1, 2026
  note: 'Theme: Disrupting the Status Quo'
```
- Send a pull request


### Discipline Tags

`sociology`, `political-science`, `economics`, `psychology`, `linguistics`, `communication`, `education`, `computational-social-science`, `multidisciplinary`

## Run Locally

Requires Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
git clone https://github.com/neowangzc/socsci-deadlines
cd socsci-deadlines
npm install
npm run dev
```

Opens at http://localhost:8080/.

## Tech Stack

- Vite + React + TypeScript
- shadcn-ui + Radix UI
- Tailwind CSS
- YAML data files (no database)

## Credits

Adapted from [huggingface/ai-deadlines](https://github.com/huggingface/ai-deadlines), which was based on [paperswithcode/ai-deadlines](https://github.com/paperswithcode/ai-deadlines).

## License

[MIT](LICENSE)
