# MEMORY

Standing rules for working in this project. These are mandatory.

## Rules

1. **Never commit or push without an explicit instruction.**
   Do not run `git commit` or `git push` unless told to in the moment. This
   applies even during `/feature finish` — confirm before each commit and each
   push. Approving a code change (e.g. saying "yes" to a fix) is not approval
   to commit or push it.

2. **Never hardcode anything unless told to.**
   Do not invent values (coordinates, sizes, offsets, z-index, camera configs,
   colors, magic numbers, fallbacks, etc.). Use existing design tokens, data,
   and config. When the user supplies exact values, use them verbatim. When a
   value is otherwise needed, stop and ask instead of inventing one.
