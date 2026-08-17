import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import CompetitionCard from "../assets/components/CompetitionCard";
import { Button, Empty, Fact } from "../assets/components/ui";
import { useGlobalStats } from "../context/GlobalStatsContext";
import { deadlineState } from "../lib/competition";

const Home = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { globalStats } = useGlobalStats();

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/comp`, { signal: controller.signal });
        if (!res.ok) throw new Error("Could not load competitions");
        const data = await res.json();
        setCompetitions(data.competitions || []);
      } catch (err) {
        if (err.name !== "AbortError") toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  /* Closing soonest first, so the most urgent thing is the first thing. */
  const { closing, rest } = useMemo(() => {
    const open = competitions.filter((c) => !deadlineState(c.deadline).isClosed);
    const withDate = open
      .filter((c) => c.deadline)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    const withoutDate = open.filter((c) => !c.deadline);
    const ordered = [...withDate, ...withoutDate];
    return { closing: ordered.slice(0, 3), rest: ordered.slice(3) };
  }, [competitions]);

  const openCount = competitions.filter((c) => !deadlineState(c.deadline).isClosed).length;

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
      {/* Intro — a sentence and an action, not a full screen of type. */}
      <div className="pb-6 mb-6 border-b border-rule flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Gauntlet</h1>
          <p className="text-muted text-sm mt-1 max-w-xl">
            Host a competition or enter someone else's. Set the brief, review entries, publish
            the standings.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => navigate("/explore")}>Explore</Button>
          <Button onClick={() => navigate("/add-comp")}>Host a competition</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 sm:gap-10 pb-6 mb-8 border-b border-rule">
        <Fact k="Competitions">{globalStats?.totalCompetitions ?? competitions.length}</Fact>
        <Fact k="Open now">{openCount}</Fact>
        <Fact k="Entrants">{globalStats?.totalParticipants ?? 0}</Fact>
      </div>

      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-base font-semibold text-ink">Closing soonest</h2>
        <button onClick={() => navigate("/explore")} className="text-sm text-muted hover:text-ink">
          See all
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-rule rounded-sm p-5 animate-pulse">
              <div className="h-3 w-24 bg-surface-alt rounded" />
              <div className="h-4 w-3/4 bg-surface-alt rounded mt-4" />
              <div className="h-3 w-full bg-surface-alt rounded mt-3" />
              <div className="h-9 w-full bg-surface-alt rounded mt-6" />
            </div>
          ))}
        </div>
      ) : closing.length === 0 ? (
        <Empty
          title="Nothing is open right now"
          action={<Button onClick={() => navigate("/add-comp")}>Host a competition</Button>}
        >
          Once someone opens a competition it appears here, ordered by how soon it closes.
        </Empty>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {closing.map((c) => (
              <CompetitionCard key={c._id} comp={c} />
            ))}
          </div>

          {rest.length > 0 && (
            <>
              <h2 className="text-base font-semibold text-ink mt-12 mb-4">Also open</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((c) => (
                  <CompetitionCard key={c._id} comp={c} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
