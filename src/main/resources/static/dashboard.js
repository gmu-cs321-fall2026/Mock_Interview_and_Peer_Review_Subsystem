const dashboardStats = document.getElementById("dashboardStats");
const readinessStats = document.getElementById("readinessStats");
const sessionHistory = document.getElementById("sessionHistory");
const sessionFilter = document.getElementById("sessionFilter");

let dashboardPairings = [];

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

        sessionHistory.innerHTML +=
            "<div class='card'>" +
                "<strong>Student " + partnerId + "</strong>" +
                "<p>" + formatTimestamp(pairing.scheduledFor) + "</p>" +
                "<small>Status: " + status + "</small>" +
            "</div>";
    }

    if (matchingCount === 0) {
        sessionHistory.innerHTML =
            "<p>No matching practice sessions.</p>";
    }
}

sessionFilter.addEventListener("change", loadSessionHistory);

loadDashboard();