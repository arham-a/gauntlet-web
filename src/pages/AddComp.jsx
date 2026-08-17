import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useGlobalStats } from "../context/GlobalStatsContext";
import { Button, PageHeader, Fact } from "../assets/components/ui";
import { formatPrice, formatDate } from "../lib/competition";

/*
  Nine fields in one scroll became four steps. Each step is a decision the
  organiser can answer in one sitting, and the last one shows what will be
  published before it is.
*/
const STEPS = [
  { key: "basics", title: "Basics", blurb: "What the competition is called and who it's for." },
  { key: "brief", title: "The brief", blurb: "What entrants must do, and how they'll be judged." },
  { key: "entry", title: "Entry and access", blurb: "Cost, closing date, and who can take part." },
  { key: "review", title: "Review", blurb: "Check it over, then publish." },
];

const AddComp = () => {
  const [step, setStep] = useState(0);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    compName: "",
    compType: "",
    compDescription: "",
    problemStatement: "",
    compRuleBook: "",
    submissionRules: "",
    price: "",
    deadline: "",
    isPrivate: false,
    passCode: "",
  });

  const navigate = useNavigate();
  const { refreshUserData } = useUser();
  const { refreshGlobalStats } = useGlobalStats();

  const getUserId = () => {
    const c = document.cookie.split("; ").find((r) => r.startsWith("userID="));
    return c ? c.split("=")[1] : null;
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/comp/type`);
        if (res.ok) setTypes(await res.json());
      } catch {
        /* categories are optional; the field falls back to free text */
      }
    })();
  }, []);

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setData((d) => ({ ...d, [k]: v }));
  };

  /* Validation lives per step so the user is told what's missing where it's asked. */
  const problems = (index) => {
    const out = [];
    if (index === 0) {
      if (!data.compName.trim()) out.push("Give the competition a name");
      if (!data.compType.trim()) out.push("Choose a category");
      if (!data.compDescription.trim()) out.push("Write a short description");
    }
    if (index === 1) {
      if (!data.problemStatement.trim()) out.push("Describe what entrants must do");
      if (!data.compRuleBook.trim()) out.push("Add the rules");
      if (!data.submissionRules.trim()) out.push("Say how entrants should submit");
    }
    if (index === 2) {
      if (data.isPrivate && !data.passCode.trim()) out.push("Set a passcode for a private competition");
      if (data.deadline && new Date(data.deadline) <= new Date())
        out.push("The closing date must be in the future");
    }
    return out;
  };

  const next = () => {
    const errs = problems(step);
    if (errs.length) return toast.error(errs[0]);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const publish = async () => {
    const userId = getUserId();
    if (!userId) {
      toast.error("Sign in to host a competition");
      return navigate("/login");
    }

    const allErrors = [0, 1, 2].flatMap(problems);
    if (allErrors.length) {
      toast.error(allErrors[0]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/comp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compOwnerUserId: userId,
          compName: data.compName.trim(),
          compType: data.compType.trim(),
          compDescription: data.compDescription.trim(),
          problemStatement: data.problemStatement.trim(),
          compRuleBook: data.compRuleBook.trim(),
          submissionRules: data.submissionRules.trim(),
          price: Number(data.price) || 0,
          deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
          isPrivate: data.isPrivate,
          passCode: data.isPrivate ? data.passCode.trim() : null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not publish this competition");
      }

      const result = await res.json();
      await Promise.all([refreshUserData(), refreshGlobalStats()]);
      toast.success("Published");
      navigate(`/competition-page/${result.competition._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field =
    "w-full bg-surface border border-rule rounded-sm px-3 py-2 text-sm text-ink outline-none focus:border-rule-strong";
  const area = `${field} min-h-28 resize-y leading-relaxed`;

  const Label = ({ htmlFor, children, hint }) => (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="label block">{children}</label>
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
      <PageHeader title="Host a competition">
        {STEPS[step].blurb}
      </PageHeader>

      {/* Step rail — a real sequence, so numbering carries meaning. */}
      <ol className="flex items-center gap-1 mb-8 overflow-x-auto no-scrollbar">
        {STEPS.map((s, i) => (
          <li key={s.key} className="flex items-center shrink-0">
            <button
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm whitespace-nowrap transition-colors ${
                i === step
                  ? "bg-surface-alt text-ink font-medium"
                  : i < step
                  ? "text-muted hover:text-ink"
                  : "text-muted/60 cursor-default"
              }`}
            >
              <span className="num text-xs">{String(i + 1).padStart(2, "0")}</span>
              {s.title}
            </button>
            {i < STEPS.length - 1 && <span className="w-4 h-px bg-rule mx-1" />}
          </li>
        ))}
      </ol>

      {/* ---------- Step 1 ---------- */}
      {step === 0 && (
        <div className="flex flex-col gap-5">
          <div>
            <Label htmlFor="compName">Name</Label>
            <input id="compName" value={data.compName} onChange={set("compName")} className={field}
              placeholder="e.g. NED Hack 2026" />
          </div>

          <div>
            <Label htmlFor="compType" hint="Entrants filter by this on Explore.">Category</Label>
            {types.length > 0 ? (
              <select id="compType" value={data.compType} onChange={set("compType")} className={field}>
                <option value="">Choose a category</option>
                {types.map((t) => (
                  <option key={t._id || t.compTypeName} value={t.compTypeName}>{t.compTypeName}</option>
                ))}
              </select>
            ) : (
              <input id="compType" value={data.compType} onChange={set("compType")} className={field}
                placeholder="e.g. Hackathon" />
            )}
          </div>

          <div>
            <Label htmlFor="compDescription" hint="Two lines. This is what appears on the card.">
              Short description
            </Label>
            <textarea id="compDescription" value={data.compDescription} onChange={set("compDescription")}
              className={area} placeholder="Who it's open to and what entrants will do." />
          </div>
        </div>
      )}

      {/* ---------- Step 2 ---------- */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <div>
            <Label htmlFor="problemStatement" hint="The challenge itself. Entrants read this first.">
              Problem statement
            </Label>
            <textarea id="problemStatement" value={data.problemStatement} onChange={set("problemStatement")}
              className={area} />
          </div>

          <div>
            <Label htmlFor="compRuleBook" hint="Team size, what's allowed, how entries are judged.">
              Rules
            </Label>
            <textarea id="compRuleBook" value={data.compRuleBook} onChange={set("compRuleBook")} className={area} />
          </div>

          <div>
            <Label htmlFor="submissionRules" hint="Format, file types, and what must be included.">
              How to submit
            </Label>
            <textarea id="submissionRules" value={data.submissionRules} onChange={set("submissionRules")}
              className={area} />
          </div>
        </div>
      )}

      {/* ---------- Step 3 ---------- */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="price" hint="Leave empty for a free competition.">Entry fee (PKR)</Label>
              <input id="price" type="number" min="0" value={data.price} onChange={set("price")}
                className={field} placeholder="0" />
            </div>

            <div>
              <Label htmlFor="deadline" hint="Entry and submissions close at this time.">Closing date</Label>
              <input id="deadline" type="datetime-local" value={data.deadline} onChange={set("deadline")}
                className={field} />
            </div>
          </div>

          <div className="border border-rule rounded-sm p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={data.isPrivate} onChange={set("isPrivate")}
                className="mt-0.5 accent-[var(--brand)]" />
              <span>
                <span className="text-sm text-ink font-medium block">Make this private</span>
                <span className="text-xs text-muted block mt-0.5">
                  Entrants apply with a passcode and you approve each one. Public competitions can be
                  entered instantly.
                </span>
              </span>
            </label>

            {data.isPrivate && (
              <div className="mt-4 pl-7">
                <Label htmlFor="passCode" hint="Share this with the people you want to invite.">
                  Passcode
                </Label>
                <input id="passCode" value={data.passCode} onChange={set("passCode")}
                  className={`${field} sm:max-w-xs`} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------- Step 4 ---------- */}
      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div className="border border-rule rounded-sm p-5 bg-surface">
            <span className="label">{data.compType || "Uncategorised"}</span>
            <h2 className="text-lg font-semibold tracking-tight text-ink mt-2">{data.compName}</h2>
            <p className="text-muted text-sm mt-1.5 leading-relaxed">{data.compDescription}</p>
            <div className="grid grid-cols-3 gap-3 border-t border-rule mt-4 pt-4">
              <Fact k="Entry">{formatPrice(data.price)}</Fact>
              <Fact k="Closes">{data.deadline ? formatDate(data.deadline) : "No deadline"}</Fact>
              <Fact k="Access">{data.isPrivate ? "Private" : "Public"}</Fact>
            </div>
          </div>

          {!data.deadline && (
            <p className="text-sm text-muted border-l-2 border-warn pl-3">
              Without a closing date this competition stays open indefinitely and won't appear
              under “Closing soonest”. You can add one now or leave it open.
            </p>
          )}

          {[
            ["Problem statement", data.problemStatement],
            ["Rules", data.compRuleBook],
            ["How to submit", data.submissionRules],
          ].map(([title, body]) => (
            <div key={title}>
              <h3 className="label mb-2">{title}</h3>
              <p className="text-sm text-ink whitespace-pre-line leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      )}

      {/* ---------- Controls ---------- */}
      <div className="flex items-center gap-2 mt-8 pt-6 border-t border-rule">
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>Back</Button>
        )}
        <span className="num text-xs text-muted ml-auto mr-2">
          Step {step + 1} of {STEPS.length}
        </span>
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>Continue</Button>
        ) : (
          <Button onClick={publish} disabled={loading}>
            {loading ? "Publishing…" : "Publish competition"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddComp;
