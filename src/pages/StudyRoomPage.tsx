import { useState } from 'react';
import { WebLayout } from '@/components/layout/WebLayout';
import { Video, Users, Plus, Clock, Calendar, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const scheduledSessions = [
  {
    id: '1',
    title: 'Economics Study Group',
    participants: 4,
    time: '3:00 PM',
    date: 'Today',
  },
  {
    id: '2',
    title: 'Research Paper Review',
    participants: 2,
    time: '5:30 PM',
    date: 'Tomorrow',
  },
];

export default function StudyRoomPage() {
  const [roomCode, setRoomCode] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCreateRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
    toast({
      title: 'Room Created!',
      description: `Your room code is ${code}. Share it with friends to join.`,
    });
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinRoom = () => {
    if (roomCode.length < 4) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a valid room code.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Joining Room...',
      description: `Connecting to room ${roomCode.toUpperCase()}`,
    });
  };

  return (
    <WebLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Study Room</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Host or join group study sessions with your friends
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-primary text-white border-0 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Study Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="roomName">Room Name</Label>
                  <Input
                    id="roomName"
                    placeholder="e.g., Math Study Group"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                  />
                </div>
                {generatedCode && (
                  <div className="p-4 bg-secondary rounded-xl">
                    <p className="text-sm text-muted-foreground mb-2">Room Code</p>
                    <div className="flex items-center gap-2">
                      <code className="text-2xl font-mono font-bold text-primary">{generatedCode}</code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyCode}
                        className="ml-auto"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}
                <Button
                  onClick={handleCreateRoom}
                  className="w-full gradient-primary text-white border-0"
                >
                  Generate Room Code
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Start */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
          <Card className="hover-lift cursor-pointer border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-4 p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-foreground truncate">Start Instant Room</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Begin studying right away</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground">Join with Code</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Enter a room code to join</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="font-mono uppercase"
                  maxLength={6}
                />
                <Button onClick={handleJoinRoom} variant="outline">Join</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scheduled Sessions */}
        <div>
          <h2 className="font-semibold text-foreground mb-4">Scheduled Sessions</h2>
          
          <div className="space-y-3">
            {scheduledSessions.map((session) => (
              <Card key={session.id} className="hover-lift">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <Video className="w-5 h-5 text-foreground" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-foreground truncate">{session.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {session.participants}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {session.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {scheduledSessions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No scheduled sessions</p>
              <p className="text-sm mt-1">Create a room to start studying with friends</p>
            </div>
          )}
        </div>
      </div>
    </WebLayout>
  );
}
