const test = require("node:test");
const assert = require("node:assert/strict");

const load = () => import("../../src/helpers/noteEnhancementBatch.ts");

test("does not batch short note enhancements", async () => {
  const { shouldBatchNoteEnhancement } = await load();
  assert.equal(shouldBatchNoteEnhancement("short transcript"), false);
});

test("splits long note enhancements without exceeding the chunk limit", async () => {
  const { splitNoteEnhancementText, NOTE_ENHANCEMENT_BATCH_LIMITS } = await load();
  const input = Array.from({ length: 200 }, (_, index) => `Speaker ${index}: ${"word ".repeat(180)}`).join("\n");
  const chunks = splitNoteEnhancementText(input);

  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= NOTE_ENHANCEMENT_BATCH_LIMITS.chunkCharacters));
  const normalizeWhitespace = (value) => value.replace(/\s+/g, " ").trim();
  assert.equal(normalizeWhitespace(chunks.join("\n")), normalizeWhitespace(input));
});
