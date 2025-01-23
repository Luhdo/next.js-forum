"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ReputationBadge from "@/components/reputation-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<"all" | "month" | "week">("all");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch(
          `/api/users/leaderboard?timeframe=${timeframe}`
        );
        if (!response.ok) throw new Error();
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [timeframe]);

  if (loading) {
    return <div>Loading leaderboard...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Reputation Leaderboard</h1>
        <p className="text-muted-foreground">
          Top contributors in our community
        </p>
      </div>

      <Tabs
        value={timeframe}
        onValueChange={(v) => setTimeframe(v as typeof timeframe)}
      >
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <Trophy className="h-4 w-4" />
            All Time
          </TabsTrigger>
          <TabsTrigger value="month" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            This Month
          </TabsTrigger>
          <TabsTrigger value="week" className="gap-2">
            <Clock className="h-4 w-4" />
            This Week
          </TabsTrigger>
        </TabsList>

        <TabsContent value={timeframe}>
          <Card className="p-6">
            <div className="space-y-6">
              {users.map((user, index) => (
                <div key={user._id} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 text-xl font-bold text-muted-foreground">
                    #{index + 1}
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{user.name}</span>
                      <Badge variant="secondary">{user.role}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <ReputationBadge
                        reputation={user.reputation}
                        showTooltip={false}
                      />
                      <span className="text-sm text-muted-foreground">
                        Joined{" "}
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {user.reputationGain > 0 && "+"}
                    {user.reputationGain}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
