# Fitness Coach Agent MVP Design

## Goal

Build a mobile-first, locally runnable fitness coach agent that reproduces the complete workflow demonstrated in the referenced video: onboarding, plan generation, exercise guidance, workout execution, set logging, rest timing, perceived-exertion and pain feedback, workout summary, and next-session adjustment.

The first release is a demonstrable MVP for healthy adults doing gym-based resistance training. It is not a medical device, rehabilitation product, or substitute for a qualified trainer.

## Delivery Shape

- A single Next.js TypeScript application.
- Mobile-first responsive interface installable as a PWA-compatible web app.
- Local demo persistence so the product works immediately after installation.
- Optional OpenAI integration configured through an environment variable.
- Rule-based plan generation and adjustment when no API key is supplied.
- Seeded, reviewed exercise catalogue with original vector illustrations rather than copied third-party videos.
- Chinese user interface and Chinese setup instructions.

## User Flow

1. The user completes a short profile covering age, sex, height, weight, experience, goal, available training days, session duration, equipment, and injuries or limitations.
2. The application runs deterministic safety checks and creates a weekly plan using the approved exercise catalogue.
3. The user opens today's session and sees warm-up guidance followed by ordered exercises.
4. Each exercise shows target muscles, form cues, common errors, sets, repetitions, target RPE, rest duration, and an illustration.
5. The user records weight and repetitions, completes a set, and receives a rest timer.
6. After an exercise, the user records RPE, target-muscle sensation, pain, compensation, and an optional note.
7. The application creates a workout summary and applies bounded progression rules to the next session.
8. A coach chat panel can explain the plan, replace an exercise, and answer questions using the current profile and session context.

## Architecture

### Client

- Next.js App Router and React client components.
- TypeScript domain models and Zod runtime validation.
- Tailwind CSS for responsive styling.
- Zustand store with local persistence for the demo.
- All workout-state transitions are deterministic client actions so poor connectivity cannot lose an active workout.

### Server

- Next.js route handlers expose `/api/coach`.
- When `OPENAI_API_KEY` is configured, the route uses the OpenAI Responses API with structured JSON output.
- When no key is configured, the route returns deterministic, context-aware guidance so every core flow remains usable.
- API keys never reach the browser.

### Agent Boundary

The model is not the source of truth. It can recommend actions only through a constrained response contract:

- `message`: concise user-facing coaching text.
- `suggestedActions`: optional actions such as replacing one exercise or reducing the next target.
- `safetyLevel`: `normal`, `caution`, or `stop`.

Plan generation and progression are validated against the exercise catalogue and safety rules. Unknown exercise identifiers are rejected.

## Core Modules

### Profile and Safety

- Stores user preferences and constraints.
- Flags current pain, pregnancy, recent surgery, cardiovascular symptoms, or conditions requiring professional clearance.
- Stop-level symptoms produce a non-dismissible recommendation to stop the workout and seek appropriate professional help.

### Exercise Catalogue

- Contains at least 24 common movements covering legs, glutes, push, pull, shoulders, arms, core, and warm-up.
- Every exercise has equipment, difficulty, primary muscles, instructions, cues, mistakes, substitutions, and pain warnings.

### Plan Engine

- Creates 2-5 weekly sessions according to goal, experience, session duration, equipment, and limitations.
- Uses templates for full-body, upper/lower, and push-pull-legs schedules.
- Selects only catalogue exercises.
- Caps volume and session duration for the MVP.

### Workout Runner

- One active exercise at a time.
- Editable load and repetitions.
- Complete-set action and rest countdown.
- Previous performance is visible.
- Exercise replacement preserves muscle group and compatible equipment.
- Workout state persists after page refresh.

### Feedback and Progression

- Records RPE, target-muscle sensation, compensation, and pain.
- Pain always overrides progression.
- Low RPE plus complete repetitions across repeated exposures permits a small load increase.
- High RPE or missed repetitions holds or reduces the target.
- All adjustments are explained in the workout summary.

### Coach Chat

- Reads the current profile, plan, workout history, and active exercise.
- Can explain recommendations and suggest bounded changes.
- Cannot diagnose, prescribe rehabilitation, or claim certainty about technique without visual evidence.

## Data Model

The local store contains:

- `profile`
- `exerciseCatalog`
- `activePlan`
- `workoutSessions`
- `activeWorkout`
- `coachMessages`
- `settings`

Each workout contains exercise performances; each performance contains set logs and one feedback record. Stable identifiers allow later migration to Supabase tables without changing the UI contracts.

## Error Handling

- Invalid stored data is discarded and reseeded safely.
- Agent network failures fall back to local coaching.
- A missing API key is treated as a supported demo mode, not an error.
- Refreshing or closing the page preserves the active workout.
- Unsupported equipment or an empty exercise pool produces a clear recovery action.
- The timer is timestamp-based so background tabs do not make it drift.

## Safety and Privacy

- Health information remains in browser storage in demo mode.
- The UI explains that clearing browser data removes the local profile and history.
- Only the minimal structured context is sent to OpenAI when integration is enabled.
- No camera or raw video is captured in this release.
- Pain is kept distinct from normal exertion.
- Chest discomfort, faintness, unusual breathlessness, or other emergency-style symptoms trigger stop guidance rather than training advice.

## Visual Direction

- Calm dark graphite background with warm lime accents inspired by training equipment displays.
- Large tap targets and high contrast for use between sets.
- Workout runner prioritizes one-handed operation.
- Clear numeric hierarchy for load, repetitions, RPE, and rest time.
- Avoid generic dashboard styling; the interface should feel like a focused piece of gym equipment.

## Verification

- Unit tests for plan selection, substitutions, progression, and safety rules.
- Component tests for onboarding validation and set completion.
- End-to-end smoke test covering onboarding through workout summary.
- Production build and type checking.
- Manual checks at narrow mobile and desktop widths.
- Verify a complete core flow works without an API key.

## Explicitly Deferred

- Camera-based pose estimation and repetition counting.
- Native iOS or Android applications.
- Social features, subscriptions, payments, coach marketplaces, and nutrition prescriptions.
- Medical or rehabilitation plans.
- Cloud synchronization and multi-device accounts; the data contracts remain migration-ready for Supabase.
