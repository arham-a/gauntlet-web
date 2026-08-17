import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../assets/components/ui";

const NotFound = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
      <div className="max-w-lg">
        <p className="label">Error 404</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink mt-3">
          There's nothing at this address
        </h1>
        <p className="text-muted text-sm mt-2">
          <code className="num text-ink">{pathname}</code> doesn't match any page. It may have
          been moved, or the link may be mistyped.
        </p>
        <div className="flex gap-2 mt-6">
          <Button onClick={() => navigate("/explore")}>Browse competitions</Button>
          <Button variant="ghost" as={Link} to="/">
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
