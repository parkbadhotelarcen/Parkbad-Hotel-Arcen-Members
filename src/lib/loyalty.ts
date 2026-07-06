import crypto from "node:crypto";
import type { Level, Reward } from "@/lib/types";

export function makeToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function makeControlCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export function formatGuestNumber(sequence: number) {
  return `PHA-${String(sequence).padStart(6, "0")}`;
}

export function fullName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ") || "Gast";
}

export function levelForVisits(levels: Level[], visits: number) {
  return (
    levels.find((level) => visits >= level.min_visits && (level.max_visits === null || visits <= level.max_visits)) ||
    levels[0]
  );
}

export function nextReward(rewards: Reward[], totalVisits: number) {
  return rewards.filter((reward) => reward.active && reward.visit_count > totalVisits).sort((a, b) => a.visit_count - b.visit_count)[0] || null;
}

export function progressToReward(totalVisits: number, reward: Reward | null) {
  if (!reward) return { current: totalVisits, target: totalVisits, percent: 100, remaining: 0 };
  const previousMilestone = totalVisits >= reward.visit_count ? reward.visit_count : 0;
  const span = Math.max(1, reward.visit_count - previousMilestone);
  const current = Math.min(totalVisits - previousMilestone, span);
  const percent = Math.min(100, Math.round((current / span) * 100));
  return { current: totalVisits, target: reward.visit_count, percent, remaining: reward.visit_count - totalVisits };
}

export function toDateLabel(value?: string | null) {
  if (!value) return "Nog geen verblijf";
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}
