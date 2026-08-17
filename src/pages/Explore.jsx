import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import CompetitionCard from "../assets/components/CompetitionCard";
import { PageHeader, Empty, Button } from "../assets/components/ui";
import { deadlineState } from "../lib/competition";

const Explore = () => {
  const [competitions, setCompetitions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const [compRes, typeRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/comp`, { signal: controller.signal }),
          fetch(`${import.meta.env.VITE_API_URL}/comp/type`, { signal: controller.signal }),
        ]);

        if (!compRes.ok) throw new Error("Could not load competitions");
        const data = await compRes.json();
        setCompetitions(data.competitions || []);

        if (typeRes.ok) {
          const types = await typeRes.json();
          setCategories(types.map((t) => t.compTypeName).filter(Boolean));
        }
      } catch (err) {
        if (err.name !== "AbortError") toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return competitions.filter((c) => {
      const matchesQuery =
        !q ||
        (c.compName || "").toLowerCase().includes(q) ||
        (c.compDescription || "").toLowerCase().includes(q) ||
        (c.compType || "").toLowerCase().includes(q);

      const matchesCategory = category === "all" || c.compType === category;

      const state = deadlineState(c.deadline);
      const matchesStatus =
        status === "all" ||
        (status === "open" && !state.isClosed) ||
        (status === "closed" && state.isClosed) ||
        (status === "free" && !Number(c.price));

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [competitions, query, category, status]);

  const filters = [
    { key: "all", label: "All" },
    { key: "open", label: "Open" },
    { key: "free", label: "Free entry" },
    { key: "closed", label: "Closed" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
      <PageHeader title="Explore">
        Every competition on Gauntlet. Browse without an account; sign in to enter.
      </PageHeader>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, description or category"
            className="w-full bg-surface border border-rule rounded-sm pl-9 pr-3 py-2 text-sm text-ink placeholder:text-muted focus:border-rule-strong outline-none"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-surface border border-rule rounded-sm px-3 py-2 text-sm text-ink sm:w-56"
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1 border-b border-rule mb-6 overflow-x-auto no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatus(f.key)}
            className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
              status === f.key
                ? "border-brand text-ink font-medium"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="num ml-auto text-xs text-muted pl-4">
          {filtered.length} of {competitions.length}
        </span>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-rule rounded-sm p-5 animate-pulse">
              <div className="h-3 w-24 bg-surface-alt rounded" />
              <div className="h-4 w-3/4 bg-surface-alt rounded mt-4" />
              <div className="h-3 w-full bg-surface-alt rounded mt-3" />
              <div className="h-3 w-2/3 bg-surface-alt rounded mt-2" />
              <div className="h-9 w-full bg-surface-alt rounded mt-6" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Empty
          title={competitions.length === 0 ? "No competitions yet" : "Nothing matches those filters"}
          action={
            competitions.length === 0 ? (
              <Button onClick={() => navigate("/add-comp")}>Host a competition</Button>
            ) : (
              <Button variant="ghost" onClick={() => { setQuery(""); setCategory("all"); setStatus("all"); }}>
                Clear filters
              </Button>
            )
          }
        >
          {competitions.length === 0
            ? "Be the first to host one. You set the brief, the rules and the deadline."
            : "Try a different category, or clear the filters to see everything."}
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CompetitionCard key={c._id} comp={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
