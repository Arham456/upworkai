"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type InitialData = {
  skills: string[];
  niche: string | null;
  experience: string | null;
  upworkUrl: string | null;
  sampleProposals: string[];
} | null;

type FormData = {
  skills: string[];
  niche: string;
  experience: string;
  upworkUrl: string;
  sampleProposals: string;
};

const STEPS = [
  { number: 1, label: "Skills" },
  { number: 2, label: "Niche" },
  { number: 3, label: "Style" },
  { number: 4, label: "Review" },
];

const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Beginner", desc: "0–1 years on Upwork" },
  { value: "intermediate", label: "Intermediate", desc: "1–3 years, steady clients" },
  { value: "expert", label: "Expert", desc: "3+ years, Top Rated or JSS 90%+" },
];

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 32 : -32, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -32 : 32,
    opacity: 0,
    transition: { duration: 0.18, ease: "easeIn" as const },
  }),
};

export function ProfileForm({ initialData }: { initialData: InitialData }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const skillRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    skills: initialData?.skills ?? [],
    niche: initialData?.niche ?? "",
    experience: initialData?.experience ?? "",
    upworkUrl: initialData?.upworkUrl ?? "",
    sampleProposals: initialData?.sampleProposals?.[0] ?? "",
  });

  function navigate(next: number) {
    setDir(next > step ? 1 : -1);
    setStep(next);
  }

  function addSkill() {
    const val = skillInput.trim();
    if (!val || form.skills.includes(val)) {
      setSkillInput("");
      return;
    }
    setForm((f) => ({ ...f, skills: [...f.skills, val] }));
    setSkillInput("");
    skillRef.current?.focus();
  }

  function removeSkill(skill: string) {
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: form.skills,
          niche: form.niche || null,
          experience: form.experience || null,
          upworkUrl: form.upworkUrl || null,
          sampleProposals: form.sampleProposals ? [form.sampleProposals] : [],
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Profile Setup</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Help the AI write proposals that sound exactly like you.
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s.number} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => step > s.number && navigate(s.number)}
                disabled={step <= s.number}
                className="flex flex-col items-center gap-1.5 group"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    step > s.number
                      ? "bg-green-500 text-zinc-950"
                      : step === s.number
                      ? "bg-green-500/20 border-2 border-green-500 text-green-400"
                      : "bg-zinc-800 border border-zinc-700 text-zinc-500"
                  }`}
                >
                  {step > s.number ? <Check className="w-3.5 h-3.5" /> : s.number}
                </span>
                <span
                  className={`text-xs hidden sm:block ${
                    step >= s.number ? "text-zinc-300" : "text-zinc-600"
                  }`}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-2 mb-5 transition-colors"
                  style={{ background: step > s.number ? "#22c55e" : "#3f3f46" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="relative min-h-[340px]">
        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {step === 1 && (
              <StepSkills
                skills={form.skills}
                input={skillInput}
                inputRef={skillRef}
                onChange={setSkillInput}
                onAdd={addSkill}
                onRemove={removeSkill}
              />
            )}
            {step === 2 && (
              <StepNiche
                niche={form.niche}
                experience={form.experience}
                upworkUrl={form.upworkUrl}
                onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
              />
            )}
            {step === 3 && (
              <StepStyle
                value={form.sampleProposals}
                onChange={(v) => setForm((f) => ({ ...f, sampleProposals: v }))}
              />
            )}
            {step === 4 && (
              <StepReview form={form} error={error} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
        <button
          onClick={() => navigate(step - 1)}
          disabled={step === 1}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {step < 4 ? (
          <button
            onClick={() => navigate(step + 1)}
            disabled={step === 1 && form.skills.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-green-400 transition-colors disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save profile
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step components ──────────────────────────────────────────────────────────

function StepSkills({
  skills,
  input,
  inputRef,
  onChange,
  onAdd,
  onRemove,
}: {
  skills: string[];
  input: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (s: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Your Skills</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Add the skills you offer on Upwork. Press Enter to add each one.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAdd())}
          placeholder="e.g. React, Copywriting, UI Design…"
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/30 transition-colors"
        />
        <button
          onClick={onAdd}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
        >
          Add
        </button>
      </div>

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1.5 rounded-full bg-green-500/15 border border-green-500/30 px-3 py-1 text-sm text-green-400"
            >
              {skill}
              <button
                onClick={() => onRemove(skill)}
                className="text-green-500/60 hover:text-green-300 transition-colors"
                aria-label={`Remove ${skill}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-600 italic">No skills added yet.</p>
      )}

      <div className="space-y-1">
        <p className="text-xs text-zinc-600">Examples:</p>
        <div className="flex flex-wrap gap-1.5">
          {["React", "Node.js", "Graphic Design", "Copywriting", "Python", "SEO"].map(
            (ex) => (
              <button
                key={ex}
                onClick={() => {
                  if (!skills.includes(ex)) {
                    onRemove(""); // no-op, just type-safe
                    onChange(ex);
                    setTimeout(() => onAdd(), 0);
                  }
                }}
                disabled={skills.includes(ex)}
                className="rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs text-zinc-500 hover:text-zinc-200 hover:border-zinc-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {ex}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function StepNiche({
  niche,
  experience,
  upworkUrl,
  onChange,
}: {
  niche: string;
  experience: string;
  upworkUrl: string;
  onChange: (key: "niche" | "experience" | "upworkUrl", value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Niche & Experience</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Help the AI understand who you are and what you specialise in.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">
          Describe your niche in one sentence
        </label>
        <textarea
          value={niche}
          onChange={(e) => onChange("niche", e.target.value)}
          placeholder='e.g. "I build SaaS dashboards for startup founders using React and Node.js"'
          rows={3}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/30 transition-colors resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">
          Experience level
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange("experience", opt.value)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                experience === opt.value
                  ? "border-green-500 bg-green-500/10"
                  : "border-zinc-700 bg-zinc-800/40 hover:border-zinc-500"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  experience === opt.value ? "text-green-400" : "text-zinc-200"
                }`}
              >
                {opt.label}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">
          Upwork profile URL{" "}
          <span className="text-zinc-600 font-normal">(optional)</span>
        </label>
        <input
          type="url"
          value={upworkUrl}
          onChange={(e) => onChange("upworkUrl", e.target.value)}
          placeholder="https://www.upwork.com/freelancers/~..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/30 transition-colors"
        />
      </div>
    </div>
  );
}

function StepStyle({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Your Writing Style</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Paste 1–2 of your best past proposals or cover letters.
        </p>
      </div>

      <div className="space-y-1.5">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your best proposals here…"
          rows={10}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/30 transition-colors resize-none leading-relaxed"
        />
        <p className="text-xs text-zinc-600">
          The AI will learn your tone, hook style, and voice from these samples.
        </p>
      </div>

      {!value && (
        <p className="text-sm text-zinc-500">
          Don&apos;t have any yet?{" "}
          <span className="text-zinc-400">
            That&apos;s fine — you can skip this step and add samples later.
          </span>
        </p>
      )}
    </div>
  );
}

function StepReview({ form, error }: { form: FormData; error: string }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Review & Save</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Everything looks good? Hit save to finish your profile.
        </p>
      </div>

      <div className="space-y-3">
        <ReviewRow
          label="Skills"
          value={
            form.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {form.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-green-500/15 border border-green-500/30 px-2.5 py-0.5 text-xs text-green-400"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-zinc-500 italic">None added</span>
            )
          }
        />
        <ReviewRow
          label="Niche"
          value={
            form.niche ? (
              <span className="text-zinc-200">{form.niche}</span>
            ) : (
              <span className="text-zinc-500 italic">Not set</span>
            )
          }
        />
        <ReviewRow
          label="Experience"
          value={
            form.experience ? (
              <span className="capitalize text-zinc-200">{form.experience}</span>
            ) : (
              <span className="text-zinc-500 italic">Not set</span>
            )
          }
        />
        <ReviewRow
          label="Upwork URL"
          value={
            form.upworkUrl ? (
              <span className="text-zinc-200 text-xs break-all">{form.upworkUrl}</span>
            ) : (
              <span className="text-zinc-500 italic">Not provided</span>
            )
          }
        />
        <ReviewRow
          label="Sample proposals"
          value={
            form.sampleProposals ? (
              <span className="text-zinc-200">
                {form.sampleProposals.length} characters provided
              </span>
            ) : (
              <span className="text-zinc-500 italic">Skipped</span>
            )
          }
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
      <span className="shrink-0 text-xs font-medium text-zinc-500 sm:w-32 sm:pt-0.5">
        {label}
      </span>
      <div className="flex-1 text-sm">{value}</div>
    </div>
  );
}
