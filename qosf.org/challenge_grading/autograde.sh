#!/bin/bash

# Check if the correct number of arguments is provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 course_name assignment_name"
    exit 1
fi

COURSE_NAME="$1"
ASSIGNMENT_NAME="$2"

# Check if nbgrader is installed
if ! command -v nbgrader &> /dev/null; then
    echo "nbgrader could not be found, please install it first."
    exit 1
fi

# Check if the course directory exists
if [ ! -d "$COURSE_NAME" ]; then
    echo "Course directory '$COURSE_NAME' does not exist."
    exit 1
fi

# Save the current directory
CURRENT_DIR=$(pwd)

# Change to the course directory
cd "$COURSE_NAME" || { echo "Failed to change directory to '$COURSE_NAME'"; exit 1; }

# Run nbgrader for the assignment
nbgrader autograde "$ASSIGNMENT_NAME"

# Return to the previous directory
cd "$CURRENT_DIR" || { echo "Failed to return to directory '$CURRENT_DIR'"; exit 1; }

echo "nbgrader has been run for assignment '$ASSIGNMENT_NAME' in course '$COURSE_NAME' successfully."

