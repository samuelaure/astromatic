/**
 * Constants for reading speed
 * Average reading speed: 200-250 wpm.
 * For video, we target ~150 wpm to ensure readability.
 */
const WORDS_PER_SECOND = 3.6; // 216 wpm
const FPS = 30;

export function calculateSequenceDuration(text) {
  if (!text) return 0;
  const wordCount = text.split(/\s+/).length;
  const durationInSeconds = Math.max(wordCount / WORDS_PER_SECOND, 1);
  return Math.round(durationInSeconds * FPS);
}

export function calculateTotalFrames(sequences) {
  return Object.values(sequences).reduce((acc, text) => {
    return acc + calculateSequenceDuration(text);
  }, 0);
}
