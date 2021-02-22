import React, { useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import MobileStepper from '@material-ui/core/MobileStepper';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Check, Clear } from '@material-ui/icons';
import { shuffleIndices } from '../utils';

const useStyles = makeStyles({
  button: {
    height: '160px',
  },
  paper: {
    padding: '16px',
  },
  yomigana: {
    minHeight: '32px',
  },
  meaning: {
    minHeight: '41px',
  },
});

export default ({ words, type, save }) => {
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(undefined);
  const classes = useStyles();
  const [iteration, setIteration] = useState(0);
  const reduced = useMemo(() => {
    return shuffleIndices(words.length).slice(0, 7);
  }, [words]);
  const targets = useMemo(() => {
    return shuffleIndices(reduced.length).map((i) => words[reduced[i]]);
  }, [words, iteration, reduced]);

  const setResult = (word, result) => {
    if (word.done) {
      if (type === 'fresh' && !word.complete) {
        setSelected(undefined);
        setIteration(iteration + 1);
        setResults([]);
      } else {
        save(results);
      }
    } else if (selected === undefined || selected !== result) {
      setSelected(result);
    } else {
      const { level, index, streak } = word;
      let newStreak = 0;
      if (type === 'review') {
        newStreak = result ? streak + 1 : -2;
      }
      const lastCorrect = new Date();
      setSelected(undefined);
      setResults((array) => [
        ...array,
        {
          level,
          index,
          streak: newStreak,
          lastCorrect,
          result,
        },
      ]);
    }
  };

  const rewind = () => {
    setResults((array) => array.slice(0, -1));
  };

  const index = results.length;
  let word;

  if (index === targets.length) {
    const correctCount = results.filter(({ result: r }) => r).length;
    const count = results.length;
    const text = `${correctCount}/${count} correct`;
    word = { word: text, done: true, complete: correctCount === count };
  } else {
    word = targets[index];
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          <Typography align="center" variant="h5" className={classes.yomigana}>
            {selected !== undefined && word.yomigana}
          </Typography>
          <Typography align="center" variant="h2">
            {word.word}
          </Typography>
          <Typography align="center" variant="h4" className={classes.meaning}>
            {selected !== undefined && word.meaning}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <MobileStepper
          variant="dots"
          steps={targets.length}
          position="static"
          activeStep={index}
          backButton={
            <Button size="small" onClick={rewind} disabled={index === 0}>
              Back
            </Button>
          }
          nextButton={
            <Button
              size="small"
              onClick={() => setResult(word, false)}
              disabled={index === targets.length}
            >
              Next
            </Button>
          }
        />
      </Grid>
      <Grid item xs={6}>
        <Button
          color="secondary"
          fullWidth
          size="large"
          variant={selected === false ? 'contained' : 'outlined'}
          className={classes.button}
          onClick={() => setResult(word, false)}
        >
          <Clear fontSize="large" />
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button
          color="primary"
          fullWidth
          size="large"
          variant={selected === true ? 'contained' : 'outlined'}
          className={classes.button}
          onClick={() => setResult(word, true)}
        >
          <Check fontSize="large" />
        </Button>
      </Grid>
    </Grid>
  );
};
