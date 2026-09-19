# Link icons

Icons are stored in `assets/icons/` and embedded as inline SVG by
`layouts/partials/icon-link.html`. All use `currentColor` so they follow the
site's light and dark themes. Link destinations retain accessible names and
hover labels.

- GitHub, globe, email, file, code, package, and book icons: extracted from the
  site's bundled [Feather Icons](https://github.com/feathericons/feather),
  distributed under the [MIT license](https://github.com/feathericons/feather/blob/main/LICENSE).
- Google Scholar, arXiv, ResearchGate, and R (for CRAN):
  [Simple Icons v14](https://github.com/simple-icons/simple-icons/tree/14.0.0/icons),
  downloaded from its jsDelivr npm distribution. Simple Icons is distributed
  under [CC0](https://github.com/simple-icons/simple-icons/blob/14.0.0/LICENSE.md).

The R icon identifies CRAN links; the globe identifies external web pages.
No icon CDN request is needed to display these links.
