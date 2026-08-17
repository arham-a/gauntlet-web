import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Chip, Fact, Button, Empty, Standings } from "../assets/components/ui";
import { formatPrice, formatDate, deadlineState } from "../lib/competition";

const CompetitionPage = () => {
  const { id } = useParams();
  const [tab, setTab] = useState("brief");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [competition, setCompetition] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  const userId = useMemo(() => {
    const c = document.cookie.split("; ").find((r) => r.startsWith("userID="));
    return c ? c.split("=")[1] : null;
  }, []);

  const API = import.meta.env.VITE_API_URL;

  /* Everything loads up front so the tab strip can show real counts. */
  const loadAll = useCallback(async () => {
    try {
      const res = await fetch(`${API}/comp/${id}`);
      if (!res.ok) throw new Error("This competition could not be loaded");
      const data = await res.json();
      setCompetition(data.competition);

      const [lb, ann, subs, regs] = await Promise.allSettled([
        fetch(`${API}/comp/${id}/participants/leaderboard`).then((r) => r.json()),
        fetch(`${API}/comp/${id}/announcements`).then((r) => r.json()),
        fetch(`${API}/comp/${id}/submissions`).then((r) => r.json()),
        fetch(`${API}/comp/${id}/registrations`).then((r) => r.json()),
      ]);

      if (lb.status === "fulfilled") setLeaderboard(lb.value?.participants || []);
      if (ann.status === "fulfilled") setAnnouncements(ann.value?.announcements || []);
      if (subs.status === "fulfilled") setSubmissions(subs.value?.submissions || []);
      if (regs.status === "fulfilled") setRegistrations(regs.value?.registrations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API, id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const isOwner =
    competition && userId && String(competition.compOwnerUserId?._id) === String(userId);
  const state = deadlineState(competition?.deadline);

  const submit = async (e) => {
    e.preventDefault();
    if (!userId) return toast.error("Sign in to submit");
    if (!file) return toast.error("Choose a ZIP file to submit");

    setUploading(true);
    try {
      const body = new FormData();
      body.append("zipFile", file);
      body.append("userId", userId);
      const res = await fetch(`${API}/comp/${id}/submissions`, { method: "POST", body });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || "Your submission could not be uploaded");
      }
      toast.success("Submitted");
      setFile(null);
      loadAll();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const post = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`${API}/comp/${id}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcement: draft.trim() }),
      });
      if (!res.ok) throw new Error("Your announcement could not be posted");
      setDraft("");
      toast.success("Posted");
      loadAll();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPosting(false);
    }
  };

  const approve = async (applicantId) => {
    try {
      const res = await fetch(`${API}/comp/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: applicantId }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || "Could not approve this application");
      }
      toast.success("Approved");
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <div className="h-3 w-32 bg-surface-alt rounded animate-pulse" />
        <div className="h-8 w-2/3 bg-surface-alt rounded mt-4 animate-pulse" />
        <div className="h-24 w-full bg-surface-alt rounded mt-6 animate-pulse" />
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16">
        <Empty title="Competition not found" action={<Button as={Link} to="/explore">Browse competitions</Button>}>
          {error || "It may have been removed, or the link may be wrong."}
        </Empty>
      </div>
    );
  }

  /* Participant tabs first; organiser-only tabs last. */
  const tabs = [
    { key: "brief", label: "Brief" },
    { key: "rules", label: "Rules" },
    { key: "standings", label: "Standings", count: leaderboard.length },
    { key: "announcements", label: "Announcements", count: announcements.length },
    { key: "submissions", label: "Submissions", count: submissions.length },
    ...(isOwner ? [{ key: "applications", label: "Applications", count: registrations.length }] : []),
  ];

  const Section = ({ title, children }) => (
    <div>
      <h2 className="text-base font-semibold text-ink mb-3">{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
      {/* Header — deadline-led, because that's the most urgent fact. */}
      <div className="pb-6 border-b border-rule">
        <div className="flex items-start justify-between gap-4">
          <span className="label">
            {competition.compType || "Competition"}
            {competition.compOwnerUserId?.username && (
              <span className="normal-case"> · hosted by {competition.compOwnerUserId.username}</span>
            )}
          </span>
          <Chip status={state.status}>{competition.isPrivate ? "Private" : state.label}</Chip>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink mt-3">
          {competition.compName}
        </h1>
        <p className="text-muted text-sm mt-2 max-w-2xl leading-relaxed">
          {competition.compDescription}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-6">
          <div>
            <span className="label block mb-[3px]">{state.isClosed ? "Closed" : "Closes in"}</span>
            <span className={`num block text-lg font-semibold ${state.status === "closing" ? "text-brand" : "text-ink"}`}>
              {state.status === "none" ? "—" : state.isClosed ? formatDate(competition.deadline) : state.remaining}
            </span>
          </div>
          <Fact k="Entrants">{competition.participants?.length ?? 0}</Fact>
          <Fact k="Entry">{formatPrice(competition.price)}</Fact>
          <Fact k="Submissions">{submissions.length}</Fact>
        </div>

        {!state.isClosed && (
          <div className="flex flex-wrap gap-2 mt-6">
            <Button onClick={() => setTab("submissions")}>Submit solution</Button>
            <Button variant="ghost" onClick={() => setTab("rules")}>Read the rules</Button>
          </div>
        )}
      </div>

      {/* Tabs keep their labels at every width and scroll instead of collapsing. */}
      <div className="flex gap-1 border-b border-rule overflow-x-auto no-scrollbar mt-6 mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            aria-current={tab === t.key ? "page" : undefined}
            className={`px-3 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-brand text-ink font-medium"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
            {typeof t.count === "number" && t.count > 0 && (
              <span className="num text-xs text-muted ml-1.5">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "brief" && (
        <Section title="Problem statement">
          <p className="text-ink text-[0.95rem] leading-relaxed whitespace-pre-line max-w-3xl">
            {competition.problemStatement || "The organiser hasn't published the brief yet."}
          </p>
        </Section>
      )}

      {tab === "rules" && (
        <div className="flex flex-col gap-10 max-w-3xl">
          <Section title="Rules">
            <p className="text-ink text-[0.95rem] leading-relaxed whitespace-pre-line">
              {competition.compRuleBook || "No rules published."}
            </p>
          </Section>
          <Section title="How to submit">
            <p className="text-ink text-[0.95rem] leading-relaxed whitespace-pre-line">
              {competition.submissionRules || "No submission instructions published."}
            </p>
          </Section>
        </div>
      )}

      {tab === "standings" && (
        leaderboard.length ? (
          <Standings
            rows={leaderboard.map((p) => ({
              userId: p._id || p.userId,
              username: p.username,
              points: p.points ?? p.totalPoints ?? 0,
            }))}
            currentUserId={userId}
          />
        ) : (
          <Empty title="No standings yet">
            Rankings appear once the organiser scores the first submission.
          </Empty>
        )
      )}

      {tab === "announcements" && (
        <div className="max-w-3xl flex flex-col gap-6">
          {isOwner && (
            <form onSubmit={post} className="border border-rule rounded-sm p-4 bg-surface">
              <label htmlFor="draft" className="label block mb-2">Post an update</label>
              <textarea
                id="draft"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Everyone entered will see this."
                className="w-full bg-paper border border-rule rounded-sm px-3 py-2 text-sm text-ink outline-none focus:border-rule-strong min-h-20 resize-y"
              />
              <Button type="submit" disabled={posting || !draft.trim()} className="mt-3">
                {posting ? "Posting…" : "Post announcement"}
              </Button>
            </form>
          )}

          {announcements.length ? (
            <ul className="border border-rule rounded-sm bg-surface">
              {[...announcements].reverse().map((a, i) => (
                <li key={i} className="px-4 py-3.5 border-b border-rule last:border-b-0 flex gap-3">
                  <span className="num text-xs text-muted pt-0.5 shrink-0">
                    {String(announcements.length - i).padStart(2, "0")}
                  </span>
                  <p className="text-sm text-ink leading-relaxed">{a}</p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="No announcements yet">
              {isOwner
                ? "Post an update above — everyone entered will see it here."
                : "The organiser hasn't posted any updates yet."}
            </Empty>
          )}
        </div>
      )}

      {tab === "submissions" && (
        <div className="max-w-3xl flex flex-col gap-6">
          {!state.isClosed && (
            <form onSubmit={submit} className="border border-rule rounded-sm p-4 bg-surface">
              <label htmlFor="zip" className="label block mb-2">Submit your solution</label>
              <p className="text-xs text-muted mb-3">{competition.submissionRules || "Upload a ZIP file."}</p>
              <input
                id="zip"
                type="file"
                accept=".zip"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-muted file:mr-3 file:py-2 file:px-3 file:rounded-sm file:border file:border-rule file:bg-paper file:text-ink file:text-sm file:cursor-pointer"
              />
              <Button type="submit" disabled={uploading || !file} className="mt-3">
                {uploading ? "Uploading…" : "Submit solution"}
              </Button>
            </form>
          )}

          {submissions.length ? (
            <ul className="border border-rule rounded-sm bg-surface">
              {submissions.map((s, i) => (
                <li key={s._id || i} className="flex items-center gap-3 px-4 py-3 border-b border-rule last:border-b-0">
                  <span className="text-sm text-ink truncate">{s.userId?.username || "Entrant"}</span>
                  {s.fileUrl && (
                    <a href={s.fileUrl} target="_blank" rel="noreferrer"
                      className="text-sm text-brand hover:underline ml-auto shrink-0">
                      Download
                    </a>
                  )}
                  <span className="num text-sm text-ink shrink-0 w-16 text-right">{s.points ?? 0}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="No submissions yet">
              {state.isClosed
                ? "This competition closed without any submissions."
                : "Be the first to submit."}
            </Empty>
          )}
        </div>
      )}

      {tab === "applications" && (
        <div className="max-w-3xl">
          {registrations.length ? (
            <ul className="border border-rule rounded-sm bg-surface">
              {registrations.map((r, i) => (
                <li key={r._id || i} className="flex items-center gap-3 px-4 py-3 border-b border-rule last:border-b-0">
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">{r.userId?.username || "Applicant"}</p>
                    <p className="text-xs text-muted truncate">{r.userId?.email}</p>
                  </div>
                  <Button variant="ghost" className="ml-auto shrink-0"
                    onClick={() => approve(r.userId?._id)}>
                    Approve
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="No applications waiting">
              Applications to this private competition appear here for you to approve.
            </Empty>
          )}
        </div>
      )}
    </div>
  );
};

export default CompetitionPage;
