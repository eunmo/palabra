const { prepare, cleanup } = require('../mock');
const {
  getNew,
  getLearning,
  getLearningInLang,
  getLearningInLevel,
  getLangSummary,
  getSummary,
  getMatch,
  getWord,
} = require('.');

beforeAll(async () => {
  await prepare();
});

afterAll(async () => {
  await cleanup();
});

test('get new words', async () => {
  const rows = await getNew();
  expect(rows.length).toBe(9);
});

test('get words to learn', async () => {
  const rows = await getLearning();
  expect(rows.length).toBe(42);
});

test('get words to learn in lang', async () => {
  const rows = await getLearningInLang('E');
  expect(rows.length).toBe(14);
});

test('get words to learn in level', async () => {
  let rows = await getLearningInLevel('E2001');
  expect(rows.length).toBe(4);
  rows = await getLearningInLevel('E2003');
  expect(rows.length).toBe(5);
});

test('get language summary', async () => {
  const rows = await getLangSummary();
  expect(rows.length).toBe(37);
});

test('get summary', async () => {
  const rows = await getSummary();
  expect(rows.length).toBe(39);
});

test.each([
  [['a'], 15],
  [['a', 'b'], 15],
  [['a', 'd'], 30],
  [["c'c"], 15],
])('get match', async (patterns, count) => {
  const rows = await getMatch(patterns);
  expect(rows.length).toBe(count);
});

test.each([
  ['E2001', 1, { word: 'a', yomigana: 'b', meaning: "c'c" }],
  ['F2001', 1, { word: 'd', yomigana: 'e', meaning: 'f' }],
  ['J2001', 1, { word: 'g', yomigana: 'h', meaning: 'i' }],
  ['J2001', 10, {}],
])('get word', async (level, index, expected) => {
  const word = await getWord(level, index);
  expect(word).toEqual(expected);
});
