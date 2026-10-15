# Fitness Coach Agent MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a polished, mobile-first fitness coach web application that works locally without credentials and adds OpenAI-backed coaching when an API key is supplied.

**Architecture:** A Next.js App Router application keeps workout state in a persisted Zustand store and isolates deterministic fitness logic in pure TypeScript modules. A server-only coach route validates requests with Zod, uses the OpenAI Responses API when configured, and falls back to local guidance otherwise.

**Tech Stack:** Node.js 22+, Next.js, React, TypeScript, Tailwind CSS, Zustand, Zod, OpenAI JavaScript SDK, Vitest, Testing Library, Playwright

**Spec:** `docs/superpowers/specs/2026-10-15-fitness-coach-agent-design.md`

## Global Constraints

- Chinese interface and Chinese setup documentation.
- Mobile-first PWA-compatible application with large tap targets and one-handed workout controls.
- The complete core flow must work without `OPENAI_API_KEY`.
- The model may select only known exercise identifiers and must never be the source of truth for workout state.
- Pain and emergency-style symptoms override all progression logic.
- No camera capture, medical diagnosis, rehabilitation prescription, payments, social features, or cloud synchronization in this release.
- Health and training data remain in browser storage in local demo mode.

## Review Focus

- Corrupt or old persisted browser state resets safely instead of crashing; pin this in Task 3 store tests.
- A profile whose equipment produces an empty exercise pool gets a recoverable explanation; pin this in Task 2 plan-engine tests.
- A refresh during an active rest period preserves the correct remaining time; pin this in Task 3 timer tests.
- An AI timeout or malformed response falls back to local coaching without losing the user's message; pin this in Task 5 route tests.
- Pain or emergency symptoms can never produce a load increase; pin this in Task 3 progression tests and Task 4 UI tests.

---

## File Map

- `src/domain/types.ts`: stable domain contracts shared by logic, storage, UI, and API.
- `src/domain/exercises.ts`: approved seeded exercise catalogue.
- `src/domain/plan-engine.ts`: deterministic weekly-plan generation and substitutions.
- `src/domain/progression.ts`: feedback safety classification and next-target rules.
- `src/domain/coach.ts`: local coach fallback and safe action contract.
- `src/store/use-fitness-store.ts`: persisted application state and workout transitions.
- `src/app/api/coach/route.ts`: server-only optional OpenAI integration.
- `src/components/*`: focused onboarding, plan, workout, summary, and coach components.
- `src/app/*`: shell, visual system, metadata, and page composition.
- `tests/*`: unit, store, route, and component verification.
- `e2e/core-flow.spec.ts`: onboarding-to-summary browser smoke test.

### Task 1: Project Foundation and Domain Contracts

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `playwright.config.ts`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Create: `src/domain/types.ts`, `src/domain/schemas.ts`
- Test: `tests/domain/schemas.test.ts`

**Interfaces:**
- Consumes: the approved design spec.
- Produces: `UserProfile`, `Exercise`, `TrainingPlan`, `PlanSession`, `PlannedExercise`, `WorkoutSession`, `SetLog`, `ExerciseFeedback`, `CoachRequest`, and `CoachResponse`; Zod schemas with matching property names.

- [ ] **Step 1: Initialize the package and write failing schema tests** for valid profiles, invalid training-day ranges, and discriminated coach safety levels.
- [ ] **Step 2: Run `npm test -- tests/domain/schemas.test.ts`** and verify it fails because the schemas do not exist.
- [ ] **Step 3: Implement the shared types and schemas**, configure Next.js/Tailwind/Vitest, and render a minimal Chinese shell.
- [ ] **Step 4: Run `npm test -- tests/domain/schemas.test.ts` and `npm run typecheck`** and verify both pass.
- [ ] **Step 5: Initialize Git and commit** with `chore: scaffold fitness coach application`.

### Task 2: Exercise Catalogue and Plan Engine

**Files:**
- Create: `src/domain/exercises.ts`
- Create: `src/domain/plan-engine.ts`
- Test: `tests/domain/plan-engine.test.ts`

**Interfaces:**
- Consumes: `UserProfile`, `Exercise`, and `TrainingPlan` from Task 1.
- Produces: `EXERCISES: Exercise[]`, `getExercise(id: string): Exercise | undefined`, `generatePlan(profile: UserProfile): TrainingPlan`, and `findSubstitute(exerciseId: string, profile: UserProfile, excludedIds?: string[]): Exercise | undefined`.

- [ ] **Step 1: Write failing tests** proving the catalogue has at least 24 unique exercises, generated plans contain only known compatible IDs, 2-5 day templates respect time/equipment, injury exclusions are honored, and an empty pool returns a recoverable plan warning.
- [ ] **Step 2: Run `npm test -- tests/domain/plan-engine.test.ts`** and verify the new tests fail.
- [ ] **Step 3: Seed the reviewed catalogue** with warm-up, legs, glutes, push, pull, shoulders, arms, and core movements plus vector illustration metadata.
- [ ] **Step 4: Implement template-based generation and same-pattern substitutions** with explicit volume and duration caps.
- [ ] **Step 5: Run the plan-engine tests and typecheck**, then commit with `feat: add exercise catalogue and plan engine`.

### Task 3: Workout State, Rest Timer, Safety, and Progression

**Files:**
- Create: `src/domain/progression.ts`
- Create: `src/domain/coach.ts`
- Create: `src/store/use-fitness-store.ts`
- Test: `tests/domain/progression.test.ts`
- Test: `tests/store/fitness-store.test.ts`

**Interfaces:**
- Consumes: Task 1 contracts and Task 2 plan/catalogue functions.
- Produces: `evaluateFeedback(feedback: ExerciseFeedback): SafetyLevel`, `nextTarget(input: ProgressionInput): ProgressionDecision`, `localCoachReply(request: CoachRequest): CoachResponse`, and `useFitnessStore` actions `saveProfile`, `createPlan`, `startWorkout`, `completeSet`, `submitFeedback`, `replaceExercise`, `finishWorkout`, `resetAll`.

- [ ] **Step 1: Write failing progression tests** for completed low-RPE work, high RPE, missed repetitions, joint pain, and emergency symptoms; assert pain never increases load.
- [ ] **Step 2: Write failing store tests** for corrupt persisted data recovery, workout start, completed-set logging, timestamp-based rest restoration, replacement, finish, and reset.
- [ ] **Step 3: Run both test files** and verify they fail on missing implementations.
- [ ] **Step 4: Implement pure progression and local-coach functions** with bounded, explained decisions.
- [ ] **Step 5: Implement the persisted Zustand store** with versioned storage validation and deterministic transitions.
- [ ] **Step 6: Run both test files and typecheck**, then commit with `feat: add workout state and progression`.

### Task 4: Mobile Product Experience

**Files:**
- Create: `src/components/app-shell.tsx`
- Create: `src/components/onboarding-flow.tsx`
- Create: `src/components/dashboard.tsx`
- Create: `src/components/plan-view.tsx`
- Create: `src/components/workout-runner.tsx`
- Create: `src/components/exercise-visual.tsx`
- Create: `src/components/rest-timer.tsx`
- Create: `src/components/feedback-sheet.tsx`
- Create: `src/components/workout-summary.tsx`
- Create: `src/components/coach-panel.tsx`
- Modify: `src/app/page.tsx`, `src/app/globals.css`
- Test: `tests/components/onboarding-flow.test.tsx`
- Test: `tests/components/workout-runner.test.tsx`

**Interfaces:**
- Consumes: `useFitnessStore`, `EXERCISES`, and domain types from Tasks 1-3.
- Produces: a routed state experience inside `AppShell` with `onboarding`, `dashboard`, `plan`, `workout`, `summary`, and `coach` surfaces.

- [ ] **Step 1: Write failing onboarding tests** for required fields, training-day bounds, and safety acknowledgement.
- [ ] **Step 2: Write failing workout tests** for one-tap set completion, rest display, feedback submission, exercise replacement, and visible stop guidance after pain.
- [ ] **Step 3: Run the component tests** and verify they fail on missing components.
- [ ] **Step 4: Implement the intentional graphite/lime visual system** with responsive typography, reusable controls, safe-area padding, motion reduction, and accessible focus states.
- [ ] **Step 5: Implement onboarding, dashboard, and plan surfaces** wired to the store.
- [ ] **Step 6: Implement workout, timer, feedback, summary, and coach surfaces** with one-handed controls and original SVG exercise visuals.
- [ ] **Step 7: Run component tests, full unit suite, and typecheck**, then commit with `feat: build mobile fitness coach experience`.

### Task 5: Optional OpenAI Coach Route

**Files:**
- Create: `src/app/api/coach/route.ts`
- Create: `src/lib/openai-coach.ts`
- Create: `.env.example`
- Modify: `src/components/coach-panel.tsx`
- Test: `tests/api/coach-route.test.ts`

**Interfaces:**
- Consumes: `CoachRequestSchema`, `CoachResponseSchema`, and `localCoachReply`.
- Produces: `POST /api/coach` and `getCoachResponse(request: CoachRequest): Promise<CoachResponse>`.

- [ ] **Step 1: Write failing route tests** for invalid input, missing API key, OpenAI success, timeout, and malformed structured output; fallback responses must preserve user intent and safety level.
- [ ] **Step 2: Run `npm test -- tests/api/coach-route.test.ts`** and verify the route tests fail.
- [ ] **Step 3: Implement the server-only OpenAI client** using a strict response schema and minimal structured context.
- [ ] **Step 4: Implement route validation and deterministic fallback**, then connect the coach panel with loading and retry states.
- [ ] **Step 5: Run route tests, full unit suite, and typecheck**, then commit with `feat: add optional AI coaching`.

### Task 6: PWA, End-to-End Verification, and Handoff

**Files:**
- Create: `public/manifest.webmanifest`, `public/icon.svg`
- Create: `e2e/core-flow.spec.ts`
- Create: `README.md`
- Create: `outputs/使用说明.md`
- Modify: `src/app/layout.tsx`, `package.json`

**Interfaces:**
- Consumes: the completed application.
- Produces: installable metadata, an end-to-end regression test, and Chinese operator instructions for demo and AI modes.

- [ ] **Step 1: Write the failing Playwright smoke test** covering onboarding, plan creation, workout start, set completion, feedback, and summary without an API key.
- [ ] **Step 2: Run `npm run test:e2e`** and verify it fails before PWA/handoff wiring is complete.
- [ ] **Step 3: Add manifest, icon, metadata, demo reset controls, `.env` instructions, and complete Chinese usage documentation.**
- [ ] **Step 4: Run `npm test`, `npm run typecheck`, `npm run build`, and `npm run test:e2e`** and require zero failures.
- [ ] **Step 5: Start the production build and manually verify mobile and desktop layouts**, including refresh during a rest timer and the no-key coach fallback.
- [ ] **Step 6: Commit** with `docs: complete fitness coach handoff`.
