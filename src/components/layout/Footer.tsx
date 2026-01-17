import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function Footer() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleComingSoon = (e: React.MouseEvent, featureName: string) => {
    e.preventDefault();
    toast({
      title: "Coming Soon",
      description: `${featureName} is currently under development. Stay tuned!`,
    });
  };

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <span className="text-sm font-bold text-primary-foreground">D</span>
              </div>
              <span className="font-display text-lg font-bold">DeepTech</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Connecting deep-tech innovators with world-class experts for transformative collaboration.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Platform</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/experts" className="text-sm text-muted-foreground hover:text-foreground">Find Experts</Link></li>
              <li>
                <button
                  onClick={(e) => handleComingSoon(e, "How It Works")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleComingSoon(e, "Pricing")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <button
                  onClick={(e) => handleComingSoon(e, "Help Center")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleComingSoon(e, "Blog")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Blog
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleComingSoon(e, "Case Studies")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Case Studies
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <button
                  onClick={(e) => handleComingSoon(e, "Privacy Policy")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleComingSoon(e, "Terms of Service")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleComingSoon(e, "IP Policy")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  IP Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DeepTech Platform. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
