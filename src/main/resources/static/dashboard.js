const dashboardStats = document.getElementById("dashboardStats");
const readinessStats = document.getElementById("readinessStats");
const sessionHistory = document.getElementById("sessionHistory");
const recentFeedbackDiv = document.getElementById("recentFeedback");
const sessionFilter = document.getElementById("sessionFilter");

let dashboardPairings = [];
let dashboardFeedback = [];

async function loadDashboard() {
    const headers = {
        "X-User-Id": currentUserId
    };

    // Get the complete question bank.
    const questionsResponse =
        await fetch("/api/practice/questions");

    // Get the selected student's question statuses.
    const statusesResponse =
        await fetch("/api/practice/questions/statuses", {headers});

    // Get the selected student's full pairing history.
    const pairingsResponse =
        await fetch("/api/practice/dashboard/pairings", {headers});

    if (!questionsResponse.ok ||
        !statusesResponse.ok ||
        !pairingsResponse.ok) {
        dashboardStats.textContent = "Could not load dashboard.";
        return;
    }

    const questions = await questionsResponse.json();
    const statuses = await statusesResponse.json();
    dashboardPairings = await pairingsResponse.json();

    // Load feedback received by the current student.
    dashboardFeedback = [];

    const feedbackResponse = await fetch("/api/practice/feedback", {
        headers: {
            "X-User-Id": currentUserId
        }
    });

    if (feedbackResponse.ok) {
        const allFeedback = await feedbackResponse.json();

        for (let i = 0; i < allFeedback.length; i++) {
            const feedback = allFeedback[i];

            if (feedback.partnerUserId === currentUserId &&
                feedback.authorUserId !== currentUserId) {
                dashboardFeedback.push(feedback);
            }
        }
    }

    // Count question readiness.
    let done = 0;
    let review = 0;
    let notReviewed = 0;

    for (let i = 0; i < questions.length; i++) {
        const status = statuses[questions[i].id] || "NOT_REVIEWED";

        if (status === "DONE") {
            done++;
        } else if (status === "REVIEW") {
            review++;
        } else {
            notReviewed++;
        }
    }

    // Count interview sessions.
    let completed = 0;
    let upcoming = 0;

    for (let i = 0; i < dashboardPairings.length; i++) {
        const pairing = dashboardPairings[i];

        if (pairing.completed) {
            completed++;
        } else if (!pairing.canceled &&
                   !pairing.interviewResult &&
                   pairing.scheduledFor > Date.now()) {
            upcoming++;
        }
    }

    // Display the summary cards.
    dashboardStats.innerHTML =
        "<div class='card'><strong>" + completed +
        "</strong>Completed Interviews</div>" +

        "<div class='card'><strong>" + upcoming +
        "</strong>Upcoming Interviews</div>" +

        "<div class='card'><strong>" + done + "/" +
        questions.length + "</strong>Questions Done</div>";

    // Display the question status breakdown.
    readinessStats.textContent =
        "Done: " + done +
        " | Review: " + review +
        " | Not Reviewed: " + notReviewed;

    loadSessionHistory();
    renderRecentFeedback();
}

function getSessionStatus(pairing) {
    if (pairing.canceled) {
        return "Cancelled";
    }

    if (pairing.completed) {
        return "Completed";
    }

    if (pairing.interviewResult) {
        return "Not Completed";
    }

    if (pairing.scheduledFor <= Date.now()) {
        return "Awaiting Confirmation";
    }

    return "Upcoming";
}

function loadSessionHistory() {
    sessionHistory.innerHTML = "";

    let matchingCount = 0;

    for (let i = 0; i < dashboardPairings.length; i++) {
        const pairing = dashboardPairings[i];
        const status = getSessionStatus(pairing);

        if (sessionFilter.value !== "all" &&
            sessionFilter.value !== status) {
            continue;
        }

        matchingCount++;

        // Determine which student is the practice partner.
        let partnerId = pairing.requesterUserId;

        if (currentUserId === pairing.requesterUserId) {
            partnerId = pairing.partnerUserId;
        }

        // Find feedback for this specific interview.
        let feedbackHtml = "";

        for (let j = 0; j < dashboardFeedback.length; j++) {
            const feedback = dashboardFeedback[j];

            if (feedback.pairingId === pairing.id &&
                feedback.authorUserId === partnerId) {

                feedbackHtml =
                    "<div class='dashboard-feedback'>" +
                        "<strong>Feedback from Student " + partnerId + "</strong>" +
                        "<p>" + escapeHtml(feedback.text) + "</p>" +
                    "</div>";

                break;
            }
        }

        sessionHistory.innerHTML +=
            "<div class='card'>" +
                "<strong>Student " + partnerId + "</strong>" +
                "<p>" + formatTimestamp(pairing.scheduledFor) + "</p>" +
                "<small>Status: " + status + "</small>" +
                feedbackHtml +
                "</div>";
    }

    if (matchingCount === 0) {
        sessionHistory.innerHTML =
            "<p>No matching practice sessions.</p>";
    }
}
//produced by chatGPT
function getStarRating(rating){
    if(rating<1||rating>5){
        return "Not rated";
    }
    let stars ="";
    for (let i =1;i<=5;i++){
        if(i<=rating){
            stars+="★";
        }else{
            stars+="☆"
        }
    }
    return stars;
}

function renderRecentFeedback() {
    recentFeedbackDiv.innerHTML = "";

    if (dashboardFeedback.length === 0) {
        recentFeedbackDiv.innerHTML = "<p>No feedback received yet.</p>";
        return;
    }

    // Most recent feedback first.
    const sortedFeedback = dashboardFeedback.slice();

    sortedFeedback.sort(function(a, b) {
        return b.timestamp - a.timestamp;
    });

    // Display at most three feedback entries.
    const limit = Math.min(3, sortedFeedback.length);

    for (let i = 0; i < limit; i++) {
        const feedback = sortedFeedback[i];

        let preview = feedback.text;

        if (preview.length > 180) {
            preview = preview.substring(0, 180) + "...";
        }

        recentFeedbackDiv.innerHTML +=
            "<div class='card'>" +
                "<strong>From Student " + feedback.authorUserId + "</strong>" +
                "<div class='feedback-stars'>"+getStarRating(feedback.rating)+"</div>"+
                "<small>Interview #" + feedback.pairingId +
                    " | " + formatTimestamp(feedback.timestamp) + "</small>" +
                "<p>" + escapeHtml(preview) + "</p>" +
            "</div>";
    }
}

sessionFilter.addEventListener("change", loadSessionHistory);

loadDashboard();