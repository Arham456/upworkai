"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Loader2, X, Zap, Dna } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type InitialData = {
  skills: string[];
  niche: string | null;
  experience: string | null;
  upworkUrl: string | null;
  sampleProposals: string[];
  updatedAt?: string | null;
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
  { value: "beginner", label: "Beginner", desc: "0-1 years on Upwork" },
  { value: "intermediate", label: "Intermediate", desc: "1-3 years, steady clients" },
  { value: "expert", label: "Expert", desc: "3+ years, Top Rated or JSS 90%+" },
];

const SKILL_SUGGESTIONS = [
  // Development
  "React", "Next.js", "Node.js", "Python", "JavaScript",
  "TypeScript", "Vue.js", "Angular", "Django", "FastAPI",
  "PostgreSQL", "MongoDB", "MySQL", "Redis", "GraphQL",
  "REST API", "Docker", "AWS", "Firebase", "Supabase",
  // Design
  "UI/UX Design", "Figma", "Adobe XD", "Photoshop",
  "Illustrator", "Logo Design", "Brand Design", "Canva",
  "Motion Graphics", "Video Editing", "3D Modeling",
  // Writing
  "Copywriting", "Content Writing", "Blog Writing",
  "Technical Writing", "SEO Writing", "Ghostwriting",
  "Proofreading", "Social Media",
  // Marketing
  "Digital Marketing", "SEO", "Google Ads", "Facebook Ads",
  "Email Marketing", "Growth Hacking", "Analytics",
  // Data
  "Data Analysis", "Machine Learning", "Data Science",
  "Pandas", "NumPy", "TensorFlow", "Power BI", "Tableau",
  // Other
  "Project Management", "Virtual Assistant", "Excel",
  "Customer Support", "Accounting", "Bookkeeping",
  "Translation", "Transcription", "Research",
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

type VoiceDNAData = {
  avgSentenceLength: string;
  tone: string;
  phrasesNeverUsed: string[];
  phrasesAlwaysUsed: string[];
  structurePattern: string;
  uniqueCharacteristics: string[];
  analyzedAt?: string;
} | null;

const MOCK_DNA: VoiceDNAData = {
  avgSentenceLength: "short",
  tone: "direct",
  phrasesAlwaysUsed: ["Let's be direct about...", "Here's what matters:", "Skip the pitch -"],
  phrasesNeverUsed: ["I am interested in", "I am confident that", "I have 5 years of"],
  structurePattern: "Hook -> Pain -> Proof -> Next step",
  uniqueCharacteristics: [
    "Opens with client's problem, not freelancer's skills",
    "Uses very short paragraphs",
    "Always includes a specific number or result",
  ],
};

function ProBlur({ children, isPro, featureName }: { children: React.ReactNode; isPro: boolean; featureName: string }) {
  if (isPro) return <>{children}</>;
  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="blur-sm pointer-events-none select-none opacity-50">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/80 rounded-xl">
        <div className="text-center space-y-3 p-6">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto">
            <Zap className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{featureName}</p>
            <p className="text-xs text-zinc-400 mt-1">Upgrade to Pro to unlock this insight</p>
          </div>
          <Link
            href="/dashboard/upgrade"
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-2 text-xs font-bold text-white transition-colors"
          >
            <Zap className="w-3 h-3" />
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </div>
  );
}

function VoiceDnaCard({
  dnaData,
  loading,
  isPro,
  showDashboardCta,
}: {
  dnaData: VoiceDNAData;
  loading: boolean;
  isPro: boolean;
  showDashboardCta?: boolean;
}) {
  const displayData = isPro ? dnaData : MOCK_DNA;

  if (loading) {
    return (
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-violet-400 uppercase tracking-wide">
          <Dna className="w-3.5 h-3.5" />
          Voice DNA
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
          Analyzing your writing style...
        </div>
      </div>
    );
  }

  if (!displayData) return null;

  return (
    <ProBlur isPro={isPro} featureName="Voice DNA">
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-medium text-violet-400 uppercase tracking-wide">
          <Dna className="w-3.5 h-3.5" />
          Voice DNA
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-violet-500/15 border border-violet-500/30 px-3 py-1 text-xs font-medium text-violet-300">
            {displayData.avgSentenceLength} sentences
          </span>
          <span className="rounded-full bg-violet-500/15 border border-violet-500/30 px-3 py-1 text-xs font-medium text-violet-300">
            {displayData.tone} tone
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Always uses</p>
          <div className="flex flex-wrap gap-1.5">
            {displayData.phrasesAlwaysUsed.map((p, i) => (
              <span key={i} className="rounded-full bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 text-xs text-violet-400">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Never uses</p>
          <div className="flex flex-wrap gap-1.5">
            {displayData.phrasesNeverUsed.map((p, i) => (
              <span key={i} className="rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 text-xs text-red-400">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Structure</p>
          <p className="text-sm text-zinc-300">{displayData.structurePattern}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Unique characteristics</p>
          <ul className="space-y-1">
            {displayData.uniqueCharacteristics.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {showDashboardCta && (
          <div className="pt-2 border-t border-violet-500/20">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              <Check className="w-4 h-4" />
              Profile saved - Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </ProBlur>
  );
}

export function ProfileForm({
  initialData,
  isPro,
  voiceDNA,
}: {
  initialData: InitialData;
  isPro: boolean;
  voiceDNA: unknown;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dnaData, setDnaData] = useState<VoiceDNAData>(voiceDNA as VoiceDNAData ?? null);
  const [dnaLoading, setDnaLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const isExistingProfile = !!initialData;

  const [form, setForm] = useState<FormData>({
    skills: initialData?.skills ?? [],
    niche: initialData?.niche ?? "",
    experience: initialData?.experience ?? "",
    upworkUrl: initialData?.upworkUrl ?? "",
    sampleProposals: initialData?.sampleProposals?.[0] ?? "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        skills: initialData.skills ?? [],
        niche: initialData.niche ?? "",
        experience: initialData.experience ?? "",
        upworkUrl: initialData.upworkUrl ?? "",
        sampleProposals: initialData.sampleProposals?.[0] ?? "",
      });
    }
  }, []);

  function navigate(next: number) {
    setDir(next > step ? 1 : -1);
    setStep(next);
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

      setSaved(true);

      if (isPro && form.sampleProposals) {
        setDnaLoading(true);
        setSaving(false);
        try {
          const dnaRes = await fetch("/api/voice-dna", { method: "POST" });
          if (dnaRes.ok) {
            const result = (await dnaRes.json()) as VoiceDNAData;
            setDnaData(result);
          }
        } finally {
          setDnaLoading(false);
        }
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const formattedUpdatedAt = initialData?.updatedAt
    ? new Date(initialData.updatedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {isExistingProfile ? "Update Profile" : "Profile Setup"}
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          {formattedUpdatedAt
            ? `Last updated: ${formattedUpdatedAt}`
            : "Help the AI write proposals that sound exactly like you."}
        </p>
      </div>

      {/* Success toast */}
      {saved && !isPro && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3"
        >
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-400">
            Profile {isExistingProfile ? "updated" : "saved"} successfully!
          </p>
        </motion.div>
      )}

      {/* Progress steps */}
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
                      ? "bg-violet-600 text-white"
                      : step === s.number
                      ? "bg-violet-500/20 border-2 border-violet-500 text-violet-400"
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
                <div
                  className="flex-1 h-px mx-2 mb-5 transition-colors"
                  style={{ background: step > s.number ? "#7C3AED" : "#3f3f46" }}
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
                onSkillsChange={(skills) => setForm((f) => ({ ...f, skills }))}
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

      {/* Voice DNA card */}
      {(dnaData || dnaLoading) && (
        <VoiceDnaCard
          dnaData={dnaData}
          loading={dnaLoading}
          isPro={isPro}
          showDashboardCta={saved && !!dnaData && !dnaLoading}
        />
      )}

      {!isPro && !dnaData && !dnaLoading && (
        <VoiceDnaCard dnaData={null} loading={false} isPro={false} />
      )}

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
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 px-5 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 px-5 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saved && !isPro ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {isExistingProfile ? "Update Profile" : "Save Profile"}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ---- Step components -------------------------------------------------------

function StepSkills({
  skills,
  onSkillsChange,
}: {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInputChange(v: string) {
    setInput(v);
    if (v.trim().length > 0) {
      const matches = SKILL_SUGGESTIONS.filter(
        (s) =>
          s.toLowerCase().includes(v.toLowerCase()) &&
          !skills.includes(s)
      ).slice(0, 8);
      setSuggestions(matches);
      setShowDropdown(matches.length > 0);
    } else {
      setShowDropdown(false);
      setSuggestions([]);
    }
  }

  function addSkill(skill?: string) {
    const val = (skill ?? input).trim();
    if (!val || skills.includes(val) || skills.length >= 10) return;
    onSkillsChange([...skills, val]);
    setInput("");
    setShowDropdown(false);
    setSuggestions([]);
    inputRef.current?.focus();
  }

  function removeSkill(skill: string) {
    onSkillsChange(skills.filter((s) => s !== skill));
  }

  function highlightMatch(text: string, query: string) {
    if (!query.trim()) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-violet-400 font-semibold">{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Your Skills</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Add up to 10 skills. Type to search or press Enter to add a custom one.
        </p>
      </div>

      <div className="relative">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); addSkill(); }
              if (e.key === "Escape") setShowDropdown(false);
            }}
            onFocus={() => input.trim() && setShowDropdown(suggestions.length > 0)}
            placeholder="e.g. React, Copywriting, UI Design..."
            disabled={skills.length >= 10}
            className="flex-1 rounded-lg border border-zinc-800 bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => addSkill()}
            disabled={!input.trim() || skills.length >= 10}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full mt-1 z-20 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl overflow-hidden"
          >
            <div className="max-h-48 overflow-y-auto">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onMouseDown={(e) => { e.preventDefault(); addSkill(s); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-violet-600/10 hover:text-violet-400 transition-colors"
                >
                  {highlightMatch(s, input)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 px-3 py-1 text-sm text-violet-400"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="text-violet-500/60 hover:text-violet-300 transition-colors"
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

      {skills.length >= 10 && (
        <p className="text-xs text-amber-500">Maximum 10 skills reached.</p>
      )}

      <div className="space-y-1">
        <p className="text-xs text-zinc-600">Popular:</p>
        <div className="flex flex-wrap gap-1.5">
          {["React", "Node.js", "Graphic Design", "Copywriting", "Python", "SEO"].map((ex) => (
            <button
              key={ex}
              onClick={() => !skills.includes(ex) && addSkill(ex)}
              disabled={skills.includes(ex) || skills.length >= 10}
              className="rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs text-zinc-500 hover:text-zinc-200 hover:border-zinc-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {ex}
            </button>
          ))}
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
          className="w-full rounded-lg border border-zinc-800 bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none transition-colors resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">Experience level</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange("experience", opt.value)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                experience === opt.value
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-zinc-700 bg-zinc-800/40 hover:border-zinc-500"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  experience === opt.value ? "text-violet-400" : "text-zinc-200"
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
          className="w-full rounded-lg border border-zinc-800 bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none transition-colors"
        />
      </div>
    </div>
  );
}

function StepStyle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Your Writing Style</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Paste 1-2 of your best past proposals or cover letters.
        </p>
      </div>

      <div className="space-y-1.5">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your best proposals here..."
          rows={10}
          className="w-full rounded-lg border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none transition-colors resize-none leading-relaxed"
        />
        <p className="text-xs text-zinc-600">
          The AI will learn your tone, hook style, and voice from these samples.
        </p>
      </div>

      {!value && (
        <p className="text-sm text-zinc-500">
          Don&apos;t have any yet?{" "}
          <span className="text-zinc-400">
            That&apos;s fine - you can skip this step and add samples later.
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
                    className="rounded-full bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 text-xs text-violet-400"
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

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3">
      <span className="shrink-0 text-xs font-medium text-zinc-500 sm:w-32 sm:pt-0.5">
        {label}
      </span>
      <div className="flex-1 text-sm">{value}</div>
    </div>
  );
}
