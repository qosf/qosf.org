#!/bin/bash

# Check if a CSV file path is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 path_to_csv_file"
    exit 1
fi

CSV_FILE="$1"

# Check if the provided CSV file exists
if [ ! -f "$CSV_FILE" ]; then
    echo "CSV file not found: $CSV_FILE"
    exit 1
fi

# Check if nbgrader is installed
if ! command -v nbgrader &> /dev/null; then
    echo "nbgrader could not be found, please install it first."
    exit 1
fi

# Import students from the CSV file
nbgrader db student import "$CSV_FILE"

echo "All students have been imported successfully."

