# Mock Interview and Peer Review Subsystem

This repository contains the Mock Interview and Peer Review subsystem for the CareerLaunch project. The subsystem is built with Java and Spring Boot and includes a small HTML/CSS/JavaScript frontend.

The current version supports interview question browsing, practice partner requests and pairings, demo user accounts with student/admin roles, question suggestions, and admin review of submitted questions.

## Interview Questions

Users can:

- View the full interview questions list.
- Filter questions by category
- Suggest a new interview question.

Repo starts with 25 seeded questions if no saved question file exists.

## Practice Requests and Pairings

Students can:

- Create a practice request.
- View open practice requests.
- Accept another user's request.
- View their accepted practice pairings.
- Filter pairings by requests they created or requests they accepted.
- View the time a request was created and accepted.

A user cannot accept their own practice request, and a request cannot be accepted after it is no longer open.

Admins can view all practice pairings.

## Demo Users and Roles

The current version contains four demo users:

| User ID | Name | Role |
| --- | --- | --- |
| 101 | Student 1 | STUDENT |
| 102 | Student 2 | STUDENT |
| 103 | Student 3 | STUDENT |
| 104 | Admin | ADMIN |

The frontend provides buttons for switching between these users. The selected user is saved in browser `localStorage`, so the same user remains selected when moving between pages.

API requests that need a user identity send the selected ID using the `X-User-Id` request header.

## Question Suggestions and Admin Review

Students can submit new interview questions from the question suggestion page.

Student submissions:

1. Are validated for question text and category.
2. Begin with a `PENDING` status.
3. Can be accepted or rejected by an admin.

Admin submissions are automatically accepted and added directly to the interview question list.

Admins can also view all submitted questions and accept or reject pending submissions.

## REST API

All routes are under `/api/practice`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/questions` | Returns all interview questions or filters by the optional `category` parameter. |
| GET | `/requests` | Returns currently open practice requests. |
| POST | `/requests` | Creates a practice request for the current user. |
| POST | `/requests/{id}/accept` | Accepts an open practice request. |
| GET | `/pairings` | Returns pairings involving the current user. |
| GET | `/admin/pairings` | Returns all pairings. Admin only. |
| GET | `/users` | Returns the demo users. |
| POST | `/question-requests` | Submits a new interview question. |
| GET | `/admin/question-requests` | Returns submitted question requests. Admin only. |
| POST | `/admin/question-requests/{id}/accept` | Accepts a pending question request. Admin only. |
| POST | `/admin/question-requests/{id}/reject` | Rejects a pending question request. Admin only. |

For endpoints that depend on the current user, the request uses:

```text
X-User-Id
```

Example:

```text
X-User-Id: 101
```

## Data Storage

The subsystem creates a `data` directory next to the location where the server is run.

The following files are used for persistent JSON storage:

```text
data/questions.json
data/question_requests.json
```

Interview questions and submitted question requests are restored from these files when the application starts.

Practice requests, pairings, and demo users are currently stored in memory. This means practice requests and pairings are reset when the application is restarted.

## Running the Application

From the repository root, start the Spring Boot application with Maven:

```powershell
mvn spring-boot:run
```

Then open:

```text
http://localhost:8080/
```

The main pages are:

```text
http://localhost:8080/index.html
http://localhost:8080/requests.html
http://localhost:8080/requestQuestion.html
```

To stop the application, press:

```text
Ctrl+C
```

## Compiling

To clean and compile the project:

```powershell
mvn clean compile
```
