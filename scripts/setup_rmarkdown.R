# Install required packages if not already installed
packages <- c("rmarkdown", "knitr", "ggplot2", "dplyr")

for (pkg in packages) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    install.packages(pkg)
  }
}

# Print package versions for reference
for (pkg in packages) {
  cat(sprintf("%s version: %s\n", pkg, packageVersion(pkg)))
} 