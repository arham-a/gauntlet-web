import React from "react";
import { statusClasses } from "../../lib/competition";

/* Small shared primitives. Kept in one file so the visual language stays
   consistent — a chip looks the same on a card, a header and a table row. */

export const Chip = ({ status = "none", children }) => (
  <span
    className={`label rounded-xs px-2 py-[3px] whitespace-nowrap ${statusClasses[status] || statusClasses.none}`}
  >
    {children}
  </span>
);

/** Uppercase key over a mono value — the unit of information on every screen. */
export const Fact = ({ k, children, accent = false }) => (
  <div className="min-w-0">
    <span className="label block mb-[3px]">{k}</span>
    <span className={`num block text-[0.95rem] font-medium truncate ${accent ? "text-brand" : "text-ink"}`}>
      {children}
    </span>
  </div>
);

export const Button = ({ variant = "primary", as: As = "button", className = "", ...props }) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-brand text-on-brand hover:bg-brand-hover",
    ghost: "border border-rule text-ink hover:bg-surface-alt",
    quiet: "text-muted hover:text-ink",
  };
  return <As className={`${base} ${variants[variant]} ${className}`} {...props} />;
};

export const Card = ({ className = "", ...props }) => (
  <div className={`bg-surface border border-rule rounded-sm ${className}`} {...props} />
);

/** An empty screen is an instruction, not a shrug. */
export const Empty = ({ title, children, action }) => (
  <div className="border border-dashed border-rule rounded-sm px-6 py-10 text-center">
    <p className="text-ink font-medium">{title}</p>
    {children && <p className="text-muted text-sm mt-1 max-w-md mx-auto">{children}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const PageHeader = ({ title, children, action }) => (
  <div className="flex flex-wrap items-end justify-between gap-4 pb-5 mb-6 border-b border-rule">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
      {children && <p className="text-muted text-sm mt-1 max-w-2xl">{children}</p>}
    </div>
    {action}
  </div>
);

/**
 * Standings — the signature component. Ranks and scores in tabular mono,
 * hairline separators, your own row marked. Used full on the standings tab
 * and truncated on cards.
 */
export const Standings = ({ rows, currentUserId, limit }) => {
  const shown = limit ? rows.slice(0, limit) : rows;
  if (!shown.length) return null;

  return (
    <div className="border border-rule rounded-sm overflow-hidden bg-surface">
      <div className="grid grid-cols-[44px_1fr_92px] px-4 py-2 border-b border-rule label">
        <span>#</span>
        <span>Entrant</span>
        <span className="text-right">Score</span>
      </div>
      {shown.map((r, i) => {
        const isYou = currentUserId && String(r.userId) === String(currentUserId);
        return (
          <div
            key={r.userId || i}
            className={`grid grid-cols-[44px_1fr_92px] items-center px-4 py-[11px] text-sm border-b border-rule last:border-b-0 ${
              isYou ? "bg-brand-soft" : ""
            }`}
          >
            <span className={`num ${i === 0 ? "text-brand font-semibold" : "text-muted"}`}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="truncate text-ink">
              {r.username}
              {isYou && (
                <span className="label ml-2 border border-brand text-brand rounded-xs px-[5px] py-px">
                  you
                </span>
              )}
            </span>
            <span className="num text-right font-medium text-ink">
              {Number(r.points || 0).toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
};
