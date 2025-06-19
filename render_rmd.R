#!/usr/bin/env Rscript

# Helper script to render R Markdown files to markdown for blogdown
# Usage: Rscript render_rmd.R filename.Rmd

args <- commandArgs(trailingOnly = TRUE)

if (length(args) == 0) {
  cat("Usage: Rscript render_rmd.R filename.Rmd\n")
  cat("This will render the Rmd file to markdown format for blogdown.\n")
  quit(status = 1)
}

filename <- args[1]

if (!file.exists(filename)) {
  cat("Error: File", filename, "not found.\n")
  quit(status = 1)
}

cat("Rendering", filename, "to markdown...\n")

# Get the base name without extension
base_name <- tools::file_path_sans_ext(basename(filename))
dir_name <- dirname(filename)

# Render to markdown
rmarkdown::render(filename, 
                 output_format = "md_document",
                 output_options = list(
                   preserve_yaml = TRUE
                 ))

# Fix image paths for blogdown
md_file <- file.path(dir_name, paste0(base_name, ".md"))
if (file.exists(md_file)) {
  # Read the markdown content
  content <- readLines(md_file)
  
  # Replace relative image paths with blogdown static paths
  # Pattern: ![](filename_files/figure-markdown_strict/image.png)
  # Replace with: ![](/resources/filename_files/figure-markdown_strict/image.png)
  content <- gsub(
    pattern = "!\\[\\]\\(([^/][^)]*)\\)",
    replacement = "![](/resources/\\1)",
    content
  )
  
  # Write back the fixed content
  writeLines(content, md_file)
  
  cat("Fixed image paths for blogdown.\n")
}

cat("Rendering complete!\n")
cat("You can now run 'Rscript -e \"blogdown::serve_site()\"' to preview your site.\n") 