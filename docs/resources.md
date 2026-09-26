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

The **Conference & Seminar** category has two posts:

- `content/resources/Conferences_seminars.Rmd` lists upcoming events and ongoing seminar series. Keep dated events in chronological order and link each entry to its organizer.
- `content/resources/Past_conference.Rmd` contains completed events. Move entries here after they finish, grouped by year and location. Its `list_collapsed: true` front matter makes the archive entry collapsed by default on the Resource list; expanding it reveals the description and article link. Archive entries appear after regular posts within their category.

Each post's Notes section records its verification date. Misc links to the current event directory instead of duplicating the list.

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
