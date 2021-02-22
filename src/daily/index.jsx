import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import { get, put } from '../utils';

import Review from './review';

export default () => {
  const [words, setWords] = useState(undefined);
  const [reviewType, setReviewType] = useState(undefined);
  const { lang } = useParams();

  function fetch() {
    const tzOffset = new Date().getTimezoneOffset();
    get(`/api/daily/${lang}/${tzOffset}`, setWords);
  }

  useEffect(() => {
    fetch();
  }, [lang]);

  const save = useCallback((results) => {
    setWords(undefined);
    setReviewType(undefined);
    put('/api/daily', results, () => {
      fetch();
    });
  });

  if (words === undefined) {
    return <LinearProgress />;
  }

  if (reviewType !== undefined) {
    return <Review words={words[reviewType]} type={reviewType} save={save} />;
  }

  const { fresh, review } = words;

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Button
          color="primary"
          disabled={fresh.length === 0}
          fullWidth
          size="large"
          variant="contained"
          onClick={() => setReviewType('fresh')}
        >
          Learn {fresh.length} New Words
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Button
          color="secondary"
          disabled={review.length === 0}
          fullWidth
          size="large"
          variant="contained"
          onClick={() => setReviewType('review')}
        >
          Review {review.length} Words
        </Button>
      </Grid>
    </Grid>
  );
};
