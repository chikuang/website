---
title: "Resources"
type: "resources"
layout: "resources"
---

[← Back to Home](/)

{{ define "main" }}
  <h1>{{ .Title }}</h1>
  {{ .Content }}
  <ul>
    {{ range .Pages }}
      <li>
        <a href="{{ .RelPermalink }}">{{ .Title }}</a>
        {{ with .Params.description }}<br><em>{{ . }}</em>{{ end }}
        {{ with .Params.date }}<br>{{ . | dateFormat "2006-01-02" }}{{ end }}
      </li>
    {{ end }}
  </ul>
{{ end }} 