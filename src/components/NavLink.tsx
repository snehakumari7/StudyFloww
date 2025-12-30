import { NavLink as RouterNavLink, NavLinkProps, useNavigate } from "react-router-dom";
import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  requiresAuth?: boolean; // New prop for auth-protected links
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, requiresAuth = false, ...props }, ref) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const [intendedDestination, setIntendedDestination] = useState<string>("");

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (requiresAuth && !user) {
        e.preventDefault();
        setIntendedDestination(typeof to === 'string' ? to : to.pathname || '/');
        setShowAuthPrompt(true);
      }
    };

    return (
      <>
        <RouterNavLink
          ref={ref}
          to={to}
          className={({ isActive, isPending }) =>
            cn(className, isActive && activeClassName, isPending && pendingClassName)
          }
          onClick={handleClick}
          {...props}
        />

        {/* Auth Prompt Dialog */}
        <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LogIn className="w-5 h-5 text-primary" />
                Sign In Required
              </DialogTitle>
              <DialogDescription>
                Please sign in or create an account to access this feature.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-4">
              <Button
                onClick={() => {
                  // Store intended destination for redirect after sign in
                  localStorage.setItem('redirectAfterAuth', intendedDestination);
                  setShowAuthPrompt(false);
                  navigate('/auth?mode=signup');
                }}
                className="w-full h-11 gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Button>
              <Button
                onClick={() => {
                  // Store intended destination for redirect after sign in
                  localStorage.setItem('redirectAfterAuth', intendedDestination);
                  setShowAuthPrompt(false);
                  navigate('/auth');
                }}
                variant="outline"
                className="w-full h-11 gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
