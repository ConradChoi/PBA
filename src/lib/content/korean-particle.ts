// Picks the Korean subject particle (이/가) for a name written in the Latin
// alphabet, e.g. the English layer names (VALUE, CUSTOMER, PROCESS, ...).
//
// Korean's 이/가 choice is normally driven by whether the preceding syllable
// ends in a consonant (받침) or a vowel, based on how the word is actually
// pronounced. Our layer names are English words rendered in Korean copy, so
// there is no single canonical Korean reading to hang that rule on. To keep
// the choice deterministic and testable, we approximate it from the name's
// final English letter instead: a name ending in a vowel letter (a, e, i, o,
// u) or the letter y is treated as ending in a vowel sound and takes 가;
// anything else (a consonant letter) is treated as ending in a consonant
// sound and takes 이.
export function subjectParticle(name: string): "이" | "가" {
  const lastLetter = name.trim().slice(-1).toLowerCase();
  const isVowelLike = /[aeiouy]/.test(lastLetter);
  return isVowelLike ? "가" : "이";
}
