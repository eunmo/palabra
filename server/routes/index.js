const express = require('express');

const meta = require('./meta');
const search = require('./search');
const select = require('./select');
const daily = require('./daily');

const crud = require('./crud');
const sync = require('./sync');

const router = express.Router();
router.use('/meta', meta);
router.use('/search', search);
router.use('/select', select);
router.use('/daily', daily);

router.use('/crud', crud);
router.use('/sync', sync);

module.exports = router;
