import { useState } from 'react';
import { WebLayout } from '@/components/layout/WebLayout';
import { Friend } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Flame, Send, Camera } from 'lucide-react';

// Mock data
const mockFriends: Friend[] = [
    { id: '1', name: 'Sarah Wilson', streak: 45, avatar: 'SW', lastActive: new Date(), todayHighlight: 'Completed 4h study session!' },
    { id: '2', name: 'Mike Chen', streak: 12, avatar: 'MC', lastActive: new Date(Date.now() - 1000 * 60 * 30), todayHighlight: 'Aced the calculus quiz' },
    { id: '3', name: 'Emma Davis', streak: 8, avatar: 'ED', lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: '4', name: 'James Rod', streak: 0, avatar: 'JR', lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24) },
];

export default function StreaksPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [friends, setFriends] = useState(mockFriends);

    const filteredFriends = friends.filter(friend =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendStreak = (friendId: string) => {
        // Mock sending streak
        console.log(`Sending streak to ${friendId}`);
    };

    return (
        <WebLayout>
            <div className="p-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Streaks & Friends</h1>
                        <p className="text-muted-foreground mt-1">Keep the flame alive! 🔥</p>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search friends..."
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="divide-y divide-border">
                        {filteredFriends.map((friend) => (
                            <div key={friend.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg border-2 border-transparent hover:border-primary transition-colors cursor-pointer">
                                        {friend.avatar}
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-foreground">{friend.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            {friend.todayHighlight ? (
                                                <span className="text-primary/80">{friend.todayHighlight}</span>
                                            ) : (
                                                <span>
                                                    {friend.lastActive && new Date().getTime() - friend.lastActive.getTime() < 1000 * 60 * 60
                                                        ? 'Active recently'
                                                        : 'Offline'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Streak Counter */}
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-lg">{friend.streak}</span>
                                        <Flame className={`w-5 h-5 ${friend.streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-muted-foreground'}`} />
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80"
                                        onClick={() => handleSendStreak(friend.id)}
                                    >
                                        <Camera className="w-5 h-5 text-foreground" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredFriends.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            No friends found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>
        </WebLayout>
    );
}
