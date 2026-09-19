#!/usr/bin/env Rscript

# Comprehensive R Markdown processor for blogdown
# Usage: Rscript scripts/process_rmd.R filename.Rmd

args <- commandArgs(trailingOnly = TRUE)

if (length(args) == 0) {
  cat("Usage: Rscript scripts/process_rmd.R filename.Rmd\n")
  cat("This will:\n")
  cat("1. Render Rmd to markdown\n")
  cat("2. Fix image paths for blogdown\n")
  cat("3. Copy images to static directory\n")
  quit(status = 1)
}

filename <- args[1]

if (!file.exists(filename)) {
  cat("Error: File", filename, "not found.\n")
  quit(status = 1)
}

cat("Processing", filename, "...\n")

# Get the base name without extension
base_name <- tools::file_path_sans_ext(basename(filename))
dir_name <- dirname(filename)

# Step 1: Render to markdown
cat("1. Rendering to markdown...\n")
rmarkdown::render(filename, 
                 output_format = "md_document",
                 output_options = list(
                   preserve_yaml = TRUE
                 ))

# Step 2: Fix image paths and copy images
md_file <- file.path(dir_name, paste0(base_name, ".md"))
if (file.exists(md_file)) {
  cat("2. Fixing image paths...\n")
  
  # Read the markdown content
  content <- readLines(md_file)
  
  # Find all image references
  img_pattern <- "!\\[\\]\\(([^)]*)\\)"
  img_matches <- gregexpr(img_pattern, content)
  
  for (i in seq_along(content)) {
    if (img_matches[[i]][1] != -1) {
      # Extract image paths
      img_paths <- regmatches(content[i], img_matches[[i]])
      
      for (img_path in img_paths) {
        # Extract the actual path from ![](path)
        actual_path <- gsub("!\\[\\]\\(([^)]*)\\)", "\\1", img_path)
        
        # Skip if it's already an absolute path
        if (!grepl("^/", actual_path)) {
          # Create static directory path
          static_dir <- file.path("static", "resources", dirname(actual_path))
          static_path <- file.path("static", "resources", actual_path)
          
          # Create directory if it doesn't exist
          if (!dir.exists(static_dir)) {
            dir.create(static_dir, recursive = TRUE)
          }
          
          # Copy image to static directory
          source_path <- file.path(dir_name, actual_path)
          if (file.exists(source_path)) {
            file.copy(source_path, static_path, overwrite = TRUE)
            cat("   Copied:", actual_path, "to static directory\n")
          }
          
          # Update the path in markdown
          new_path <- paste0("/resources/", actual_path)
          content[i] <- gsub(actual_path, new_path, content[i], fixed = TRUE)
        }
      }
    }
  }
  
  # Write back the fixed content
  writeLines(content, md_file)
  cat("3. Image paths updated for blogdown.\n")
}

cat("Processing complete!\n")
cat("You can now run 'Rscript -e \"blogdown::serve_site()\"' to preview your site.\n") 