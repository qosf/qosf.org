#!/bin/bash

# Check if the correct number of arguments is provided
if [ "$#" -ne 4 ]; then
    echo "Usage: $0 course_name assignment_id student_id zip_file"
    exit 1
fi

COURSE_NAME="$1"
ASSIGNMENT_ID="$2"
STUDENT_ID="$3"
ZIP_FILE="$4"

# Check if the provided zip file exists
if [ ! -f "$ZIP_FILE" ]; then
    echo "Zip file '$ZIP_FILE' not found."
    exit 1
fi

# Check if the course directory exists
if [ ! -d "$COURSE_NAME" ]; then
    echo "Course directory '$COURSE_NAME' does not exist."
    exit 1
fi

# Create the submission directory structure
SUBMISSION_DIR="$COURSE_NAME/submitted/$STUDENT_ID/$ASSIGNMENT_ID"
mkdir -p "$SUBMISSION_DIR"

# Unzip the file to the submission directory
unzip -o "$ZIP_FILE" -d "$SUBMISSION_DIR"

echo "Submission has been imported to '$SUBMISSION_DIR' successfully."

