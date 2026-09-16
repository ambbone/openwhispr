import type { TranscriptSegment } from "../stores/meetingRecordingStore";
import { normalizeTranscriptSegments } from "./transcriptSpeakerState";
import logger from "./logger";

function parseLegacyTranscriptSegments(raw: string): TranscriptSegment[] {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  return normalizeTranscriptSegments(
    lines.map((line, i) => ({
      id: `legacy-${i}`,
      text: line,
      source: "system" as const,
    }))
  );
}

export function parseTranscriptSegments(raw: string): TranscriptSegment[] {
  if (!raw.startsWith("[")) return parseLegacyTranscriptSegments(raw);
  try {
    const parsed = JSON.parse(raw) as Array<{
      text: string;
      source: "mic" | "system";
      timestamp?: number;
      speaker?: string;
      speakerName?: string;
      speakerIsPlaceholder?: boolean;
      suggestedName?: string;
      suggestedProfileId?: number;
      speakerStatus?: TranscriptSegment["speakerStatus"];
      speakerLocked?: TranscriptSegment["speakerLocked"];
      speakerLockSource?: TranscriptSegment["speakerLockSource"];
    }>;
    return normalizeTranscriptSegments(
      parsed.map((s, i) => ({
        id: `stored-${i}`,
        text: s.text,
        source: s.source,
        timestamp: s.timestamp,
        speaker: s.speaker,
        speakerName: s.speakerName,
        speakerIsPlaceholder: s.speakerIsPlaceholder,
        suggestedName: s.suggestedName,
        suggestedProfileId: s.suggestedProfileId,
        speakerStatus: s.speakerStatus,
        speakerLocked: s.speakerLocked,
        speakerLockSource: s.speakerLockSource,
      }))
    );
  } catch (e) {
    logger.warn("Failed to parse transcript segments", e);
    return parseLegacyTranscriptSegments(raw);
  }
}
