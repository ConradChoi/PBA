// Source of truth for every string on the public site. Its shape is the
// `Messages` type each other locale must satisfy, so a missing or misspelled
// key fails the build rather than showing a key on screen.
const ko = {
  common: {},
  landing: {},
  basicInfo: {},
  wizard: {},
  result: {},
  consult: {},
  privacy: {},
  metadata: {},
} as const;

export type Messages = typeof ko;

export default ko;
