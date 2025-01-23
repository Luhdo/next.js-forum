"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MessageSquare, Award, Calendar, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ReputationBadge from "@/components/reputation-badge";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    website: "",
  });

  useEffect(() => {
    async function fetchUserData() {
      try {
        const [profileRes, reputationRes] = await Promise.all([
          fetch("/api/users/profile"),
          fetch("/api/users/reputation"),
        ]);

        if (!profileRes.ok || !reputationRes.ok) throw new Error();

        const [profile, reputation] = await Promise.all([
          profileRes.json(),
          reputationRes.json(),
        ]);

        setUserData({ ...profile, ...reputation });
        setFormData({
          bio: profile.bio || "",
          location: profile.location || "",
          website: profile.website || "",
        });
      } catch (error) {
        toast.error("Failed to load user data");
      }
    }

    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  if (!session?.user) {
    router.push("/auth/signin");
    return null;
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error();

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update profile");
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={session.user.image || ""}
              alt={session.user.name || ""}
            />
            <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{session.user.name}</h1>
                <p className="text-muted-foreground">{session.user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{session.user.role}</Badge>
                  <ReputationBadge reputation={userData.reputation} />
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined{" "}
                    {formatDistanceToNow(new Date(userData.createdAt), {
                      addSuffix: true,
                    })}
                  </Badge>
                </div>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Tell us about yourself..."
                    className="h-24"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="Where are you based?"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                    placeholder="Your website URL"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save Changes</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-4 space-y-4">
                <p className="text-sm">{userData.bio || "No bio yet"}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {userData.location && <span>📍 {userData.location}</span>}
                  {userData.website && (
                    <a
                      href={userData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {userData.website}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="reputation" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Reputation
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2">
            <Award className="h-4 w-4" />
            Achievements
          </TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="space-y-4">
          {/* Existing activity content */}
        </TabsContent>
        <TabsContent value="reputation" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Reputation History</h3>
            <div className="space-y-4">
              {userData.reputationHistory?.map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {entry.action.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <Badge variant={entry.points > 0 ? "default" : "destructive"}>
                    {entry.points > 0 ? "+" : ""}
                    {entry.points}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="achievements" className="space-y-4">
          {/* Existing achievements content */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
