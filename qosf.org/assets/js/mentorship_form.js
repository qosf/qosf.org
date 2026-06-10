/*
 * mentorship_form.js
 * Handles client-side validation and submission of the QOSF mentorship
 * application forms to a Google Apps Script web app endpoint.
 *
 * The endpoint is injected by the page as window.MENTORSHIP_ENDPOINT.
 * If it is empty, the form runs in preview mode and does not submit.
 *
 * Distributed under terms of the CC0 license.
 */
(function () {
  "use strict";

  var form = document.getElementById("mentorship-form");
  if (!form) {
    return;
  }

  var statusEl = document.getElementById("form-status");
  var submitBtn = document.getElementById("submit-btn");
  var endpoint = (window.MENTORSHIP_ENDPOINT || "").trim();

  function setStatus(message, kind) {
    statusEl.className = "form-status is-" + kind;
    statusEl.textContent = message;
  }

  function collect() {
    var data = {};
    var interests = [];

    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name) {
        return;
      }
      if (el.type === "checkbox") {
        if (el.name === "interests") {
          if (el.checked) {
            interests.push(el.value);
          }
        } else if (el.checked) {
          data[el.name] = el.value;
        }
      } else {
        data[el.name] = el.value.trim();
      }
    });

    data.interests = interests.join(",");
    data.submitted_at = new Date().toISOString();
    return data;
  }

  function validate(data) {
    if (!data.name) { return "Please enter your name."; }
    if (!data.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) {
      return "Please enter a valid email address.";
    }
    if (!data.country) { return "Please enter your country."; }
    if (!data.timezone) { return "Please select your timezone."; }
    if (!data.level) { return "Please select your level."; }
    if (!data.interests) { return "Please select at least one interest."; }
    if (!data.availability) { return "Please enter your availability."; }
    if (data.role === "mentor") {
      if (!data.affiliation) { return "Please enter your affiliation."; }
      if (!data.capacity) { return "Please enter how many mentees you can take."; }
      if (!data.bio) { return "Please add a short bio."; }
    } else {
      if (!data.motivation) { return "Please tell us why you want to join."; }
    }
    if (!data.consent) { return "Please give consent to continue."; }
    return null;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var data = collect();
    var error = validate(data);
    if (error) {
      setStatus(error, "error");
      return;
    }

    if (!endpoint) {
      setStatus(
        "Preview mode: your entries are valid, but no endpoint is configured so nothing was sent.",
        "loading"
      );
      return;
    }

    submitBtn.disabled = true;
    setStatus("Submitting your application...", "loading");

    var body = new URLSearchParams(data);

    // Apps Script web apps redirect through googleusercontent.com; no-cors lets
    // the POST complete without the browser blocking on the opaque response.
    fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: body.toString()
    })
      .then(function () {
        form.reset();
        setStatus(
          "Thank you! Your application has been received. We'll be in touch by email.",
          "success"
        );
      })
      .catch(function () {
        setStatus(
          "Something went wrong sending your application. Please try again, or email " +
            (window.MENTORSHIP_CONTACT || "the organizers") + ".",
          "error"
        );
      })
      .then(function () {
        submitBtn.disabled = false;
      });
  });
})();
