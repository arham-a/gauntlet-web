import { useState } from "react";
import { toast, Toaster } from "sonner";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../assets/components/ui";

const Signup = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password } = formData;

    if (!username || !email || !password) {
      toast.error("Fill in every field to create your account");
      return;
    }
    if (password.length < 6) {
      toast.error("Use at least 6 characters for your password");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, formData);
      toast.success("Account created — sign in to continue");
      navigate("/login", { replace: true });
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(
        Array.isArray(msg) ? msg.join(", ") : msg || "Could not create that account"
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
        <h1 className="text-xl font-semibold tracking-tight text-ink mt-8">Create an account</h1>
        <p className="text-muted text-sm mt-1">
          Free. You can enter competitions or host your own straight away.
        </p>

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
            <p className="text-xs text-muted mt-1.5">You'll sign in with this, not your email.</p>
          </div>

          <div>
            <label htmlFor="email" className="label block mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className={field}
            />
          </div>

          <div>
            <label htmlFor="password" className="label block mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              className={field}
            />
            <p className="text-xs text-muted mt-1.5">At least 6 characters.</p>
          </div>

          <Button type="submit" disabled={loading} className="mt-1 w-full">
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-muted mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-brand hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
