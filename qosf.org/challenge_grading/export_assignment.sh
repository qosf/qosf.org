#!/bin/bash

# Check if assignment name and output directory are provided
if [ "$#" -ne 3 ]; then
    echo "Usage: $0 course_name assignment_name output_dir"
    exit 1
fi

COURSE_NAME="$1"
ASSIGNMENT_NAME="$2"
OUTPUT_DIR="$3"

# Check if the output directory exists
if [ ! -d "$OUTPUT_DIR" ]; then
    echo "Output directory '$OUTPUT_DIR' does not exist."
    exit 1
fi

# Check if the course directory exists
if [ ! -d "$COURSE_NAME" ]; then
    echo "Course directory '$COURSE_NAME' does not exist."
    exit 1
fi

# Check if the assignment directory exists
ASSIGNMENT_DIR="$COURSE_NAME/release/$ASSIGNMENT_NAME"
if [ ! -d "$ASSIGNMENT_DIR" ]; then
    echo "Assignment directory '$ASSIGNMENT_DIR' does not exist."
    exit 1
fi

# Create the zip file
ZIP_FILE="$OUTPUT_DIR/$ASSIGNMENT_NAME.zip"
zip -j "$ZIP_FILE" "$ASSIGNMENT_DIR"/*.ipynb

echo "Assignment notebooks have been zipped into '$ZIP_FILE' successfully."

