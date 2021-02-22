const express = require('express');
const { sync } = require('../db/dml');
const { getLearningInLang } = require('../db/query');
const { trimDate, getDateDiff } = require('./tz');
const { getNow } = require('./util');

const router = express.Router();

router.get('/:lang/:tzOffset', async (req, res) => {
  const { lang, tzOffset } = req.params;
  const timezone = Number(tzOffset);
  const learning = await getLearningInLang(lang);

  const refDate = trimDate(getNow(), timezone);
  const filtered = learning.filter(({ streak, lastCorrect }) => {
    if (lastCorrect === null) {
      return true;
    }
    const diff = getDateDiff(lastCorrect, timezone, refDate);
    return streak <= diff;
  });

  if (filtered.length === 0) {
    res.json([]);
    return;
  }

  res.json(filtered);
});

router.put('/', async (req, res) => {
  const words = req.body;
  await sync(words);
  res.sendStatus(200);
});

module.exports = router;
