import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { PageHeader, Fact, Button, Empty } from "../assets/components/ui";
import { formatDate } from "../lib/competition";

const Profile = () => {
  const { isSignedIn, userInfo, stats, recentActivity, userId, loading, refreshUserData } = useUser();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [language, setLanguage] = useState("en");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(userInfo?.info?.name || "");
    setLanguage(userInfo?.info?.language || "en");
  }, [userInfo]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/setting/update-user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID: userId, name: displayName, language }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Could not save your details");
      }
      await refreshUserData();
      toast.success("Saved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!loading && !isSignedIn) {
    return (
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8">
        <PageHeader title="Profile" />
        <Empty title="You're not signed in" action={<Button onClick={() => navigate("/login")}>Sign in</Button>}>
          Sign in to see the competitions you've entered and hosted.
        </Empty>
      </div>
    );
  }

  const field =
    "w-full bg-surface border border-rule rounded-sm px-3 py-2 text-sm text-ink outline-none focus:border-rule-strong";

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8">
      <PageHeader title={userInfo?.username || "Profile"}>
        {userInfo?.email}
        {userInfo?.createdAt && ` · joined ${formatDate(userInfo.createdAt)}`}
      </PageHeader>

      {/*
        One source of truth. The old screen showed a "Competitions" count from a
        different place than the sidebar, so the two disagreed on one screen.
      */}
      <div className="grid grid-cols-3 gap-6 sm:gap-10 pb-6 mb-8 border-b border-rule">
        <Fact k="Entered">{stats?.competitionsJoined ?? 0}</Fact>
        <Fact k="Hosted">{stats?.competitionsCreated ?? 0}</Fact>
        <Fact k="Points">{(stats?.totalPoints ?? 0).toLocaleString()}</Fact>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <section>
          <h2 className="text-base font-semibold text-ink mb-1">Your details</h2>
          <p className="text-muted text-sm mb-4">
            Username and email are fixed for now — there's no endpoint to change them yet.
          </p>

          <form onSubmit={save} className="flex flex-col gap-4">
            <div>
              <label className="label block mb-1.5">Username</label>
              <input value={userInfo?.username || ""} readOnly disabled className={`${field} opacity-60`} />
            </div>
            <div>
              <label className="label block mb-1.5">Email</label>
              <input value={userInfo?.email || ""} readOnly disabled className={`${field} opacity-60`} />
            </div>
            <div>
              <label htmlFor="displayName" className="label block mb-1.5">Display name</label>
              <input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className={field} placeholder="How your name appears to others" />
            </div>
            <div>
              <label htmlFor="language" className="label block mb-1.5">Language</label>
              <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className={field}>
                <option value="en">English</option>
                <option value="ur">Urdu</option>
              </select>
            </div>
            <Button type="submit" disabled={saving} className="self-start">
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink mb-4">Recent activity</h2>
          {recentActivity?.length ? (
            <ul className="border border-rule rounded-sm bg-surface">
              {recentActivity.map((a, i) => (
                <li key={i} className="flex items-baseline gap-3 px-4 py-3 border-b border-rule last:border-b-0">
                  <span className="label shrink-0 w-14">{a.action}</span>
                  <Link to={`/competition-page/${a.compId}`} className="text-sm text-ink hover:text-brand truncate">
                    {a.competition}
                  </Link>
                  {/* null date renders an em dash rather than "NaN years ago" */}
                  <span className="num text-xs text-muted ml-auto shrink-0">{a.date || "—"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="Nothing here yet" action={<Button onClick={() => navigate("/explore")}>Explore</Button>}>
              Competitions you enter or host will appear here.
            </Empty>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;
