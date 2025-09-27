# PR Draft: Amend Constitution to v2.3.1

Branch: docs/constitution/v2.3.1
Commit: docs: amend constitution to v2.3.1 (implement P1–P4, add hosting & governance guidance)

## Summary
This PR updates the project constitution to v2.3.1 and implements the user's
four core principles for the Threat Intelligence Dashboard:

- P1. Data Integrity & Timeliness
- P2. Defensive Hosting
- P3. Schema Flexibility
- P4. Tool Utilization

It also adds governance and deployment guidance, and updates the plan template
reference to the new constitution version.

## Files changed (summary)
- `.specify/memory/constitution.md` — updated full constitution, added Sync Impact Report
- `.specify/templates/plan-template.md` — updated embedded constitution version reference
- `.specify/templates/agent-file-template.md` — appended short constitution summary

## Checklist for reviewers
- [ ] Confirm RATIFIED date (currently set to 2025-09-27). If this is not the
      intended ratification date, update before merge.
- [ ] Confirm that the Student Pack hosting references (DigitalOcean, MongoDB
      Atlas, GitHub Pages/Vercel) are acceptable to the project maintainers.
- [ ] Run repository-wide search for references to older constitution versions
      and update if necessary.
- [ ] Confirm no CI or automation relies on the old version string.
- [ ] Merge when at least two maintainers approve and automated checks pass.

## Suggested reviewers
- @maintainer-sys (systems/security)
- @maintainer-frontend (frontend/hosting)

## Notes to committer
- Create branch `docs/constitution/v2.3.1`, commit the changes, push, and open the
  PR with this description.
- If you would like, I can create the branch and push the commit and open the
  PR text for you (requires repository push permissions).
