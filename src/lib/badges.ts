import { AuraTierBadge } from '../types';

export function calculateAuraBadges(totalDays: number, currentDay: number, planLevel: number = 1): AuraTierBadge[] {
  const isZeroPlan = totalDays === 0;
  const safeDays = isZeroPlan ? 0 : (totalDays > 0 ? totalDays : 180);
  const q1 = isZeroPlan ? 0 : Math.max(1, Math.round(safeDays * 0.25));
  const q2 = isZeroPlan ? 0 : Math.max(2, Math.round(safeDays * 0.50));
  const q3 = isZeroPlan ? 0 : Math.max(3, Math.round(safeDays * 0.75));
  const q4 = safeDays;

  return [
    {
      id: `silver-l${planLevel}`,
      tier: 'silver',
      level: planLevel,
      name: `Silver Aura Badge ${planLevel > 1 ? `Level ${planLevel}` : '1'}`,
      quarter: 1,
      targetDay: q1,
      unlocked: currentDay >= q1,
      unlockedAt: currentDay >= q1 ? `Day ${q1} Milestone` : undefined,
      description: isZeroPlan
        ? 'Awarded for starting Day Zero Sprint with laser focus.'
        : `Awarded for completing 25% of your plan (${q1} of ${safeDays} days) with disciplined focus.`,
      iconName: 'Shield',
      auraReward: 100 * planLevel,
    },
    {
      id: `gold-l${planLevel}`,
      tier: 'gold',
      level: planLevel,
      name: `Gold Aura Badge ${planLevel > 1 ? `Level ${planLevel}` : '1'}`,
      quarter: 2,
      targetDay: q2,
      unlocked: currentDay >= q2,
      unlockedAt: currentDay >= q2 ? `Day ${q2} Milestone` : undefined,
      description: isZeroPlan
        ? 'Awarded for maintaining baseline momentum on Day Zero.'
        : `Awarded for completing 50% of your plan (${q2} of ${safeDays} days) — Halfway to mastery!`,
      iconName: 'Award',
      auraReward: 250 * planLevel,
    },
    {
      id: `platinum-l${planLevel}`,
      tier: 'platinum',
      level: planLevel,
      name: `Platinum Aura Badge ${planLevel > 1 ? `Level ${planLevel}` : '1'}`,
      quarter: 3,
      targetDay: q3,
      unlocked: currentDay >= q3,
      unlockedAt: currentDay >= q3 ? `Day ${q3} Milestone` : undefined,
      description: isZeroPlan
        ? 'Awarded for deep focus execution on Day Zero.'
        : `Awarded for completing 75% of your plan (${q3} of ${safeDays} days) — Unstoppable momentum!`,
      iconName: 'Zap',
      auraReward: 500 * planLevel,
    },
    {
      id: `diamond-l${planLevel}`,
      tier: 'diamond',
      level: planLevel,
      name: `Diamond Aura Badge ${planLevel > 1 ? `Level ${planLevel}` : '1'}`,
      quarter: 4,
      targetDay: q4,
      unlocked: currentDay >= q4,
      unlockedAt: currentDay >= q4 ? `Day ${q4} Milestone` : undefined,
      description: isZeroPlan
        ? 'Awarded for Day Zero completion. Your Aura ascends to Infinity (∞)!'
        : `Awarded for 100% plan completion (${q4} days). Your Aura ascends to Infinity (∞)!`,
      iconName: 'Crown',
      auraReward: 1000 * planLevel,
    },
  ];
}
