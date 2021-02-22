import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Clear, Search } from '@material-ui/icons';

import Words from './words';
import { get, sortWordsByPattern } from './utils';

const useStyles = makeStyles({
  root: {
    padding: '2px 4px',
    display: 'flex',
    flexGrow: 1,
  },
  input: {
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  header: {
    margin: '16px 0 16px 16px',
  },
});

export default ({ initialValue, onChange = () => {} }) => {
  const [keyword, setKeyword] = useState('');
  const [words, setWords] = useState([]);
  const [patterns, setPatterns] = useState(null);
  const classes = useStyles();

  const search = (query) => {
    if (query !== '') {
      get(`/api/search/${query}`, ({ patterns: ps, words: ws }) => {
        setWords(sortWordsByPattern(ps, ws));
        setPatterns(ps);
      });
    }
  };

  useEffect(() => {
    const { initialKeyword = '' } = initialValue;
    setKeyword(initialKeyword);
    search(initialKeyword);
    setWords([]);
    setPatterns(null);
  }, [initialValue]);

  useEffect(() => {
    onChange(keyword);
  }, [keyword, onChange]);

  const submit = (e) => {
    e.preventDefault();
    search(keyword);
  };

  const clear = () => {
    setKeyword('');
    setWords([]);
    setPatterns(null);
  };

  return (
    <>
      <Paper
        component="form"
        variant="outlined"
        className={classes.root}
        onSubmit={(e) => submit(e)}
      >
        <IconButton
          type="submit"
          className={classes.iconButton}
          aria-label="search"
        >
          <Search />
        </IconButton>
        <InputBase
          className={classes.input}
          placeholder="Search Palabra"
          value={keyword}
          onChange={({ target }) => setKeyword(target.value)}
          inputProps={{ 'aria-label': 'search palabra' }}
        />
        <IconButton
          className={classes.iconButton}
          aria-label="clear search"
          onClick={clear}
        >
          <Clear />
        </IconButton>
      </Paper>
      {patterns && (
        <Typography variant="h6" className={classes.header}>
          Search Result for: {patterns.join(', ')}
        </Typography>
      )}
      {words.length > 0 && <Words words={words} />}
    </>
  );
};
