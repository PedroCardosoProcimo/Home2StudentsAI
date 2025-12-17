import { Link } from "react-router-dom";
import { Layout } from "@/frontend/components/layout/Layout";
import { Button } from "@/frontend/components/ui/button";

const NotFound = () => {
  return (
    <Layout>
      <div className="pt-24 md:pt-28 min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-7xl md:text-9xl font-heading font-bold text-primary">
            404
          </h1>
          <p className="mt-4 text-xl md:text-2xl font-heading font-semibold text-foreground">
            Page Not Found
          </p>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved or doesn't exist.
          </p>
          <Button asChild variant="coral" size="lg" className="mt-8">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
