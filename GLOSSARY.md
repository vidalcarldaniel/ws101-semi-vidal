# GLOSSARY

Domain vocabulary for Momentum. Definitions only — no implementation details.

- **Goal** — A commitment the user wants to achieve. Has an owner, a title, and an exact deadline (a date **and** time). The unit of work the system is built around.
- **Deadline** — The instant (`due_at`) a Goal is due. Reaching it triggers the *deadline alarm*.
- **Reminder window** — The span before the Deadline during which the *reminder alarm* is armed (configured per Goal, from "no reminder" up to 7 days before).
- **Alarm** — An audible + visual alert raised when the Reminder window opens or the Deadline is reached. Alarms have two kinds:
  - **Reminder alarm** — fires when the Reminder window opens.
  - **Deadline alarm** — fires when the Deadline passes and the Goal is still unfinished.
- **Fired alarm** — An Alarm that has rung. Each (Goal, kind) combination fires **once**; a fired alarm is remembered in the notification history.
- **Subtask** — A step inside a Goal. Optional; a Goal may have none. Completing Subtasks fills the Goal's progress bar but does not complete the Goal itself.
- **Progress** — The proportion of a Goal's Subtasks that are done.
- **Active Goal** — A Goal that is neither *completed* nor *cancelled* (i.e. *pending* or *in progress*).
- **Overdue** — An Active Goal whose Deadline is in the past.
- **Completion rate** — Share of all of a user's Goals that are completed.
- **Owner** — The authenticated user a row belongs to. Owners are the only subjects of access control.
