import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthRequiredDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    message?: string;
    triggerSource?: string;
}

export function AuthRequiredDialog({ open, onOpenChange, message, triggerSource }: AuthRequiredDialogProps) {
    const navigate = useNavigate();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => {
                // Prevent closing if we really wanted to force it, but for a prompt it's fine to close.
            }}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LogIn className="w-5 h-5 text-primary" />
                        Sign In Required
                    </DialogTitle>
                    <DialogDescription>
                        {message || "Please sign in or create an account to continue."}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 py-4">
                    <Button
                        onClick={() => {
                            onOpenChange(false);
                            // Save redirect if needed?
                            navigate('/auth?mode=signup');
                        }}
                        className="w-full h-11 gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        Sign Up
                    </Button>
                    <Button
                        onClick={() => {
                            onOpenChange(false);
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
    );
}
