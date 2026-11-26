# Independent review

Review the exact base/head and the request or task. Start with the intended outcome, affected contracts and claimed verification, then compare the actual diff. Missing formatting or an inapplicable section is not a defect. Use the relevant repository rules and known findings; do not import another project's architecture or update policy during a review.

Trace user-visible behavior and layer invariants through callers, state changes and failure handling. For coupled repositories or rolling upgrades, check old consumer/new producer and new consumer/old producer. A narrowed contract needs evidence that its compatible expansion is already in place before it ships. A missing required counterpart or prerequisite blocks acceptance, not the rest of the review.

Each finding gives `path:line`, a reachable scenario, expected and actual outcome, severity and how to check it. Static findings need a concrete contract and execution path. For alleged runtime regressions, use allowed focused evidence and compare base and result when needed; account for errors absorbed by infrastructure and label unverified outcomes as hypotheses. A regression check must be able to fail without the fix. Reuse proven evidence for the same snapshot. Do not run restricted checks without authorization; name the exact missing check and owner.

Return blocking and other findings, the checked snapshot, coverage and gaps. Separate preference from defect. Do not edit, post comments or merge based on a review assignment alone. A clean review is not release or deployment acceptance.
