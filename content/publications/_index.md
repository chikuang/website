---
title: "Publications"
type: "publications"
layout: "publications"
---

[← Back to Home](/)

{{ define "main" }}
  <h1>{{ .Title }}</h1>
  {{ .Content }}
  <ul>
    {{ range .Pages }}
      <li>
        <a href="{{ .RelPermalink }}">{{ .Title }}</a>
        {{ with .Params.authors }}<br><em>{{ delimit . ", " }}</em>{{ end }}
        {{ with .Params.journal }}<br>{{ . }}{{ end }}
        {{ with .Params.date }}<br>{{ . | dateFormat "2006" }}{{ end }}
      </li>
    {{ end }}
  </ul>
{{ end }}