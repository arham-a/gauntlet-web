import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { useUser } from "../../context/UserContext";
import { useGlobalStats } from "../../context/GlobalStatsContext";
import { Chip, Fact, Button } from "./ui";
import { formatPrice, formatDate, deadlineState } from "../../lib/competition";

/*
  One card, used by Home and Explore. It takes the raw shape returned by
  GET /comp so the two screens can't drift apart, and it renders only fields
  the API actually sends — the old card invented a difficulty and a countdown.
*/
const CompetitionCard = ({ comp }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUserData, joinedCompetitions } = useUser();
  const { refreshGlobalStats } = useGlobalStats();

  const id = comp._id || comp.id;
  const name = comp.compName || "Untitled competition";
  const description = comp.compDescription || "";
  const category = comp.compType || "General";
  const entrants = comp.participantCount ?? 0;
  const owner = comp.ownerUsername;
  const state = deadlineState(comp.deadline);

  const joined = joinedCompetitions?.includes(id);

  const getUserId = () => {
    const c = document.cookie.split("; ").find((r) => r.startsWith("userID="));
    return c ? c.split("=")[1] : null;
  };

  const open = () => navigate(`/competition-page/${id}`);

  const handleEnter = async () => {
    if (joined) return open();

    const userId = getUserId();
    if (!userId) {
      toast.error("Sign in to enter competitions");
      return navigate("/login");
    }

    // Private competitions are reviewed by the organiser, so entry happens on
    // the competition page where the application form lives.
    if (comp.isPrivate) return open();

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/comp/${id}/participants`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not enter this competition");
      }
      await Promise.all([refreshUserData(), refreshGlobalStats()]);
      toast.success("Entered");
      open();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const actionLabel = () => {
    if (loading) return "Entering…";
    if (joined) return "Open";
    if (state.isClosed) return "View results";
    if (comp.isPrivate) return "Apply to enter";
    return "Enter competition";
  };

  return (
    <div className="bg-surface border border-rule rounded-sm p-5 flex flex-col h-full transition-colors hover:border-rule-strong">
      <div className="flex items-start justify-between gap-3">
        <span className="label truncate">
          {category}
          {owner && <span className="normal-case"> · by {owner}</span>}
        </span>
        <Chip status={state.status}>
          {comp.isPrivate && state.status !== "closed" ? "Private" : state.label}
        </Chip>
      </div>

      <button
        onClick={open}
        className="text-left mt-3 group"
        aria-label={`Open ${name}`}
      >
        <h3 className="text-[1.05rem] font-semibold tracking-tight text-ink group-hover:text-brand transition-colors flex items-start gap-1.5">
          {comp.isPrivate && <LockClosedIcon className="w-4 h-4 mt-[3px] shrink-0 text-muted" />}
          <span>{name}</span>
        </h3>
      </button>

      <p className="text-muted text-sm leading-relaxed mt-1.5 line-clamp-2">{description}</p>

      <div className="grid grid-cols-3 gap-3 border-t border-rule mt-auto pt-4">
        <Fact k="Entry">{formatPrice(comp.price)}</Fact>
        <Fact k="Entrants">{entrants}</Fact>
        <Fact k="Closes" accent={state.status === "closing"}>
          {state.status === "none" ? "—" : state.isClosed ? "Closed" : formatDate(comp.deadline)}
        </Fact>
      </div>

      <Button
        onClick={handleEnter}
        disabled={loading}
        variant={joined || state.isClosed ? "ghost" : "primary"}
        className="mt-4 w-full"
      >
        {actionLabel()}
      </Button>
    </div>
  );
};

export default CompetitionCard;
