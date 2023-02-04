USE popcorn;

DROP TABLE IF EXISTS words;

CREATE TABLE words (
  level VARCHAR(255) NOT NULL,
  `index` SMALLINT NOT NULL,
  word VARCHAR(255) NOT NULL,
  yomigana VARCHAR(255) NOT NULL,
  meaning VARCHAR(255) NOT NULL,
  streak TINYINT NOT NULL DEFAULT '0',
  lastCorrect DATETIME,
  PRIMARY KEY (level, `index`),
  KEY streak (streak),
  KEY level (level, streak)
);
