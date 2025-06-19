# Resources Page Guide

This directory contains your resource posts and materials. Here's how to use it:

## Adding Resource Posts

1. **Create a new markdown file** in this directory (e.g., `my-resource.md`)
2. **Use the following front matter**:

```yaml
---
title: "Your Resource Title"
date: 2025-01-20
description: "Brief description of the resource"
tags: ["tag1", "tag2"]
categories: ["resources"]
---
```

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

## Configuration

You can also add resources directly to your `config.toml` file in the `[params.resources]` section for quick access to external links and downloads. 