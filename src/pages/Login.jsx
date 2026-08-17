import { useState } from "react";
import { toast, Toaster } from "sonner";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { Button } from "../assets/components/ui";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast.error("Enter your username and password");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, formData);
      document.cookie = `token=${res.data.token}; path=/`;
      document.cookie = `userID=${res.data.data._id}; path=/;`;
      await login();
      // replace, so Back doesn't return to the sign-in form once signed in.
      navigate("/", { replace: true });
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(
        Array.isArray(msg) ? msg.join(", ") : msg || "That username and password don't match"
      );
    } finally {
      setLoading(false);
    }
  };

  const field =
    "w-full bg-surface border border-rule rounded-sm px-3 py-2 text-sm text-ink outline-none focus:border-rule-strong";

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-5 py-12">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--surface)",
            color: "var(--ink)",
            border: "1px solid var(--rule)",
            borderRadius: "4px",
          },
        }}
      />

      <div className="w-full max-w-sm">
        <Link to="/" className="block text-lg font-semibold tracking-tight text-ink">
          Gauntlet
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-ink mt-8">Sign in</h1>
        <p className="text-muted text-sm mt-1">Enter competitions and manage the ones you host.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="label block mb-1.5">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              className={field}
            />
          </div>

          <div>
            <label htmlFor="password" className="label block mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className={field}
            />
          </div>

          <Button type="submit" disabled={loading} className="mt-1 w-full">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-sm text-muted mt-6">
          No account?{" "}
          <Link to="/signup" className="text-brand hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
