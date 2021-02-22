const { query, queryOne } = require('@eunmo/mysql');

const getNew = () => {
  return query('SELECT * FROM words WHERE lastCorrect IS NULL');
};

const getLearning = () => {
  return query('SELECT * FROM words WHERE streak < 11 ORDER BY level, `index`');
};

const getLearningInLang = (lang) => {
  return query(
    `SELECT *
       FROM words
      WHERE streak < 11
        AND SUBSTR(level, 1, 1) = ?`,
    lang
  );
};

const getLearningInLevel = (level) => {
  return query(
    `SELECT *
       FROM words
      WHERE level = ?
        AND streak < 11
   ORDER BY level, \`index\``,
    level
  );
};

const getLangSummary = async () => {
  return query(`
    SELECT SUBSTR(level, 1, 1) as lang, streak, count(*) as count
      FROM words
  GROUP BY lang, streak`);
};

const getSummary = async () => {
  return query(`
    SELECT level, streak,
           DATE_FORMAT(lastCorrect, '%Y-%m-%dT%H:00:00.000Z') as hour,
           count(*) as count
      FROM words
     WHERE streak < 11
  GROUP BY level, streak, hour
  ORDER BY level, streak, hour`);
};

const getMatch = async (patterns) => {
  const filters = [];
  patterns.forEach((pattern) => {
    ['word', 'yomigana', 'meaning'].forEach((column) => {
      filters.push(`${column} LIKE "%${pattern}%"`);
    });
  });

  return query(`SELECT * FROM words WHERE ${filters.join(' OR ')}`);
};

const getWord = async (level, index) => {
  const row = await queryOne(
    `SELECT word, meaning, yomigana
       FROM words
      WHERE level = ?
        AND \`index\` = ?`,
    [level, index]
  );
  return row ?? {};
};

module.exports = {
  getNew,
  getLearning,
  getLearningInLang,
  getLearningInLevel,
  getLangSummary,
  getSummary,
  getMatch,
  getWord,
};
