const request = require('supertest');
const { prepare, cleanup } = require('../../db/mock');
const app = require('../../app');

jest.mock('../util');
const { setMockDate } = require('../util');

beforeAll(async () => {
  await prepare();
});

beforeEach(() => {
  setMockDate();
});

afterAll(async () => {
  await cleanup();
});

const get = async (url) => {
  const response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const { body } = response;
  return body;
};

test('get new words', async () => {
  const body = await get('/api/select/new');
  expect(body.length).toBe(9);
});

test.each([
  ['E2001', 4],
  ['F2001', 4],
  ['J2001', 4],
  ['E2002', 5],
  ['F2003', 5],
  ['N0', 0],
])('get words to learn in level %s', async (level, count) => {
  const body = await get(`/api/select/${level}`);
  expect(body.length).toBe(count);
});

test.each([
  ['E2001', 1, { word: 'a', yomigana: 'b', meaning: "c'c" }],
  ['F2001', 1, { word: 'd', yomigana: 'e', meaning: 'f' }],
  ['J2001', 1, { word: 'g', yomigana: 'h', meaning: 'i' }],
  ['J2001', 10, {}],
])('get word', async (level, index, expected) => {
  const word = await get(`/api/select/${level}/${index}`);
  expect(word).toEqual(expected);
});

test('get meta', async () => {
  const { langs, levels } = await get('/api/meta/-540');
  expect(langs).toStrictEqual({
    E: { learned: 15, learning: 14, fresh: 3 },
    F: { learned: 15, learning: 14, fresh: 3 },
    J: { learned: 16, learning: 14, fresh: 3 },
  });
  expect(levels).toStrictEqual([
    {
      level: 'E2001',
      summary: [
        [0, 0, 1],
        [8, 7, 1],
        [9, 8, 1],
        [10, 9, 1],
      ],
    },
    {
      level: 'E2002',
      summary: [
        [0, 0, 1],
        [4, 3, 1],
        [5, 4, 1],
        [6, 5, 1],
        [7, 6, 1],
      ],
    },
    {
      level: 'E2003',
      summary: [
        [0, 0, 1],
        [1, 0, 2],
        [2, 1, 1],
        [3, 2, 1],
      ],
    },
    {
      level: 'F2001',
      summary: [
        [0, 0, 1],
        [8, 7, 1],
        [9, 8, 1],
        [10, 9, 1],
      ],
    },
    {
      level: 'F2002',
      summary: [
        [0, 0, 1],
        [4, 3, 1],
        [5, 4, 1],
        [6, 5, 1],
        [7, 6, 1],
      ],
    },
    {
      level: 'F2003',
      summary: [
        [0, 0, 1],
        [1, 0, 2],
        [2, 1, 1],
        [3, 2, 1],
      ],
    },
    {
      level: 'J2001',
      summary: [
        [0, 0, 1],
        [8, 7, 1],
        [9, 8, 1],
        [10, 9, 1],
      ],
    },
    {
      level: 'J2002',
      summary: [
        [0, 0, 1],
        [4, 3, 1],
        [5, 4, 1],
        [6, 5, 1],
        [7, 6, 1],
      ],
    },
    {
      level: 'J2003',
      summary: [
        [0, 0, 1],
        [1, 0, 2],
        [2, 1, 1],
        [3, 2, 1],
      ],
    },
  ]);
});

test.each([
  ['a', 1, 15],
  ['a[b', 2, 15],
  ['x[b', 2, 15],
  ['x（b', 2, 15],
  ['a[b]', 2, 15],
  ['x[b]', 2, 15],
  ['x（b）', 2, 15],
  ['x·b', 2, 15],
  ['a·d', 2, 30],
  ['a[m', 1, 15],
  ['m', 0, 0],
])('search %s', async (pattern, patternCount, wordCount) => {
  const body = await get(encodeURI(`/api/search/${pattern}`));
  expect(body.patterns.length).toBe(patternCount);
  expect(body.words.length).toBe(wordCount);
});

test.each([
  ['E', -540, 5, '2020-07-13T09:00:00.000+09:00'],
  ['E', -540, 3, '2020-07-12T09:00:00.000+09:00'],
  ['E', -540, 6, '2020-07-14T09:00:00.000+09:00'],
  ['S', -540, 0, '2020-07-13T09:00:00.000+09:00'],
])('get daily %s %d', async (lang, tz, expected, today) => {
  setMockDate(today);
  const words = await get(`/api/daily/${lang}/${tz}`);
  expect(words.length).toBe(expected);
});
