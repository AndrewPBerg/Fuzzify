import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-container flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-center max-w-md animate-scale-in">
        <h1 className="text-7xl font-bold mb-4 text-muted-foreground/30">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
        <p className="text-muted-foreground mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
} 