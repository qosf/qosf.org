# qosf.org Monthly Challenges

## Steps for Installing a Grader System for Monthly Challenges

### Requirements
- **Operating System**: Linux or macOS. On Windows, these bash scripts may not work properly and might need adaptation.
- **Python**: Ensure Python is installed on your system.
- **pip**: Python package installer should be installed.

### Install
1. Make the shell scripts executable:
   ```sh
   chmod +x *.sh
   ```
2. Run the install script to install the necessary packages:
   ```sh
   ./install.sh
   ```
   This script installs Jupyter Notebook and nbgrader using pip.

In this workflow, we will use the directory "challenges" as the course name and the assignment "july" for exemplification.

### Create Monthly Challenge Directories for Your Notebooks
Create the `[course]/source/[assignment]/` directory. In this case, for the course named "challenges" we will create the assignment for the July Challenge.
```sh
# mkdir -p [course]/source/[assignment]/
mkdir -p challenges/source/july/
```
resulting on the creation `challenges/source/july/` where you shall put your notebooks.


### Prepare Release for Distribution
Create the notebooks "compiled" or prepared for distribution to contestants with hidden cells for grading:
```sh
# ./create_release.sh [course] [assignment]
./create_release.sh challenges july
```

### Export Assignment ZIP (Optional)
In order to manually distribute the just created notebooks to be fetched by the contestants, run this command to get a zip with the assignment to publish them or send to contestants:
```sh
# ./export_assignment.sh [course] [assignment] [export directory]
./export_assignment.sh challenges july export_directory
```
The zip will be named after the assignment, in this example case, it will be `july.zip`.

### Import Contestant Submission
When the contestant submits back a zip with the current assignment's notebooks solved, it should be imported into the directory structure. Run this command:
```sh
# ./import_submission.sh [course] [assignment] [contestants_id] [zipfile]
./import_submission.sh challenges july camargoperez camargoperez_submission.zip
```

### Autograde Submission
To grade the contestant's submissions, run this command to perform a run of the notebooks and store the grades in the database:
```sh
# ./autograde.sh [course] [assignment]
./autograde.sh challenges july
```

### Create Feedback (Optional)
You can create an HTML report from the graded notebooks for each contestant with this command to provide feedback. The HTML must be copied from `feedback/{contestant_id}/{assignment_id}/{notebook_id}.html`. Templates must have been installed first:
```sh
# ./feedback.sh [course] [assignment]
./feedback.sh challenges july
```

### Export the Grades to CSV
To get a report of the contestants grades for this task, export it to CSV from the database:
```sh
# ./export_grades.sh [course] [assignment] [output_csv_file]
./export_grades.sh challenges july grades_july.csv
```


