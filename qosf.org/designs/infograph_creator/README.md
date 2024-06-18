
# qosf.org Project Infographic Creator

## Overview

This project involves creating infographics for the QoSF.org project using an existing Adobe Illustrator (.ai) file and a `VariableImporter.jsx` script. The script imports variables into the .ai file, which allows for batch exporting components into PNG files using Adobe Illustrator's native export functionality. Afterwards, the resulting PNG files are combined into a larger image using a bash script.

## Prerequisites

1. **Adobe Illustrator** - Ensure you have Adobe Illustrator installed for working with the .ai files.
2. **VariableImporter Script** - A script that imports variables into the .ai file.
3. **ImageMagick** - Ensure you have ImageMagick installed, as it includes the `montage` tool required for the bash script.

To install ImageMagick, run:
```bash
sudo apt-get install imagemagick
```

## Instructions

### Step 0: Modify CSV
Provided `quantum_projects.csv` contains the data to populate the cards and mount the infrograph, you may change it as desired but don't change the headers as they are required as they are to work with the provided `project_card.ai` and bind automatically with VariableImporter

### Step 1: Use VariableImporter Script

1. **Open Adobe Illustrator** and load the `project_card.ai` configured according to VariableImporter.jsx script requirements.
2. **Run the VariableImporter script** load `VariableImporter.jsx` script (included) to import the provided `quantum_projects.csv` to load the card variables. If some variables were not auto-assigned to the object, correct that manually.

### Step 2: Batch Export in Adobe Illustrator 
1. **Open Adobe Illustrator** and load the .ai file that has been updated with the VariableImporter script.
2. Open the **Actions** panel (Window > Actions).
3. Create a new action by clicking the **Create New Action** button.
4. In the dialog that appears, name the action (e.g., "Batch Export") and click **Record**.
5. Perform the export operation manually: Go to **File > Export > Export As**, choose **PNG** as the format, and set the export settings as desired. Click **Export**.
6. Stop recording the action by clicking the **Stop** button at the bottom of the Actions panel.
7. Go to **File > Automate > Batch**.
8. In the Batch dialog, choose the action you just created from the **Action** dropdown.
9. Set the **Source** to the folder containing your updated `.ai` file.
10. Set the **Destination** to the folder where you want to save the exported PNG files.
11. Click **OK** to start the batch export process.

### Step 3: Assemble the PNG Files into a Larger Image
To create a grid montage of PNG images:

1. **Navigate** to the directory where your `create_grid.sh` script is located.
2. Run the script with the following command:
```bash
./create_grid.sh 3x2 /path/to/cards output.png
```
- `3x2` specifies the grid size (3 columns and 2 rows) you can change that accordingly.
- `/path/to/cards` is the directory where the PNG images are stored. Images are assumed to be all png
- `output.png` is the name of the output file to be created.

### Conclusion

By following these steps, you can create a comprehensive infographic by importing variables into the provided Adobe Illustrator file using the VariableImporter script. Use Adobe Illustrator's batch export functionality to convert the updated .ai file into PNG files, and then combine these PNG files into a larger image using the provided bash script.

