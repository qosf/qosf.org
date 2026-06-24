from __future__ import annotations

from datetime import date

from qosf_mentorship import Applicant, Match, Project, auto_pair_applicants, create_app, db, score_pair


def make_app():
    return create_app(
        {
            "TESTING": True,
            "WTF_CSRF_ENABLED": False,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "ADMIN_PASSWORD": "secret",
            "SEED_DEMO_DATA": False,
        }
    )


def login(client):
    return client.post("/login", data={"password": "secret"}, follow_redirects=True)


def test_homepage_exposes_application_and_timeline():
    app = make_app()
    response = app.test_client().get("/")
    assert response.status_code == 200
    assert b"Apply as mentee" in response.data
    assert b"Final presentations" in response.data


def test_application_storage_and_matching_score():
    app = make_app()
    client = app.test_client()
    mentee_data = {
        "name": "Ada Lovelace",
        "email": "ada@example.com",
        "affiliation": "QOSF University",
        "timezone": "1",
        "educational_level": "Masters",
        "interests": "quantum algorithms, qml",
        "skills": "Python, Qiskit",
        "availability": "5 hours/week",
        "motivation": "I want to contribute to open source quantum algorithm libraries.",
    }
    mentor_data = dict(mentee_data, name="Grace Hopper", email="grace@example.com", timezone="2", max_mentees="2")
    client.post("/apply/mentee", data=mentee_data)
    client.post("/apply/mentor", data=mentor_data)
    with app.app_context():
        mentee = Applicant.query.filter_by(role="mentee").one()
        mentor = Applicant.query.filter_by(role="mentor").one()
        score, rationale = score_pair(mentee, mentor)
        assert score >= 70
        assert "quantum algorithms" in rationale
        assert "weekly availability gap" in rationale


def test_admin_dashboard_renders_auto_pair_form_with_csrf_helper():
    app = make_app()
    client = app.test_client()
    login(client)
    response = client.get("/admin")
    assert response.status_code == 200
    assert b"csrf_token" in response.data
    assert b"Automatically pair cohort" in response.data
    assert b"Database maintenance" in response.data
    assert b"minus buttons" in response.data


def test_matching_dashboard_renders_auto_pair_form_with_csrf_helper():
    app = make_app()
    client = app.test_client()
    login(client)
    response = client.get("/matching")
    assert response.status_code == 200
    assert b"csrf_token" in response.data
    assert b"Automatically pair cohort" in response.data


def test_admin_can_confirm_match_and_create_project():
    app = make_app()
    client = app.test_client()
    with app.app_context():
        mentee = Applicant(role="mentee", name="Mentee", email="m@example.com", timezone=0, educational_level="PhD", interests="qec", skills="Python", availability="4h", affiliation="Lab", motivation="Open source quantum error correction work")
        mentor = Applicant(role="mentor", name="Mentor", email="mentor@example.com", timezone=1, educational_level="Professional", interests="qec", skills="Python", availability="4h", affiliation="Lab", motivation="I mentor PhD contributors", max_mentees=1)
        db.session.add_all([mentee, mentor])
        db.session.commit()
        mentee_id, mentor_id = mentee.id, mentor.id
    login(client)
    response = client.post("/matches", data={"mentee_id": mentee_id, "mentor_id": mentor_id}, follow_redirects=True)
    assert response.status_code == 200
    with app.app_context():
        project = Project.query.one()
        assert project.next_deadline >= date.today()
        assert "mentorship project" in project.title


def test_demo_dataset_contains_requested_applicants():
    app = create_app(
        {
            "TESTING": True,
            "WTF_CSRF_ENABLED": False,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "ADMIN_PASSWORD": "secret",
            "SEED_DEMO_DATA": True,
        }
    )
    with app.app_context():
        assert Applicant.query.filter_by(role="mentee").count() == 11
        assert Applicant.query.filter_by(role="mentor").count() == 8
        assert Applicant.query.filter(Applicant.skills.ilike("%Qiskit%")).count() > 1
        assert Applicant.query.filter(Applicant.interests.ilike("%Quantum algorithms%")).count() > 1


def test_automatic_pairing_creates_capacity_limited_projects():
    app = create_app(
        {
            "TESTING": True,
            "WTF_CSRF_ENABLED": False,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "ADMIN_PASSWORD": "secret",
            "SEED_DEMO_DATA": True,
        }
    )
    with app.app_context():
        created = auto_pair_applicants()
        db.session.commit()
        assert len(created) == 11
        assert Match.query.count() == 11
        assert Project.query.count() == 11
        assert all(match.score > 0 for match in Match.query.all())


def test_admin_can_delete_individual_applicants_and_projects():
    app = create_app(
        {
            "TESTING": True,
            "WTF_CSRF_ENABLED": False,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "ADMIN_PASSWORD": "secret",
            "SEED_DEMO_DATA": True,
        }
    )
    client = app.test_client()
    login(client)
    with app.app_context():
        auto_pair_applicants()
        db.session.commit()
        project_id = Project.query.first().id
        mentee_id = Applicant.query.filter_by(role="mentee").first().id
        mentor_id = Applicant.query.filter_by(role="mentor").first().id
        assert Applicant.query.filter_by(role="mentee").count() == 11
        assert Applicant.query.filter_by(role="mentor").count() == 8
        assert Match.query.count() == 11
        assert Project.query.count() == 11

    client.post(f"/admin/projects/{project_id}/delete")
    with app.app_context():
        assert Project.query.get(project_id) is None
        assert Project.query.count() == 10
        assert Match.query.count() == 10

    client.post(f"/admin/applicants/{mentee_id}/delete")
    with app.app_context():
        assert Applicant.query.get(mentee_id) is None
        assert Applicant.query.filter_by(role="mentee").count() == 10
        assert Project.query.filter(Project.match.has(mentee_id=mentee_id)).count() == 0
        assert Match.query.filter_by(mentee_id=mentee_id).count() == 0

    client.post(f"/admin/applicants/{mentor_id}/delete")
    with app.app_context():
        assert Applicant.query.get(mentor_id) is None
        assert Applicant.query.filter_by(role="mentor").count() == 7
        assert Project.query.filter(Project.match.has(mentor_id=mentor_id)).count() == 0
        assert Match.query.filter_by(mentor_id=mentor_id).count() == 0
