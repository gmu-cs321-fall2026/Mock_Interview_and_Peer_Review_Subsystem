const userIdInput = document.getElementById("userId");
const categorySelect = document.getElementById("category");
const questionsDiv = document.getElementById("questions");
const requestsDiv = document.getElementById("requests");
const message = document.getElementById("message");
const createRequestButton = document.getElementById("createRequest");


async function loadQuestions() {
    let url = "/api/practice/questions";
    if (categorySelect.value !== "") {
        url = url + "?category=" + categorySelect.value;
    }

    const response = await fetch(url);
    const questions = await response.json();

    questionsDiv.innerHTML = "";

    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionCard =
            "<div class='card'>" +
                "<div>" + question.text + "</div>" +
                "<small>" + question.category + "</small>" +
            "</div>";

        questionsDiv.innerHTML = questionsDiv.innerHTML + questionCard;
    }
}

async function loadRequests() {
    const response = await fetch("/api/practice/requests");
    const requests = await response.json();
    requestsDiv.innerHTML = "";

    if (requests.length === 0) {
        requestsDiv.innerHTML = "<p>No open requests.</p>";
        return;
    }


    for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        const ownRequest =
            Number(userIdInput.value) === request.requesterUserId;

        let requestCard = "<div class='card'>" + "Student " + request.requesterUserId;

        if (ownRequest) {
            requestCard = requestCard + "<p>This is your request.</p>";
        } else {
            requestCard = requestCard + "<button onclick='acceptRequest(" + request.id + ")'>Accept</button>";
        }
        requestCard = requestCard + "</div>";
        requestsDiv.innerHTML = requestsDiv.innerHTML + requestCard;
    }
}


async function createRequest() {
    const response = await fetch(
            "/api/practice/requests",
            {
                method: "POST",
                headers: {
                    "X-User-Id": userIdInput.value
                }
            }
        );
    const data =
        await response.json();
    if (!response.ok) {
        showMessage(data.error);
        return;
    }


    showMessage("Practice request created.");
    loadRequests();
}


async function acceptRequest(requestId) {
    const url = "/api/practice/requests/" + requestId + "/accept";

    const response =
        await fetch(url,
            {
                method: "POST",
                headers: {
                    "X-User-Id": userIdInput.value
                }
            }
        );

    const data =
        await response.json();

    if (!response.ok) {
        showMessage(data.error);
        return;
    }
    const successMessage = "Student " + data.requesterUserId + " paired with Student " + data.partnerUserId + ".";
    showMessage(successMessage);
    loadRequests();
}

function showMessage(text) {
    message.textContent = text;
}

categorySelect.addEventListener("change", loadQuestions);
createRequestButton.addEventListener("click", createRequest);
userIdInput.addEventListener("change", loadRequests);
loadQuestions();
loadRequests();