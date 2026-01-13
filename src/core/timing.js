/**
 * Constants for reading speed
 * Average reading speed: 200-250 wpm.
 * For video, we target ~150 wpm to ensure readability.
 */
const WORDS_PER_SECOND = 2.5;
const FPS = 30;
const MIN_DURATION_FRAMES = 45; // At least 1.5 seconds

export function calculateSequenceDuration(text) {
  if (!text) return 0;
  const wordCount = text.split(/\s+/).length;
  const durationInSeconds = Math.max(wordCount / WORDS_PER_SECOND, 1.5);
  return Math.round(durationInSeconds * FPS);
}

export function calculateTotalFrames(sequences) {
  return Object.values(sequences).reduce((acc, text) => {
    return acc + calculateSequenceDuration(text);
  }, 0);
}
