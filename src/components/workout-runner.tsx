"use client";

import { useEffect, useState } from "react";

import { getExercise } from "../domain/exercises";
import { useFitnessStore } from "../store/use-fitness-store";
import { ExerciseVisual } from "./exercise-visual";
import { FeedbackSheet } from "./feedback-sheet";
import { RestTimer } from "./rest-timer";

export function WorkoutRunner() {
  const workout = useFitnessStore((state) => state.activeWorkout);
  const completeSet = useFitnessStore((state) => state.completeSet);
  const submitFeedback = useFitnessStore((state) => state.submitFeedback);
  const replaceExercise = useFitnessStore((state) => state.replaceExercise);
  const finishWorkout = useFitnessStore((state) => state.finishWorkout);
  const planned = workout?.exercises[workout.currentExerciseIndex]?.planned;
  const exercise = planned ? getExercise(planned.exerciseId) : undefined;
  const performance = workout?.exercises[workout.currentExerciseIndex];
  const [weight, setWeight] = useState(planned?.suggestedWeightKg ?? 0);
  const [reps, setReps] = useState(planned?.repMax ?? 12);

  useEffect(() => {
    setWeight(planned?.suggestedWeightKg ?? 0);
    setReps(planned?.repMax ?? 12);
  }, [planned?.exerciseId, planned?.repMax, planned?.suggestedWeightKg]);

  if (!workout || !planned || !exercise || !performance) {
    return <div className="empty-state"><h2>没有进行中的训练</h2><p>返回计划页选择一次训练。</p></div>;
  }

  const completedSets = performance.setLogs.length;
  const readyForFeedback = completedSets >= planned.sets;
  const progress = ((workout.currentExerciseIndex + 1) / workout.exercises.length) * 100;

  return (
    <main className="workout-console">
      <header className="session-header">
        <div><span className="system-line">训练进行中</span><h1>{workout.sessionName}</h1></div>
        <div className="session-count">{String(workout.currentExerciseIndex + 1).padStart(2, "0")}<small>/{String(workout.exercises.length).padStart(2, "0")}</small></div>
      </header>
      <div className="progress-rail"><span style={{ width: `${progress}%` }} /></div>

      {workout.restEndsAt && <RestTimer restEndsAt={workout.restEndsAt} onSkip={() => useFitnessStore.setState({ activeWorkout: { ...workout, restEndsAt: undefined } })} />}

      <section className="active-exercise">
        <div className="exercise-stage"><ExerciseVisual exercise={exercise} /></div>
        <div className="exercise-data">
          <div className="exercise-kicker"><span>{exercise.primaryMuscles.join(" / ")}</span><span>目标 RPE {planned.targetRpe}</span></div>
          <h2 data-testid="current-exercise-name">{exercise.name}</h2>
          <p className="main-cue">{exercise.cues[0]}</p>
          <div className="cue-list">{exercise.cues.slice(1).map((cue) => <span key={cue}>{cue}</span>)}</div>
          <button className="text-action" type="button" onClick={() => replaceExercise(exercise.id)}>换个动作</button>
        </div>
      </section>

      {!readyForFeedback ? (
        <section className="set-console">
          <div className="set-readout">
            <div><span>重量 / kg</span><strong>{weight.toFixed(weight % 1 ? 1 : 0)}</strong><div className="stepper"><button type="button" aria-label="减少重量" onClick={() => setWeight(Math.max(0, weight - 2.5))}>−</button><button type="button" aria-label="增加重量" onClick={() => setWeight(weight + 2.5)}>＋</button></div></div>
            <div><span>次数</span><strong>{reps}</strong><div className="stepper"><button type="button" aria-label="减少次数" onClick={() => setReps(Math.max(1, reps - 1))}>−</button><button type="button" aria-label="增加次数" onClick={() => setReps(reps + 1)}>＋</button></div></div>
          </div>
          <div className="set-dots" aria-label={`已完成 ${completedSets} 组`}>{Array.from({ length: planned.sets }, (_, index) => <span className={index < completedSets ? "done" : ""} key={index}>{index + 1}</span>)}</div>
          <button className="complete-set" type="button" onClick={() => completeSet(weight, reps)}>完成第 {completedSets + 1} 组</button>
        </section>
      ) : (
        <FeedbackSheet onSubmit={submitFeedback} />
      )}

      <button className="finish-link" type="button" onClick={() => finishWorkout()}>提前结束并保存训练</button>
    </main>
  );
}
