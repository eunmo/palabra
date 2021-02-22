const { dml, cleanup: dbCleanup } = require('@eunmo/mysql');
const { add, sync } = require('./dml');

const lastCorrect = '2020-07-12T22:15:12.000+09:00';
const lastCorrect2 = '2020-07-12T22:45:12.000+09:00';

const prepare = async () => {
  await dml('DROP TABLE IF EXISTS words;');
  await dml('CREATE TABLE words LIKE palabra.words;');
  await add(`N0`, 'j', 'k', 'l');
  for (let i = 1; i < 4; i += 1) {
    for (let j = 0; j < 5; j += 1) {
      await add(`E200${i}`, 'a', 'b', "c'c"); // eslint-disable-line no-await-in-loop
      await add(`F200${i}`, 'd', 'e', 'f'); // eslint-disable-line no-await-in-loop
      await add(`J200${i}`, 'g', 'h', 'i'); // eslint-disable-line no-await-in-loop
    }
  }
  let words = [{ level: `N0`, index: 1, streak: 11, lastCorrect }];
  'EFJ'.split('').forEach((lang) => {
    words = words.concat([
      { level: `${lang}2001`, index: 1, streak: 11, lastCorrect },
      { level: `${lang}2001`, index: 2, streak: 10, lastCorrect },
      { level: `${lang}2001`, index: 3, streak: 9, lastCorrect },
      { level: `${lang}2001`, index: 4, streak: 8, lastCorrect },
      { level: `${lang}2002`, index: 1, streak: 7, lastCorrect },
      { level: `${lang}2002`, index: 2, streak: 6, lastCorrect },
      { level: `${lang}2002`, index: 3, streak: 5, lastCorrect },
      { level: `${lang}2002`, index: 4, streak: 4, lastCorrect },
      { level: `${lang}2003`, index: 1, streak: 3, lastCorrect },
      { level: `${lang}2003`, index: 2, streak: 2, lastCorrect },
      { level: `${lang}2003`, index: 3, streak: 1, lastCorrect },
      { level: `${lang}2003`, index: 4, streak: 1, lastCorrect: lastCorrect2 },
    ]);
  });
  await sync(words);
};

const cleanup = async () => {
  await dml('DROP TABLE IF EXISTS words;');
  await dbCleanup();
};

module.exports = { prepare, cleanup };
