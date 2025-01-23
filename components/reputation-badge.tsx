"use client";

import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getUserLevel } from "@/lib/reputation";

interface ReputationBadgeProps {
  reputation: number;
  showTooltip?: boolean;
}

export default function ReputationBadge({
  reputation,
  showTooltip = true,
}: ReputationBadgeProps) {
  const level = getUserLevel(reputation);
  const badge = (
    <Badge variant="outline" className="gap-1">
      <Star className="h-3 w-3" />
      {reputation} • {level.label}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">Reputation Level: {level.label}</p>
            <p className="text-muted-foreground">
              Next level at {level.min + 500} points
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
