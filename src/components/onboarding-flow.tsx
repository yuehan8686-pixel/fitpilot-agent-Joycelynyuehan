"use client";

import { useState, type FormEvent } from "react";

import type { Equipment, ExperienceLevel, Sex, UserProfile, WorkoutGoal } from "../domain/types";

type Props = {
  onComplete: (profile: UserProfile) => void;
};

const equipmentOptions: Array<{ value: Equipment; label: string }> = [
  { value: "bodyweight", label: "徒手" },
  { value: "dumbbell", label: "哑铃" },
  { value: "barbell", label: "杠铃" },
  { value: "bench", label: "训练凳" },
  { value: "cable", label: "绳索" },
  { value: "machine", label: "固定器械" },
  { value: "cardio", label: "有氧器械" },
];

export function OnboardingFlow({ onComplete }: Props) {
  const [name, setName] = useState("");
  const [age, setAge] = useState(28);
  const [sex, setSex] = useState<Sex>("female");
  const [heightCm, setHeightCm] = useState(168);
  const [weightKg, setWeightKg] = useState(58);
  const [experience, setExperience] = useState<ExperienceLevel>("beginner");
  const [goal, setGoal] = useState<WorkoutGoal>("build_muscle");
  const [trainingDays, setTrainingDays] = useState(3);
  const [sessionMinutes, setSessionMinutes] = useState(50);
  const [equipment, setEquipment] = useState<Equipment[]>([
    "bodyweight",
    "dumbbell",
    "cable",
    "machine",
  ]);
  const [injuries, setInjuries] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState("");

  function toggleEquipment(value: Equipment) {
    setEquipment((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return setError("请填写你的称呼");
    if (trainingDays < 2 || trainingDays > 5) return setError("每周训练天数应为 2–5 天");
    if (!acknowledged) return setError("请先确认安全说明");
    if (equipment.length === 0) return setError("请至少选择一种可用器械");

    setError("");
    onComplete({
      id: "local-user",
      name: name.trim(),
      age,
      sex,
      heightCm,
      weightKg,
      experience,
      goal,
      trainingDays,
      sessionMinutes,
      equipment,
      limitations: [],
      injuries: injuries
        .split(/[，,、]/)
        .map((item) => item.trim())
        .filter(Boolean),
      safetyAcknowledged: true,
    });
  }

  return (
    <main className="onboarding-shell">
      <header className="onboarding-intro">
        <div className="brand-lockup"><span className="brand-mark">FP</span><span>FITPILOT</span></div>
        <p className="system-line">私人训练终端 / 档案校准</p>
        <h1>先认识一下你，<br />再安排每一组。</h1>
        <p className="intro-copy">两分钟建立训练档案。所有数据默认只保存在这台设备。</p>
        <div className="calibration-track" aria-hidden="true"><span /><span /><span /><span /></div>
      </header>

      <form className="onboarding-form" onSubmit={submit} noValidate>
        <section className="form-block">
          <div className="section-index">01</div>
          <div>
            <h2>基本参数</h2>
            <p>用于确定训练量，不做身体评价。</p>
          </div>
          <label className="field field-wide">
            <span>你的称呼</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：小驼" />
          </label>
          <label className="field">
            <span>年龄</span>
            <input type="number" value={age} min={18} max={90} onChange={(event) => setAge(Number(event.target.value))} />
          </label>
          <label className="field">
            <span>性别</span>
            <select value={sex} onChange={(event) => setSex(event.target.value as Sex)}>
              <option value="female">女</option><option value="male">男</option><option value="other">其他</option>
            </select>
          </label>
          <label className="field">
            <span>身高 / cm</span>
            <input type="number" value={heightCm} onChange={(event) => setHeightCm(Number(event.target.value))} />
          </label>
          <label className="field">
            <span>体重 / kg</span>
            <input type="number" value={weightKg} onChange={(event) => setWeightKg(Number(event.target.value))} />
          </label>
        </section>

        <section className="form-block">
          <div className="section-index">02</div>
          <div><h2>训练任务</h2><p>告诉训练台你的目标和可用时间。</p></div>
          <label className="field">
            <span>主要目标</span>
            <select value={goal} onChange={(event) => setGoal(event.target.value as WorkoutGoal)}>
              <option value="build_muscle">增肌塑形</option><option value="lose_fat">减脂与体能</option><option value="general_fitness">基础健康</option>
            </select>
          </label>
          <label className="field">
            <span>训练经验</span>
            <select value={experience} onChange={(event) => setExperience(event.target.value as ExperienceLevel)}>
              <option value="beginner">新手</option><option value="intermediate">有规律训练</option><option value="advanced">熟练训练者</option>
            </select>
          </label>
          <label className="field">
            <span>每周训练天数</span>
            <input type="number" min={2} max={5} value={trainingDays} onChange={(event) => setTrainingDays(Number(event.target.value))} />
          </label>
          <label className="field">
            <span>每次时长 / min</span>
            <select value={sessionMinutes} onChange={(event) => setSessionMinutes(Number(event.target.value))}>
              <option value={30}>30</option><option value={40}>40</option><option value={50}>50</option><option value={60}>60</option><option value={75}>75</option>
            </select>
          </label>
        </section>

        <section className="form-block equipment-block">
          <div className="section-index">03</div>
          <div><h2>可用器械</h2><p>Agent 只会从你真实可用的器械中选动作。</p></div>
          <div className="chip-grid field-wide">
            {equipmentOptions.map((item) => (
              <button key={item.value} className={equipment.includes(item.value) ? "chip active" : "chip"} type="button" aria-pressed={equipment.includes(item.value)} onClick={() => toggleEquipment(item.value)}>{item.label}</button>
            ))}
          </div>
          <label className="field field-wide">
            <span>旧伤或需要避开的部位</span>
            <input value={injuries} onChange={(event) => setInjuries(event.target.value)} placeholder="例如：膝盖、肩膀；没有可留空" />
          </label>
        </section>

        <label className="safety-check">
          <input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} />
          <span>我了解：本工具不提供医疗诊断；出现胸部不适、眩晕、异常气短或明显疼痛时应停止训练。</span>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-action" type="submit">生成我的训练计划</button>
      </form>
    </main>
  );
}
