import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { ArrowDownward, ArrowUpward, Clear } from '@material-ui/icons';

import Search from './search';
import { post, getYYMM, languages } from './utils';

const useStyles = makeStyles({
  buttons: {
    display: 'flex',
  },
  buttonSearch: {
    margin: '16px 8px 16px 0',
  },
  buttonSubmit: {
    margin: '24px 8px 0 0',
  },
});

export default () => {
  const history = useHistory();
  const [yymm] = useState(getYYMM());
  const [word, setWord] = useState('');
  const [yomigana, setYomigana] = useState('');
  const [meaning, setMeaning] = useState('');
  const [keywordTo, setKeywordTo] = useState({});
  const [keywordFrom, setKeywordFrom] = useState('');
  const classes = useStyles();

  const updateWord = (newValue) => {
    let [newWord, newYomigana] = [newValue.replace('’', "'"), null];
    let [opener, closer] = ['[', ']'];
    let index = newWord.indexOf(opener);
    if (index !== -1) {
      newYomigana = newWord.slice(0, index).replace(/\s/g, '');
      newWord = newWord.slice(index + 1).replace(closer, '');
    }

    [opener, closer] = ['（', '）'];
    index = newWord.indexOf(opener);
    if (index !== -1) {
      newYomigana = newWord.slice(index + 1).replace(closer, '');
      newWord = newWord.slice(0, index).replace(/\s/g, '');
    }

    index = newWord.lastIndexOf('·');
    if (index !== -1) {
      newWord = newWord.slice(index + 1);
    }

    if (newYomigana) {
      setYomigana(newYomigana);
    }
    setWord(newWord);
  };

  const onWord = (e) => {
    updateWord(e.target.value);
  };

  const onYomigana = (e) => {
    setYomigana(e.target.value);
  };

  const onMeaning = (e) => {
    setMeaning(e.target.value);
  };

  const add = (lang) => {
    const level = lang + yymm;
    post(
      '/api/crud',
      {
        level,
        word: word.trim(),
        yomigana: yomigana.trim(),
        meaning: meaning.trim(),
      },
      () => {
        history.push(`/search/${word.trim()}`);
      }
    );
  };

  const toSearch = () => {
    let initialKeyword = word;
    if (yomigana) {
      initialKeyword = `${yomigana}[${word}`;
    }
    setKeywordTo({ initialKeyword });
  };

  const fromSearch = () => {
    updateWord(keywordFrom);
  };

  const clearAll = () => {
    setWord('');
    setYomigana('');
    setMeaning('');
    setKeywordTo({ initialKeyword: '' });
  };

  return (
    <>
      <Search initialValue={keywordTo} onChange={setKeywordFrom} />
      <div className={classes.buttons}>
        <Button
          variant="contained"
          className={classes.buttonSearch}
          onClick={toSearch}
          aria-label="to search"
        >
          <ArrowUpward />
        </Button>
        <Button
          variant="contained"
          className={classes.buttonSearch}
          onClick={fromSearch}
          aria-label="from search"
        >
          <ArrowDownward />
        </Button>
        <Button
          variant="contained"
          className={classes.buttonSearch}
          onClick={clearAll}
          aria-label="clear all"
        >
          <Clear />
        </Button>
      </div>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Word"
            value={word}
            onChange={onWord}
            inputProps={{ 'aria-label': 'word' }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Yomigana"
            value={yomigana}
            onChange={onYomigana}
            inputProps={{ 'aria-label': 'yomigana' }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Meaning"
            value={meaning}
            onChange={onMeaning}
            inputProps={{ 'aria-label': 'meaning' }}
          />
        </Grid>
      </Grid>
      <div className={classes.buttons}>
        {languages.map(({ key, emoji }) => (
          <Button
            key={key}
            variant="contained"
            className={classes.buttonSubmit}
            onClick={() => add(key)}
            aria-label={`add ${key}`}
          >
            {emoji}
          </Button>
        ))}
      </div>
    </>
  );
};
