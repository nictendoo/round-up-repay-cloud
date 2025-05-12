
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cloud-gradient font-manrope">
      <div className="text-center card-element p-12 max-w-md">
        <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-primary-gradient">404</h1>
        <p className="text-xl text-gray-700 mb-6">Oops! This page doesn't exist.</p>
        <p className="text-gray-500 mb-8">The page you're looking for isn't available in MicroRepay.</p>
        <Button asChild className="bg-primary-gradient hover:opacity-90">
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
