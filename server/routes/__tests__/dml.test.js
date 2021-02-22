const request = require('supertest');
const { dml, cleanup } = require('@eunmo/mysql');
const app = require('../../app');

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS words;');
  await dml('CREATE TABLE words LIKE palabra.words;');
});

afterAll(async () => {
  await dml('DROP TABLE IF EXISTS words;');
  await cleanup();
});

beforeEach(async () => {
  await dml('TRUNCATE TABLE words;');
});

const get = async (url) => {
  const response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const { body } = response;
  return body;
};

const crudUrl = '/api/crud';

const del = async (body) => {
  const response = await request(app).delete(crudUrl).send(body);
  expect(response.statusCode).toBe(200);
};

const post = async (body) => {
  const response = await request(app).post(crudUrl).send(body);
  expect(response.statusCode).toBe(200);
};

const put = async (body) => {
  const response = await request(app).put(crudUrl).send(body);
  expect(response.statusCode).toBe(200);

  return response;
};

const sync = async (body) => {
  const response = await request(app).put('/api/sync').send(body);
  expect(response.statusCode).toBe(200);

  return response;
};

test('create one', async () => {
  const [level, word, yomigana, meaning] = ['E2001', 'w', 'y', 'm'];
  await post({ level, word, yomigana, meaning });
  const body = await get('/api/select/new');
  expect(body.length).toBe(1);
  expect(body).toStrictEqual([
    {
      level,
      meaning,
      word,
      yomigana,
      index: 1,
      lastCorrect: null,
      streak: 0,
    },
  ]);
});

test('update one', async () => {
  const [level, index] = ['E2001', 1];
  let [word, yomigana, meaning] = ['w', 'y', 'm'];
  await post({ level, word, yomigana, meaning });
  [word, yomigana, meaning] = ['W', 'Y', 'M'];
  await put({ level, index, word, yomigana, meaning });
  const body = await get('/api/select/new');
  expect(body.length).toBe(1);
  expect(body).toStrictEqual([
    {
      level,
      meaning,
      word,
      yomigana,
      index: 1,
      lastCorrect: null,
      streak: 0,
    },
  ]);
});

test('delete one', async () => {
  const [level, index] = ['E2001', 1];
  const [word, yomigana, meaning] = ['w', 'y', 'm'];
  await post({ level, word, yomigana, meaning });
  await del({ level, index });
  const body = await get('/api/select/new');
  expect(body.length).toBe(0);
});

const lastCorrect = '2020-07-12T22:15:12.000Z';
const lastCorrect2 = '2020-07-12T22:45:12.000Z';

test('sync empty', async () => {
  const { body } = await sync([]);
  expect(body.length).toBe(0);
});

test('sync one', async () => {
  const [level, index, streak] = ['E2001', 1, 1];
  const [word, yomigana, meaning] = ['w', 'y', 'm'];
  await post({ level, word, yomigana, meaning });
  let { body } = await sync([{ level, index, streak, lastCorrect }]);
  expect(body.length).toBe(1);
  body = await get(`/api/select/${level}`);
  expect(body.length).toBe(1);
  expect(body).toStrictEqual([
    {
      level,
      meaning,
      word,
      yomigana,
      index: 1,
      lastCorrect,
      streak,
    },
  ]);
});

test('sync again', async () => {
  const [level, index] = ['E2001', 1];
  const [word, yomigana, meaning] = ['w', 'y', 'm'];
  await post({ level, word, yomigana, meaning });
  let { body } = await sync([{ level, index, streak: 1, lastCorrect }]);
  ({ body } = await sync([{ level, index, streak: 2, lastCorrect }]));
  expect(body.length).toBe(1);

  body = await get(`/api/select/${level}`);
  expect(body.length).toBe(1);
  expect(body).toStrictEqual([
    {
      level,
      meaning,
      word,
      yomigana,
      index: 1,
      lastCorrect,
      streak: 1,
    },
  ]);
});

test('sync anew', async () => {
  const [level, index] = ['E2001', 1];
  const [word, yomigana, meaning] = ['w', 'y', 'm'];
  await post({ level, word, yomigana, meaning });
  let { body } = await sync([{ level, index, streak: 1, lastCorrect }]);
  ({ body } = await sync([
    { level, index, streak: 2, lastCorrect: lastCorrect2 },
  ]));
  expect(body.length).toBe(1);

  body = await get(`/api/select/${level}`);
  expect(body.length).toBe(1);
  expect(body).toStrictEqual([
    {
      level,
      meaning,
      word,
      yomigana,
      index: 1,
      lastCorrect: lastCorrect2,
      streak: 2,
    },
  ]);
});

test('sync deleted', async () => {
  const [level, index] = ['E2001', 1];
  const { body } = await sync([{ level, index, streak: 1, lastCorrect }]);
  expect(body.length).toBe(0);
});
