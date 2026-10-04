# Resources Page Guide

This directory contains your resource posts and materials. Here's how to use it:

## Adding Resource Posts

1. **Create a new markdown file** in this directory (e.g. `my-resource.md`)
2. **Use the following front matter**:

```yaml
---
title: "Your Resource Title"
date: 2025-01-20
description: "Brief description of the resource"
tags: ["tag1", "tag2"]
categories: ["resources", "YourGroupName"]
---
```

Use a second `categories` value for the group heading on `/resources/`. The first entry is usually `resources`.

3. **Write your content** in markdown format
4. **Add any files** (PDFs, code, etc.) to the `static/` directory

## Types of Resources You Can Add

- **Tutorials**: Step-by-step guides
- **Code examples**: Scripts and code snippets
- **Data sets**: Links to useful data
- **Tools and software**: Reviews and recommendations
- **Research materials**: Notes, papers, presentations
- **Course materials**: Lecture notes, assignments
- **Documentation**: How-to guides and manuals

## Article navigation

Resource articles share a table of contents generated from their heading anchors,
including R Markdown's section wrappers. On screens at least 1100 pixels wide,
the default is a sticky sidebar. Readers can choose **Floating** in the menu's
**Display** selector; that preference is remembered across resource articles.
Narrow screens automatically use a floating, collapsible menu. The active section
is highlighted while scrolling, and Escape closes an open floating menu.

This behavior lives in `static/js/resource-toc.js`, `static/css/resource-toc.css`,
and the theme's `layouts/resources/single.html`. Set `show_toc: false` in a post's
front matter to opt out. `toc_collapsed` controls the static fallback before
JavaScript initializes; the enhanced sidebar starts open and the floating menu
starts closed.

## Event directory and compact lists

The **Conference & Seminar** category has two posts backed by one dataset:

- `content/resources/Conferences_seminars.Rmd` (`event_directory: upcoming`) combines dated events with recurring seminar/calendar links.
- `content/resources/Past_conference.Rmd` (`event_directory: past`) shows completed events. Its `list_collapsed: true` keeps its Resource-list entry folded.
- `data/academic_events.json` is the only source for dated events on both pages. **Do not manually move or duplicate entries between posts.** Preserve historical records even when the organizer reuses a URL for a new edition.

Each event has a stable `id`, `title`, official `url`, `category`, `location`, Markdown `description`, and an individual `verified` date. `start` and `end` are ISO `YYYY-MM-DD` dates, with the end date inclusive. An event without confirmed dates uses empty `start`/`end` and a `date_note`; it stays under Dates to be announced. Optional `deadlines` contain `label` and `date`. Keep mutable deadlines here rather than in prose so expired calls disappear automatically. Distinguish NeurIPS/FCRC workshops from their parent meetings and use their own dates.

Hugo's `academic-events.html` and `academic-event.html` partials provide a complete static fallback. `static/js/academic-events.js` regroup the existing entries using **America/New_York** dates when a page loads, returns from the background, or remains open past midnight. A multi-day event remains upcoming through its final day. Past events are folded on the main directory and are also available on the separate archive page. No external script, account, visitor data, or network request is needed for date-based archiving. With JavaScript disabled, groups reflect the latest build and all dates/links remain readable.

A Codex heartbeat, **Update academic events**, checks official organizer and university pages each Monday at 08:00 America/New_York. It discovers new events and checks date/venue/deadline changes; the website itself does not scrape event sites. This local scheduled review requires the computer to be on and Codex running. Date-based archiving in visitors' browsers works independently. Update `verified` only for records actually checked; `last_reviewed` records the latest published substantive review, not today's browser date. Stay quiet and avoid commits when there are no meaningful changes. Source or network failures must never erase existing entries or fabricate dates.

Before publishing:

```sh
node tests/academic-events.cjs
hugo
```

If the article prose changes, regenerate its HTML companion first:

```r
blogdown::build_site(build_rmd = c(
  "content/resources/Conferences_seminars.Rmd",
  "content/resources/Past_conference.Rmd"
), run_hugo = FALSE)
```

Inspect the source/output diffs, preserve other tasks' edits and independent course assets, and commit only this update before pushing both repositories. Never use `--cleanDestinationDir`. The tests validate the data, inclusive boundaries, DST, year rollover, ordering, archive movement on both pages, and duplicate-free refreshes. Notes remain at the bottom of each post; Misc links to the directory instead of duplicating it.

Set `compact_lists: true` for resource directories. This loads
`static/css/resource-directory.css` for tighter heading, list, and archive spacing
without changing other articles. Edit `.Rmd` sources and regenerate their `.html`
companions before running Hugo.

## File Organization

- Keep related files in organized subdirectories
- Use descriptive filenames
- Include proper metadata in front matter
- Link to external resources when appropriate

## Example Structure

```
content/resources/
├── _index.md
├── tutorials/
│   ├── r-basics.md
│   └── ggplot2-guide.md
├── datasets/
│   └── sample-data.md
└── tools/
    └── software-reviews.md
```
