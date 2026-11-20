# ChangeFlow (Demo)

A frontend-only demo of a change request portal: staff submit system change
requests, an approving officer, SA/PM and the General Manager review them, and
approved requests become REQ tickets that are tracked to completion. Built with
**React 18, Vite, Tailwind CSS and shadcn/ui**.

> Portfolio demo. **No backend.** All data comes from `src/mockData/`, every
> action updates an in-memory store (kept in sessionStorage for the tab), and
> nothing is sent anywhere. Emails and Jira are simulated.

## Features

- **New Request wizard** with rich-text fields, attachments, date picker and a review step.
- **My Requests** with status progress, activity timeline, attachments and edit/resubmit for returned CRs.
- **Inbox** for reviewers: For my action, In progress and Closed tabs with stat cards.
- **Approval flow**: approve, disapprove, accept, return (with remarks), claim and release REQ work.
- **REQ Tracker** (SA/PM): board and list views of linked REQ tickets by status.
- **Email decision page**: the one-click approve/return page an emailed link opens.
- **Chameleon assistant** with per-role reminders.

## Demo controls

The sidebar has a **Demo controls** button to:

- switch between **Requestor**, **SA / PM** and **General Manager**,
- open an email decision link for a CR waiting on an approver,
- reset the demo data.

## Getting started

```bash
npm install
npm run dev
```

The app opens straight into a signed-in demo session.

## Build

```bash
npm run build
npm run preview
```
