# Force blogdown to use Homebrew Hugo (latest).
local({
  hugo_bin <- "/opt/homebrew/bin"
  if (dir.exists(hugo_bin)) {
    path_parts <- strsplit(Sys.getenv("PATH"), ":", fixed = TRUE)[[1]]
    path_parts <- path_parts[nzchar(path_parts)]
    path_parts <- path_parts[path_parts != hugo_bin]
    Sys.setenv(PATH = paste(c(hugo_bin, path_parts), collapse = ":"))
    options(blogdown.hugo.dir = hugo_bin)
  }
  options(blogdown.hugo.version = "0.160.1")
})
