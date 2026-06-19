"""Form definitions for mentorship applications and operations."""

from __future__ import annotations

from datetime import date

from flask_wtf import FlaskForm
from wtforms import DateField, EmailField, HiddenField, IntegerField, PasswordField, SelectField, StringField, TextAreaField
from wtforms.validators import DataRequired, Email, Length, NumberRange

TIMEZONES = [(offset, f"UTC{offset:+d}") for offset in range(-12, 15)]
LEVELS = [
    ("High school", "High school"),
    ("Undergraduate", "Undergraduate"),
    ("Masters", "Masters"),
    ("PhD", "PhD"),
    ("Postdoc", "Postdoc"),
    ("Professional", "Professional"),
    ("Other", "Other"),
]
PROJECT_STATUSES = [
    ("kickoff", "Kickoff"),
    ("scoping", "Scoping"),
    ("in-progress", "In progress"),
    ("blocked", "Blocked"),
    ("review", "Review"),
    ("complete", "Complete"),
]


class ApplicantForm(FlaskForm):
    name = StringField("Full name", validators=[DataRequired(), Length(max=120)])
    email = EmailField("Email", validators=[DataRequired(), Email(), Length(max=255)])
    affiliation = StringField("Affiliation", validators=[DataRequired(), Length(max=160)])
    timezone = SelectField("Timezone", coerce=int, choices=TIMEZONES, validators=[DataRequired()])
    educational_level = SelectField("Educational level", choices=LEVELS, validators=[DataRequired()])
    interests = StringField(
        "Research interests",
        validators=[DataRequired(), Length(max=500)],
        description="Comma-separated, e.g. quantum algorithms, QML, error correction.",
    )
    skills = StringField(
        "Tools and skills",
        validators=[DataRequired(), Length(max=500)],
        description="Comma-separated, e.g. Python, Qiskit, Cirq, PennyLane.",
    )
    availability = StringField("Weekly availability", validators=[DataRequired(), Length(max=80)])
    motivation = TextAreaField("Motivation and goals", validators=[DataRequired(), Length(min=20, max=2000)])


class MenteeApplicationForm(ApplicantForm):
    pass


class MentorApplicationForm(ApplicantForm):
    max_mentees = IntegerField("Maximum mentees", default=1, validators=[DataRequired(), NumberRange(min=1, max=5)])


class LoginForm(FlaskForm):
    password = PasswordField("Administrator password", validators=[DataRequired()])


class ProjectUpdateForm(FlaskForm):
    project_id = HiddenField(validators=[DataRequired()])
    status = SelectField("Project status", choices=PROJECT_STATUSES, validators=[DataRequired()])
    next_deadline = DateField("Next deadline", default=date.today, validators=[DataRequired()])
    summary = TextAreaField("Latest update", validators=[DataRequired(), Length(max=2000)])
