"""QOSF mentorship cohort management application."""

from __future__ import annotations

import os
import random
import re
from datetime import date, timedelta
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any

from flask import Flask, flash, redirect, render_template, request, session, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import CSRFProtect
from sqlalchemy import and_

from .forms import LoginForm, MenteeApplicationForm, MentorApplicationForm, ProjectUpdateForm

BASE_DIR = Path(__file__).resolve().parent.parent
db = SQLAlchemy()
csrf = CSRFProtect()


class Applicant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(16), nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    timezone = db.Column(db.Integer, nullable=False)
    educational_level = db.Column(db.String(80), nullable=False)
    interests = db.Column(db.Text, nullable=False)
    skills = db.Column(db.Text, nullable=False, default="")
    availability = db.Column(db.String(80), nullable=False)
    affiliation = db.Column(db.String(160), nullable=False, default="")
    motivation = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(32), nullable=False, default="submitted")
    max_mentees = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)

    def interest_set(self) -> set[str]:
        return {item.strip().lower() for item in self.interests.split(",") if item.strip()}

    def skill_set(self) -> set[str]:
        return {item.strip().lower() for item in self.skills.split(",") if item.strip()}


class Match(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    mentee_id = db.Column(db.Integer, db.ForeignKey("applicant.id"), nullable=False)
    mentor_id = db.Column(db.Integer, db.ForeignKey("applicant.id"), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    rationale = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(32), nullable=False, default="proposed")
    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    mentee = db.relationship("Applicant", foreign_keys=[mentee_id])
    mentor = db.relationship("Applicant", foreign_keys=[mentor_id])


class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(180), nullable=False)
    match_id = db.Column(db.Integer, db.ForeignKey("match.id"), nullable=False)
    status = db.Column(db.String(32), nullable=False, default="kickoff")
    next_deadline = db.Column(db.Date, nullable=False)
    summary = db.Column(db.Text, nullable=False, default="")
    match = db.relationship("Match", backref=db.backref("project", uselist=False))


class CohortMilestone(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(160), nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    description = db.Column(db.Text, nullable=False)
    phase = db.Column(db.String(80), nullable=False)


def create_app(test_config: dict[str, Any] | None = None) -> Flask:
    app = Flask(__name__)
    app.config.from_mapping(
        SECRET_KEY=os.environ.get("SECRET_KEY", "dev-change-me"),
        SQLALCHEMY_DATABASE_URI=os.environ.get(
            "DATABASE_URL", f"sqlite:///{BASE_DIR / 'instance' / 'qosf_mentorship.sqlite'}"
        ),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        ADMIN_PASSWORD=os.environ.get("ADMIN_PASSWORD", "qosf-admin"),
        WTF_CSRF_TIME_LIMIT=None,
        SEED_DEMO_DATA=os.environ.get("SEED_DEMO_DATA", "true").lower() not in {"0", "false", "no"},
    )
    if test_config:
        app.config.update(test_config)

    db.init_app(app)
    csrf.init_app(app)

    with app.app_context():
        Path(app.instance_path).mkdir(parents=True, exist_ok=True)
        db.create_all()
        seed_milestones()
        if app.config["SEED_DEMO_DATA"]:
            seed_demo_applicants()

    @app.context_processor
    def inject_theme() -> dict[str, Any]:
        return {
            "nav_items": [
                ("Home", "https://www.qosf.org/"),
                ("Manifesto", "https://www.qosf.org/manifesto"),
                ("Learn", "https://www.qosf.org/learn_quantum"),
                ("Code", "https://www.qosf.org/project_list"),
                ("Evaluation", "https://www.qosf.org/evaluation"),
                ("Mentorship", "https://www.qosf.org/qc_mentorship"),
            ]
        }

    @app.route("/")
    def index():
        stats = {
            "mentees": Applicant.query.filter_by(role="mentee").count(),
            "mentors": Applicant.query.filter_by(role="mentor").count(),
            "matches": Match.query.count(),
            "projects": Project.query.count(),
        }
        milestones = CohortMilestone.query.order_by(CohortMilestone.due_date).all()
        projects = Project.query.order_by(Project.next_deadline).limit(6).all()
        return render_template("index.html", stats=stats, milestones=milestones, projects=projects)

    @app.route("/apply/mentee", methods=["GET", "POST"])
    def apply_mentee():
        form = MenteeApplicationForm()
        if form.validate_on_submit():
            applicant = Applicant(role="mentee")
            form.populate_obj(applicant)
            db.session.add(applicant)
            db.session.commit()
            flash("Your mentee application has been submitted securely.", "success")
            return redirect(url_for("index"))
        return render_template("application_form.html", form=form, role="Mentee")

    @app.route("/apply/mentor", methods=["GET", "POST"])
    def apply_mentor():
        form = MentorApplicationForm()
        if form.validate_on_submit():
            applicant = Applicant(role="mentor")
            form.populate_obj(applicant)
            db.session.add(applicant)
            db.session.commit()
            flash("Your mentor profile has been submitted securely.", "success")
            return redirect(url_for("index"))
        return render_template("application_form.html", form=form, role="Mentor")

    @app.route("/login", methods=["GET", "POST"])
    def login():
        form = LoginForm()
        if form.validate_on_submit():
            if form.password.data == app.config["ADMIN_PASSWORD"]:
                session["admin"] = True
                flash("Welcome to the cohort control center.", "success")
                return redirect(url_for("admin"))
            flash("Invalid administrator password.", "error")
        return render_template("login.html", form=form)

    @app.route("/logout")
    def logout():
        session.clear()
        flash("Signed out.", "success")
        return redirect(url_for("index"))

    @app.route("/admin")
    @admin_required
    def admin():
        mentees = Applicant.query.filter_by(role="mentee").order_by(Applicant.created_at.desc()).all()
        mentors = Applicant.query.filter_by(role="mentor").order_by(Applicant.created_at.desc()).all()
        matches = Match.query.order_by(Match.score.desc()).all()
        return render_template("admin.html", mentees=mentees, mentors=mentors, matches=matches)

    @app.route("/matching")
    @admin_required
    def matching():
        mentees = Applicant.query.filter_by(role="mentee").all()
        mentors = Applicant.query.filter_by(role="mentor").all()
        suggestions = [(mentee, ranked_matches(mentee, mentors)[:5]) for mentee in mentees]
        return render_template("matching.html", suggestions=suggestions)

    @app.route("/matches", methods=["POST"])
    @admin_required
    def create_match():
        mentee = Applicant.query.get_or_404(request.form.get("mentee_id", type=int))
        mentor = Applicant.query.get_or_404(request.form.get("mentor_id", type=int))
        confirm_match(mentee, mentor)
        db.session.commit()
        flash("Match confirmed and project workspace created.", "success")
        return redirect(url_for("projects"))

    @app.route("/auto-pair", methods=["POST"])
    @admin_required
    def auto_pair():
        matches = auto_pair_applicants()
        db.session.commit()
        flash(f"Automatic pairing created {len(matches)} mentor-mentee match(es).", "success")
        return redirect(url_for("projects"))

    @app.route("/admin/applicants/<int:applicant_id>/delete", methods=["POST"])
    @admin_required
    def delete_applicant_route(applicant_id: int):
        applicant = Applicant.query.get_or_404(applicant_id)
        role = applicant.role
        name = applicant.name
        delete_applicant(applicant)
        db.session.commit()
        flash(f"Removed {role} {name} and related pairings/projects from the database.", "success")
        return redirect(url_for("admin"))

    @app.route("/admin/projects/<int:project_id>/delete", methods=["POST"])
    @admin_required
    def delete_project_route(project_id: int):
        project = Project.query.get_or_404(project_id)
        title = project.title
        delete_project(project)
        db.session.commit()
        flash(f"Removed project/pairing {title} from the database.", "success")
        return redirect(request.form.get("next") or url_for("projects"))

    @app.route("/projects", methods=["GET", "POST"])
    @admin_required
    def projects():
        form = ProjectUpdateForm()
        if form.validate_on_submit():
            project = Project.query.get_or_404(form.project_id.data)
            project.status = form.status.data
            project.next_deadline = form.next_deadline.data
            project.summary = form.summary.data
            db.session.commit()
            flash("Project status updated.", "success")
            return redirect(url_for("projects"))
        all_projects = Project.query.order_by(Project.next_deadline).all()
        milestones = CohortMilestone.query.order_by(CohortMilestone.due_date).all()
        return render_template("projects.html", projects=all_projects, milestones=milestones, form=form)

    return app


def admin_required(view):
    from functools import wraps

    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("admin"):
            flash("Please sign in to access applicant data and cohort operations.", "error")
            return redirect(url_for("login"))
        return view(*args, **kwargs)

    return wrapped


def delete_project(project: Project) -> None:
    match = project.match
    db.session.delete(project)
    if match:
        db.session.delete(match)


def delete_applicant(applicant: Applicant) -> None:
    if applicant.role == "mentee":
        affected_matches = Match.query.filter_by(mentee_id=applicant.id).all()
    else:
        affected_matches = Match.query.filter_by(mentor_id=applicant.id).all()
    for match in affected_matches:
        projects = Project.query.filter_by(match_id=match.id).all()
        for project in projects:
            db.session.delete(project)
        db.session.delete(match)
    db.session.delete(applicant)


def seed_milestones() -> None:
    if CohortMilestone.query.count():
        return
    today = date.today()
    milestones = [
        ("Applications open", 0, "Collect mentor and mentee forms with timezone, level, and interests.", "Application"),
        ("Eligibility review", 21, "Review submissions, check completeness, and shortlist candidates.", "Application"),
        ("Matching week", 28, "Use compatibility scores to propose mentor-mentee pairs.", "Matching"),
        ("Cohort kickoff", 35, "Confirm project scopes, communication rhythm, and success metrics.", "Execution"),
        ("Midpoint demo", 77, "Record project status, blockers, and revised next deadlines.", "Execution"),
        ("Final presentations", 119, "Collect demos, reports, and open-source contribution summaries.", "Wrap-up"),
    ]
    for title, offset, description, phase in milestones:
        db.session.add(CohortMilestone(title=title, due_date=today + timedelta(days=offset), description=description, phase=phase))
    db.session.commit()


def seed_demo_applicants() -> None:
    """Create a deterministic demo cohort with 11 mentees and 8 mentors."""
    if Applicant.query.count():
        return

    interests = [
        "Quantum algorithms",
        "Quantum machine learning",
        "Error correction",
        "Variational quantum eigensolvers",
        "Quantum simulation",
        "Quantum cryptography",
        "NISQ benchmarking",
        "Quantum chemistry",
    ]
    skills = [
        "Python",
        "Qiskit",
        "Cirq",
        "PennyLane",
        "OpenQASM",
        "Julia",
        "TensorFlow Quantum",
        "QuTiP",
    ]
    mentee_names = [
        "Ada Nguyen",
        "Ben Carter",
        "Chloe Singh",
        "Diego Martinez",
        "Elena Rossi",
        "Fatima Khan",
        "Gabe Wilson",
        "Hana Mori",
        "Ivan Petrov",
        "Jules Martin",
        "Keira Brown",
    ]
    mentor_names = [
        "Dr. Amara Blake",
        "Prof. Niels Cooper",
        "Dr. Sofia Alvarez",
        "Dr. Omar Haddad",
        "Prof. Lin Chen",
        "Dr. Priya Rao",
        "Dr. Marek Novak",
        "Prof. Zoe Turner",
    ]
    timezones = [-8, -5, -3, 0, 1, 2, 5, 8, 10]
    weekly_hours = [4, 5, 6, 7, 8, 10, 12]
    rng = random.Random(20260605)

    for index, name in enumerate(mentee_names):
        primary_interest = interests[index % len(interests)]
        secondary_interest = rng.choice([interest for interest in interests if interest != primary_interest])
        primary_skill = skills[index % len(skills)]
        secondary_skill = rng.choice([skill for skill in skills if skill != primary_skill])
        db.session.add(
            Applicant(
                role="mentee",
                name=name,
                email=f"mentee-{index + 1}@example.org",
                timezone=rng.choice(timezones),
                educational_level=["Undergraduate", "Masters", "PhD", "Professional"][index % 4],
                interests=f"{primary_interest}, {secondary_interest}",
                skills=f"{primary_skill}, {secondary_skill}",
                availability=f"{rng.choice(weekly_hours)} hours/week",
                affiliation="QOSF demo cohort",
                motivation="Demo mentee interested in contributing to open-source quantum computing projects.",
            )
        )

    for index, name in enumerate(mentor_names):
        primary_interest = interests[index % len(interests)]
        secondary_interest = rng.choice([interest for interest in interests if interest != primary_interest])
        primary_skill = skills[index % len(skills)]
        secondary_skill = rng.choice([skill for skill in skills if skill != primary_skill])
        db.session.add(
            Applicant(
                role="mentor",
                name=name,
                email=f"mentor-{index + 1}@example.org",
                timezone=rng.choice(timezones),
                educational_level="Professional",
                interests=f"{primary_interest}, {secondary_interest}",
                skills=f"{primary_skill}, {secondary_skill}",
                availability=f"{rng.choice(weekly_hours)} hours/week",
                affiliation="QOSF mentor network",
                motivation="Demo mentor available to guide open-source quantum computing research projects.",
                max_mentees=2 if index < 3 else 1,
            )
        )
    db.session.commit()


def ranked_matches(mentee: Applicant, mentors: list[Applicant]) -> list[dict[str, Any]]:
    candidates = []
    already_matched = Match.query.filter(and_(Match.mentee_id == mentee.id, Match.status == "confirmed")).count()
    if already_matched:
        return candidates
    for mentor in mentors:
        existing = Match.query.filter(and_(Match.mentor_id == mentor.id, Match.status == "confirmed")).count()
        if existing >= mentor.max_mentees:
            continue
        score, rationale = score_pair(mentee, mentor)
        candidates.append({"mentor": mentor, "score": score, "rationale": rationale})
    return sorted(candidates, key=lambda item: item["score"], reverse=True)


def auto_pair_applicants() -> list[Match]:
    mentees = Applicant.query.filter_by(role="mentee").all()
    mentors = Applicant.query.filter_by(role="mentor").all()
    mentees_by_id = {mentee.id: mentee for mentee in mentees}
    mentors_by_id = {mentor.id: mentor for mentor in mentors}
    assigned_mentees = {match.mentee_id for match in Match.query.filter_by(status="confirmed").all()}
    mentor_load = {
        mentor.id: Match.query.filter(and_(Match.mentor_id == mentor.id, Match.status == "confirmed")).count()
        for mentor in mentors
    }
    pairings = []
    for mentee in mentees:
        if mentee.id in assigned_mentees:
            continue
        for mentor in mentors:
            if mentor_load[mentor.id] >= mentor.max_mentees:
                continue
            score, rationale = score_pair(mentee, mentor)
            pairings.append((score, mentee.id, mentor.id, rationale))

    created = []
    for _score, mentee_id, mentor_id, _rationale in sorted(pairings, reverse=True):
        mentor = mentors_by_id[mentor_id]
        if mentee_id in assigned_mentees or mentor_load[mentor_id] >= mentor.max_mentees:
            continue
        match = confirm_match(mentees_by_id[mentee_id], mentor)
        created.append(match)
        assigned_mentees.add(mentee_id)
        mentor_load[mentor_id] += 1
    return created


def confirm_match(mentee: Applicant, mentor: Applicant) -> Match:
    existing = Match.query.filter_by(mentee_id=mentee.id, mentor_id=mentor.id, status="confirmed").one_or_none()
    if existing:
        return existing
    score, rationale = score_pair(mentee, mentor)
    match = Match(mentee=mentee, mentor=mentor, score=score, rationale=rationale, status="confirmed")
    db.session.add(match)
    db.session.flush()
    db.session.add(
        Project(
            title=f"{mentee.name} × {mentor.name} mentorship project",
            match=match,
            next_deadline=date.today() + timedelta(days=14),
            summary="Kickoff pending: confirm scope, repository, milestones, and communication cadence.",
        )
    )
    return match


def normalized_terms(value: str) -> list[str]:
    return [item.strip().lower() for item in value.split(",") if item.strip()]


def character_match_ratio(mentee_terms: list[str], mentor_terms: list[str]) -> tuple[float, list[str]]:
    if not mentee_terms or not mentor_terms:
        return 0.0, []
    ratios = []
    labels = []
    for mentee_term in mentee_terms:
        mentor_term, ratio = max(
            ((mentor_term, SequenceMatcher(None, mentee_term, mentor_term).ratio()) for mentor_term in mentor_terms),
            key=lambda item: item[1],
        )
        ratios.append(ratio)
        if ratio >= 0.65:
            labels.append(f"{mentee_term} ↔ {mentor_term}")
    return sum(ratios) / len(ratios), labels


def availability_hours(value: str) -> float:
    numbers = [float(match) for match in re.findall(r"\d+(?:\.\d+)?", value)]
    return max(numbers) if numbers else 0.0


def score_pair(mentee: Applicant, mentor: Applicant) -> tuple[int, str]:
    interest_ratio, interest_matches = character_match_ratio(normalized_terms(mentee.interests), normalized_terms(mentor.interests))
    skill_ratio, skill_matches = character_match_ratio(normalized_terms(mentee.skills), normalized_terms(mentor.skills))
    timezone_gap = abs(mentee.timezone - mentor.timezone)
    availability_gap = abs(availability_hours(mentee.availability) - availability_hours(mentor.availability))
    timezone_score = max(0, 30 - timezone_gap * 3)
    availability_score = max(0, 25 - availability_gap * 2)
    interest_score = round(25 * interest_ratio)
    skill_score = round(20 * skill_ratio)
    total = min(100, round(timezone_score + availability_score + interest_score + skill_score))
    rationale = (
        f"timezone gap: {timezone_gap} hour(s); "
        f"weekly availability gap: {availability_gap:g} hour(s); "
        f"interest character matches: {', '.join(interest_matches) or 'none'}; "
        f"skill character matches: {', '.join(skill_matches) or 'none'}."
    )
    return total, rationale
