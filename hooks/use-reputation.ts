import { useState } from "react";
import { toast } from "sonner";

export function useReputation() {
  const [isUpdating, setIsUpdating] = useState(false);

  async function updateReputation(userId: string, action: string) {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const response = await fetch("/api/users/reputation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      return data.reputation;
    } catch (error) {
      toast.error("Failed to update reputation");
      return null;
    } finally {
      setIsUpdating(false);
    }
  }

  return { updateReputation, isUpdating };
}
