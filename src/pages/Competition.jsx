import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import CompetitionCard from "../assets/components/CompetitionCard";
import { PageHeader, Empty, Button } from "../assets/components/ui";
import { useUser } from "../context/UserContext";

const Competition = () => {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("entered");
  const navigate = useNavigate();
  const { isSignedIn, joinedCompetitions, createdCompetitions, loading: userLoading } = useUser();

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/comp`, { signal: controller.signal });
        if (!res.ok) throw new Error("Could not load your competitions");
        const data = await res.json();
        setAll(data.competitions || []);
      } catch (err) {
        if (err.name !== "AbortError") toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const entered = useMemo(
    () => all.filter((c) => joinedCompetitions?.includes(c._id)),
    [all, joinedCompetitions]
  );
  const hosted = useMemo(
    () => all.filter((c) => createdCompetitions?.includes(c._id)),
    [all, createdCompetitions]
  );

  if (!userLoading && !isSignedIn) {
    return (
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        <PageHeader title="My competitions" />
        <Empty title="You're not signed in" action={<Button onClick={() => navigate("/login")}>Sign in</Button>}>
          Sign in to see the competitions you've entered and the ones you host.
        </Empty>
      </div>
    );
  }

  const shown = view === "entered" ? entered : hosted;

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
      <PageHeader
        title="My competitions"
        action={<Button onClick={() => navigate("/add-comp")}>Host a competition</Button>}
      />

      <div className="flex gap-1 border-b border-rule mb-6">
        {[
          { key: "entered", label: "Entered", count: entered.length },
          { key: "hosted", label: "Hosting", count: hosted.length },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            className={`px-3 py-2 text-sm border-b-2 -mb-px transition-colors ${
              view === t.key
                ? "border-brand text-ink font-medium"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
            {t.count > 0 && <span className="num text-xs text-muted ml-1.5">{t.count}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-rule rounded-sm p-5 animate-pulse">
              <div className="h-3 w-24 bg-surface-alt rounded" />
              <div className="h-4 w-3/4 bg-surface-alt rounded mt-4" />
              <div className="h-9 w-full bg-surface-alt rounded mt-6" />
            </div>
          ))}
        </div>
      ) : shown.length === 0 ? (
        <Empty
          title={view === "entered" ? "You haven't entered anything yet" : "You're not hosting anything yet"}
          action={
            view === "entered" ? (
              <Button onClick={() => navigate("/explore")}>Browse competitions</Button>
            ) : (
              <Button onClick={() => navigate("/add-comp")}>Host a competition</Button>
            )
          }
        >
          {view === "entered"
            ? "Competitions you enter appear here, with your standing in each."
            : "Set a brief, review the entries, and publish the standings."}
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => (
            <CompetitionCard key={c._id} comp={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Competition;
