import type { Equipment, Exercise, ExerciseCategory, ExperienceLevel } from "./types";

type Seed = {
  id: string;
  name: string;
  shortName?: string;
  category: ExerciseCategory;
  pattern: string;
  equipment: Equipment[];
  requiredEquipment?: Equipment[];
  muscles: string[];
  secondary?: string[];
  difficulty?: ExperienceLevel;
  contraindications?: string[];
  substitutions?: string[];
  weight?: number;
  cues?: string[];
  mistakes?: string[];
};

function defineExercise(seed: Seed): Exercise {
  return {
    id: seed.id,
    name: seed.name,
    shortName: seed.shortName ?? seed.name,
    category: seed.category,
    movementPattern: seed.pattern,
    equipment: seed.equipment,
    requiredEquipment: seed.requiredEquipment,
    difficulty: seed.difficulty ?? "beginner",
    primaryMuscles: seed.muscles,
    secondaryMuscles: seed.secondary ?? [],
    setup: ["先用轻重量确认活动范围", "保持呼吸自然，动作全程可控"],
    cues: seed.cues ?? ["稳定躯干", "匀速完成向心与离心阶段"],
    mistakes: seed.mistakes ?? ["借力过多", "为了重量牺牲动作幅度"],
    substitutionIds: seed.substitutions ?? [],
    contraindications: seed.contraindications ?? [],
    illustration: seed.pattern,
    defaultWeightKg: seed.weight ?? 0,
  };
}

export const EXERCISES: Exercise[] = [
  defineExercise({ id: "treadmill-walk", name: "跑步机快走", category: "warmup", pattern: "walk", equipment: ["cardio"], muscles: ["全身"], cues: ["保持能正常说话的强度", "逐步提高速度"], weight: 0 }),
  defineExercise({ id: "dynamic-warmup", name: "动态全身热身", category: "warmup", pattern: "mobility", equipment: ["bodyweight"], muscles: ["全身"], cues: ["从小幅度开始", "不要追求拉伸疼痛"], weight: 0 }),
  defineExercise({ id: "bodyweight-squat", name: "徒手深蹲", category: "legs", pattern: "squat", equipment: ["bodyweight"], muscles: ["股四头肌", "臀大肌"], contraindications: ["膝盖"], substitutions: ["dumbbell-goblet-squat", "machine-leg-press"], cues: ["膝盖沿脚尖方向", "脚掌三点稳定着地"], weight: 0 }),
  defineExercise({ id: "dumbbell-goblet-squat", name: "高脚杯深蹲", category: "legs", pattern: "squat", equipment: ["dumbbell"], muscles: ["股四头肌", "臀大肌"], contraindications: ["膝盖"], substitutions: ["bodyweight-squat", "machine-leg-press"], cues: ["哑铃贴近胸前", "下蹲时保持躯干稳定"], weight: 8 }),
  defineExercise({ id: "machine-leg-press", name: "坐姿腿举", category: "legs", pattern: "squat", equipment: ["machine"], muscles: ["股四头肌", "臀大肌"], contraindications: ["膝盖", "腰部"], substitutions: ["dumbbell-goblet-squat", "bodyweight-squat"], cues: ["腰背贴稳靠垫", "膝盖不要锁死"], weight: 30 }),
  defineExercise({ id: "dumbbell-rdl", name: "哑铃罗马尼亚硬拉", category: "glutes", pattern: "hinge", equipment: ["dumbbell"], muscles: ["腘绳肌", "臀大肌"], contraindications: ["腰部"], substitutions: ["barbell-rdl", "glute-bridge"], cues: ["髋部向后移动", "哑铃贴近腿部"], weight: 10 }),
  defineExercise({ id: "barbell-rdl", name: "杠铃罗马尼亚硬拉", category: "glutes", pattern: "hinge", equipment: ["barbell"], muscles: ["腘绳肌", "臀大肌"], difficulty: "intermediate", contraindications: ["腰部"], substitutions: ["dumbbell-rdl", "glute-bridge"], cues: ["脊柱保持中立", "站起时伸髋，不后仰"], weight: 25 }),
  defineExercise({ id: "machine-leg-curl", name: "器械腿弯举", category: "legs", pattern: "knee-flexion", equipment: ["machine"], muscles: ["腘绳肌"], contraindications: ["膝盖"], substitutions: ["dumbbell-rdl"], weight: 15 }),
  defineExercise({ id: "machine-leg-extension", name: "器械腿屈伸", category: "legs", pattern: "knee-extension", equipment: ["machine"], muscles: ["股四头肌"], contraindications: ["膝盖"], substitutions: ["machine-leg-press"], weight: 12.5 }),
  defineExercise({ id: "hip-thrust", name: "臀推", category: "glutes", pattern: "hip-extension", equipment: ["machine", "barbell"], muscles: ["臀大肌"], secondary: ["腘绳肌"], contraindications: ["腰部"], substitutions: ["glute-bridge"], cues: ["下巴微收", "顶端收紧臀部而不是腰部"], weight: 25 }),
  defineExercise({ id: "glute-bridge", name: "臀桥", category: "glutes", pattern: "hip-extension", equipment: ["bodyweight"], muscles: ["臀大肌"], contraindications: ["腰部"], substitutions: ["hip-thrust"], cues: ["肋骨向下", "脚跟发力推地"], weight: 0 }),
  defineExercise({ id: "standing-calf-raise", name: "站姿提踵", category: "legs", pattern: "calf-raise", equipment: ["bodyweight", "dumbbell"], muscles: ["小腿三头肌"], contraindications: ["脚踝"], cues: ["顶端停顿一秒", "缓慢落下脚跟"], weight: 0 }),
  defineExercise({ id: "dumbbell-bench-press", name: "哑铃卧推", category: "push", pattern: "horizontal-push", equipment: ["dumbbell"], requiredEquipment: ["bench"], muscles: ["胸大肌"], secondary: ["肱三头肌", "三角肌前束"], contraindications: ["肩膀", "手腕"], substitutions: ["machine-chest-press", "incline-push-up"], cues: ["肩胛骨稳定贴住长凳", "前臂保持接近垂直"], weight: 6 }),
  defineExercise({ id: "machine-chest-press", name: "器械推胸", category: "push", pattern: "horizontal-push", equipment: ["machine"], muscles: ["胸大肌"], contraindications: ["肩膀"], substitutions: ["dumbbell-bench-press", "incline-push-up"], weight: 15 }),
  defineExercise({ id: "incline-dumbbell-press", name: "上斜哑铃卧推", category: "push", pattern: "incline-push", equipment: ["dumbbell"], requiredEquipment: ["bench"], muscles: ["胸大肌上部"], secondary: ["三角肌前束"], contraindications: ["肩膀"], substitutions: ["dumbbell-bench-press"], weight: 5 }),
  defineExercise({ id: "incline-push-up", name: "上斜俯卧撑", category: "push", pattern: "horizontal-push", equipment: ["bodyweight"], requiredEquipment: ["bench"], muscles: ["胸大肌"], contraindications: ["肩膀", "手腕"], substitutions: ["machine-chest-press"], cues: ["身体保持一条直线", "胸口靠近支撑面"], weight: 0 }),
  defineExercise({ id: "cable-chest-fly", name: "绳索夹胸", category: "push", pattern: "chest-fly", equipment: ["cable"], muscles: ["胸大肌"], contraindications: ["肩膀"], substitutions: ["machine-chest-press"], weight: 5 }),
  defineExercise({ id: "lat-pulldown", name: "高位下拉", category: "pull", pattern: "vertical-pull", equipment: ["cable", "machine"], muscles: ["背阔肌"], secondary: ["肱二头肌"], contraindications: ["肩膀"], substitutions: ["seated-cable-row"], cues: ["先下沉肩胛", "把手拉向锁骨附近"], weight: 20 }),
  defineExercise({ id: "seated-cable-row", name: "坐姿绳索划船", category: "pull", pattern: "horizontal-pull", equipment: ["cable"], muscles: ["背阔肌", "菱形肌"], contraindications: ["腰部"], substitutions: ["one-arm-dumbbell-row", "machine-row"], cues: ["胸口保持打开", "肘部向后而不是耸肩"], weight: 15 }),
  defineExercise({ id: "one-arm-dumbbell-row", name: "单臂哑铃划船", category: "pull", pattern: "horizontal-pull", equipment: ["dumbbell"], muscles: ["背阔肌"], contraindications: ["腰部"], substitutions: ["seated-cable-row", "machine-row"], cues: ["骨盆保持水平", "肘部贴近身体向后拉"], weight: 8 }),
  defineExercise({ id: "machine-row", name: "器械坐姿划船", category: "pull", pattern: "horizontal-pull", equipment: ["machine"], muscles: ["背阔肌", "菱形肌"], contraindications: ["肩膀"], substitutions: ["seated-cable-row", "one-arm-dumbbell-row"], weight: 15 }),
  defineExercise({ id: "dumbbell-shoulder-press", name: "哑铃推肩", category: "shoulders", pattern: "vertical-push", equipment: ["dumbbell"], muscles: ["三角肌"], secondary: ["肱三头肌"], contraindications: ["肩膀", "腰部"], substitutions: ["machine-shoulder-press"], weight: 4 }),
  defineExercise({ id: "machine-shoulder-press", name: "器械推肩", category: "shoulders", pattern: "vertical-push", equipment: ["machine"], muscles: ["三角肌"], contraindications: ["肩膀"], substitutions: ["dumbbell-shoulder-press"], weight: 10 }),
  defineExercise({ id: "dumbbell-lateral-raise", name: "哑铃侧平举", category: "shoulders", pattern: "lateral-raise", equipment: ["dumbbell"], muscles: ["三角肌中束"], contraindications: ["肩膀"], substitutions: ["cable-lateral-raise"], cues: ["手肘带动手臂", "举至舒适高度即可"], weight: 2.5 }),
  defineExercise({ id: "cable-lateral-raise", name: "绳索侧平举", category: "shoulders", pattern: "lateral-raise", equipment: ["cable"], muscles: ["三角肌中束"], contraindications: ["肩膀"], substitutions: ["dumbbell-lateral-raise"], weight: 2.5 }),
  defineExercise({ id: "dumbbell-curl", name: "哑铃弯举", category: "arms", pattern: "elbow-flexion", equipment: ["dumbbell"], muscles: ["肱二头肌"], contraindications: ["手肘", "手腕"], substitutions: ["cable-curl"], weight: 4 }),
  defineExercise({ id: "cable-curl", name: "绳索弯举", category: "arms", pattern: "elbow-flexion", equipment: ["cable"], muscles: ["肱二头肌"], contraindications: ["手肘"], substitutions: ["dumbbell-curl"], weight: 7.5 }),
  defineExercise({ id: "cable-triceps-pressdown", name: "绳索下压", category: "arms", pattern: "elbow-extension", equipment: ["cable"], muscles: ["肱三头肌"], contraindications: ["手肘"], weight: 10 }),
  defineExercise({ id: "plank", name: "平板支撑", category: "core", pattern: "anti-extension", equipment: ["bodyweight"], muscles: ["腹横肌", "腹直肌"], contraindications: ["腰部", "肩膀"], substitutions: ["dead-bug", "bird-dog"], cues: ["肋骨与骨盆保持堆叠", "正常呼吸，不要憋气"], weight: 0 }),
  defineExercise({ id: "dead-bug", name: "死虫式", category: "core", pattern: "anti-extension", equipment: ["bodyweight"], muscles: ["腹横肌"], contraindications: ["腰部"], substitutions: ["plank", "bird-dog"], cues: ["腰部轻贴地面", "对侧手脚缓慢伸展"], weight: 0 }),
  defineExercise({ id: "bird-dog", name: "鸟狗式", category: "core", pattern: "stability", equipment: ["bodyweight"], muscles: ["核心肌群"], contraindications: ["手腕", "膝盖"], substitutions: ["dead-bug"], cues: ["骨盆保持水平", "手脚向远处延伸"], weight: 0 }),
];

const exerciseById = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]));

export function getExercise(id: string): Exercise | undefined {
  return exerciseById.get(id);
}
