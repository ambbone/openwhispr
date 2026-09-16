const BATCH_TRIGGER_CHARACTERS = 32_000;
const CHUNK_CHARACTERS = 24_000;

export function shouldBatchNoteEnhancement(text: string): boolean {
  return text.length > BATCH_TRIGGER_CHARACTERS;
}

function splitLongLine(line: string): string[] {
  const parts: string[] = [];
  let remaining = line;
  while (remaining.length > CHUNK_CHARACTERS) {
    let cut = remaining.lastIndexOf(" ", CHUNK_CHARACTERS);
    if (cut < CHUNK_CHARACTERS / 2) cut = CHUNK_CHARACTERS;
    parts.push(remaining.slice(0, cut).trimEnd());
    remaining = remaining.slice(cut).trimStart();
  }
  if (remaining) parts.push(remaining);
  return parts;
}

export function splitNoteEnhancementText(text: string): string[] {
  const chunks: string[] = [];
  let current = "";

  const pushCurrent = () => {
    if (current.trim()) chunks.push(current.trim());
    current = "";
  };

  for (const line of text.split(/\r?\n/)) {
    if (line.length > CHUNK_CHARACTERS) {
      pushCurrent();
      chunks.push(...splitLongLine(line));
      continue;
    }
    const candidate = current ? `${current}\n${line}` : line;
    if (candidate.length > CHUNK_CHARACTERS && current) pushCurrent();
    current = current ? `${current}\n${line}` : line;
  }
  pushCurrent();
  return chunks;
}

export const NOTE_ENHANCEMENT_BATCH_LIMITS = {
  triggerCharacters: BATCH_TRIGGER_CHARACTERS,
  chunkCharacters: CHUNK_CHARACTERS,
} as const;
