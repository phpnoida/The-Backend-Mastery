// ════════════════════════════════════════════════════════════════════
// 03 — STRINGS  (30 questions · simple → medium → tough)
// Run with Quokka. "Expected" is your self-check. No solution code given.
// Slugs, masking, parsing, formatting — the string work APIs actually do.
// ════════════════════════════════════════════════════════════════════


// ╭──────────────────────────────────────────────────────────────────╮
// │  SIMPLE                                                           │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q01 ── lowercase it, then UPPERCASE it.
// Expected: hello world  HELLO WORLD
const q01Str = "Hello World";
// ↓


// ── Q02 ── trim the surrounding whitespace.
// Expected: "amit@x.com"  (length 10)
const q02Email = "   amit@x.com   ";
// ↓


// ── Q03 ── string length.
// Expected: 8
const q03Str = "password";
// ↓


// ── Q04 ── split the CSV into an array.
// Expected: ["red", "green", "blue"]
const q04Csv = "red,green,blue";
// ↓


// ── Q05 ── join the array into a comma string.
// Expected: "node,express,mongo"
const q05Tags = ["node", "express", "mongo"];
// ↓


// ── Q06 ── does it contain "@"? does it END with ".com"?
// Expected: true  true
const q06Email = "sara@example.com";
// ↓


// ── Q07 ── does it START with "Bearer "?
// Expected: true
const q07Header = "Bearer abc.def.ghi";
// ↓


// ── Q08 ── replace ALL hyphens with spaces.
// Expected: "the backend mastery"
const q08Slug = "the-backend-mastery";
// ↓


// ── Q09 ── first 3 characters. (slice)
// Expected: "abc"
const q09Str = "abcdef";
// ↓


// ── Q10 ── pad the order number to 5 digits with leading zeros. (padStart)
// Expected: "00042"
const q10Order = "42";
// ↓


// ╭──────────────────────────────────────────────────────────────────╮
// │  MEDIUM                                                           │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q11 ── capitalize the first letter, keep the rest.
// Expected: "Amit"
const q11Name = "amit";
// ↓


// ── Q12 ── title-case every word.
// Expected: "The Quick Brown Fox"
const q12Sentence = "the quick brown fox";
// ↓


// ── Q13 ── slugify: lowercase + spaces → hyphens.
// Expected: "hello-backend-world"
const q13Title = "Hello Backend World";
// ↓


// ── Q14 ── reverse the string.
// Expected: "tpircsavaj"
const q14Str = "javascript";
// ↓


// ── Q15 ── count how many times "a" appears.
// Expected: 4
const q15Str = "abracadabra";
// ↓


// ── Q16 ── extract the token after "Bearer ".
// Expected: "abc.def.ghi"
const q16Header = "Bearer abc.def.ghi";
// ↓


// ── Q17 ── grab the file extension (text after the last dot).
// Expected: "pdf"
const q17File = "report.final.pdf";
// ↓


// ── Q18 ── collapse multiple spaces into one, then trim.
// Expected: "hello world foo"
const q18Str = "  hello   world    foo  ";
// ↓


// ── Q19 ── truncate to 10 chars + "…" if longer than 10.
// Expected: "The quick …"
const q19Str = "The quick brown fox";
// ↓


// ── Q20 ── build a greeting with a template literal.
// Expected: "Hi Amit, you have 3 messages"
const q20Name = "Amit";
const q20Count = 3;
// ↓


// ╭──────────────────────────────────────────────────────────────────╮
// │  TOUGH  (formatting / parsing you'll do for real responses)       │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q21 ── mask an email: first char + "***" + domain.
// Expected: "a***@x.com"
const q21Email = "amit@x.com";
// ↓


// ── Q22 ── mask a card: keep only the last 4 digits.
// Expected: "************3456"
const q22Card = "4111111111113456";
// ↓


// ── Q23 ── count word frequency → object.
// Expected: { the: 2, cat: 1, sat: 1 }
const q23Text = "the cat the sat";
// ↓


// ── Q24 ── is it a palindrome (ignore case & spaces)? log true/false.
// Expected: true
const q24Str = "Race car";
// ↓


// ── Q25 ── initials from a full name (uppercase).
// Expected: "AKS"
const q25Name = "Amit Kumar Singh";
// ↓


// ── Q26 ── parse a query string "page=2&limit=10" into an object (values as strings).
// Expected: { page: "2", limit: "10" }
const q26Qs = "page=2&limit=10";
// ↓


// ── Q27 ── camelCase a snake_case key.
// Expected: "createdAtUtc"
const q27Key = "created_at_utc";
// ↓


// ── Q28 ── snake_case a camelCase key.
// Expected: "first_name"
const q28Key = "firstName";
// ↓


// ── Q29 ── slug with cleanup: trim, lowercase, collapse spaces, spaces→hyphens,
//          strip characters that aren't a-z, 0-9, or hyphen.
// Expected: "hello-world-2026"
const q29Title = "  Hello, World! 2026  ";
// ↓


// ── Q30 ── given "amit kumar singh", return "Singh, Amit" (last name, first name; title-cased).
// Expected: "Singh, Amit"
const q30Name = "amit kumar singh";
// ↓
