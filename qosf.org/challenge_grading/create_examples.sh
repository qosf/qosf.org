#!/bin/bash

# Check if a course name is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 course_name"
    exit 1
fi

COURSE_NAME="$1"

# Check if nbgrader is installed
if ! command -v nbgrader &> /dev/null; then
    echo "nbgrader could not be found, please install it first."
    exit 1
fi

# Run the nbgrader quickstart command
nbgrader quickstart "$COURSE_NAME"

echo "Example data for course '$COURSE_NAME' has been created successfully."

