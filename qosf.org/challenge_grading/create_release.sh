#!/bin/bash

# Check if a course name is provided
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

# Save the current directory
CURRENT_DIR=$(pwd)

# Change to the course directory
if [ ! -d "$COURSE_NAME" ]; then
    echo "Course directory '$COURSE_NAME' does not exist."
    exit 1
fi

cd "$COURSE_NAME"

# Run the nbgrader generate_assignment command
nbgrader generate_assignment "$ASSIGNMENT_NAME" --force

# Return to the previous directory
cd "$CURRENT_DIR"

echo "Assignment '$ASSIGNMENT_NAME' has been generated in course '$COURSE_NAME' successfully."

