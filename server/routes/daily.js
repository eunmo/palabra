const express = require('express');
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

module.exports = router;
