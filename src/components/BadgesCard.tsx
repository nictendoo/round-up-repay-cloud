
import { Trophy } from "lucide-react";
import { Badge as BadgeType } from "@/types";
import { Button } from "@/components/ui/button";
import { mockData } from "@/services/mockData";

interface BadgesCardProps {
  earnedBadgeIds: string[];
  allBadges: BadgeType[];
}

const BadgesCard = ({ earnedBadgeIds, allBadges }: BadgesCardProps) => {
  // Filter to show only earned badges
  const earnedBadges = allBadges.filter(badge => 
    earnedBadgeIds.includes(badge.id)
  );
  
  // Show a maximum of 3 earned badges
  const displayBadges = earnedBadges.slice(0, 3);
  
  // Calculate how many more badges are earned but not displayed
  const moreEarnedCount = Math.max(0, earnedBadges.length - 3);
  
  // Calculate percentage of total badges earned
  const percentEarned = (earnedBadges.length / allBadges.length) * 100;

  return (
    <div className="card-element p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Your Achievements</h3>
        <Trophy className="h-5 w-5 text-coral" />
      </div>
      
      {displayBadges.length > 0 ? (
        <>
          <div className="flex justify-center space-x-4 mb-4">
            {displayBadges.map((badge) => (
              <div key={badge.id} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary-gradient rounded-full flex items-center justify-center mb-2">
                  <span className="text-white text-lg">
                    {badge.name.substring(0, 1)}
                  </span>
                </div>
                <p className="text-xs font-medium text-center">{badge.name}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mb-4">
            <p className="text-sm">
              {moreEarnedCount > 0 
                ? `+${moreEarnedCount} more achievements earned!` 
                : `You've earned ${percentEarned.toFixed(0)}% of available badges`}
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-6 mb-4">
          <p className="text-sm text-gray-500 mb-2">No badges earned yet</p>
          <p className="text-xs text-gray-400">
            Keep using MicroRepay to earn your first badge!
          </p>
        </div>
      )}
      
      <Button variant="outline" className="w-full" size="sm">
        View All Achievements
      </Button>
    </div>
  );
};

export default BadgesCard;
