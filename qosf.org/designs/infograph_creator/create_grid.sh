#!/bin/bash

# Check for the correct number of arguments
if [ "$#" -ne 3 ]; then
    echo "Usage: $0 grid_size input_dir output_filename"
    exit 1
fi

# Assign input parameters to variables
GRID_SIZE=$1
INPUT_DIR=$2
OUTPUT_FILENAME=$3

# Create the montage
montage -tile "$GRID_SIZE" -geometry +0+0 "${INPUT_DIR}"/*.png "$OUTPUT_FILENAME"

# Inform the user of completion
echo "Montage created successfully: $OUTPUT_FILENAME"

# Example usage
# This script creates a grid montage of PNG images from a specified directory.
# Usage:
# ./create_image_grid.sh 3x2 /path/to/input/directory output.png
# Where "3x2" is the grid size, "/path/to/input/directory" is the path where PNG images are stored,
# and "output.png" is the name of the output file to be created.
