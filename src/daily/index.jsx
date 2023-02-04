import React, { useCallback, useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import { get, put, languages } from '../utils';

import Review from './review';

const wordTypes = [
  { type: 'fresh', text: 'Learn' },
  { type: 'review', text: 'Review' },
];

export default () => {
  const [words, setWords] = useState({});
  const [review, setReview] = useState(undefined);

  const fetch = useCallback(() => {
    const tzOffset = new Date().getTimezoneOffset();
    languages.forEach(({ key }) => {
      get(`/api/daily/${key}/${tzOffset}`, (data) => {
        setWords((w) => ({ ...w, [key]: data }));
      });
    });
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const save = useCallback(
    (results) => {
      setWords({});
      setReview(undefined);
      put('/api/daily', results, () => {
        fetch();
      });
    },
    [fetch]
  );

  if (languages.some(({ key }) => words[key] === undefined)) {
    return <LinearProgress />;
  }

  if (review !== undefined) {
    const { type, data } = review;
    return <Review words={data} type={type} save={save} />;
  }

  return (
    <Grid container spacing={1}>
      {languages.map(({ key, name }) =>
        wordTypes.map(({ type, text }) => {
          const data = words[key][type];
          return (
            <Grid item xs={12}>
              <Button
                color="primary"
                disabled={data.length === 0}
                fullWidth
                size="large"
                variant="contained"
                onClick={() => setReview({ type, data })}
              >
                {text} {data.length} New {name} Words
              </Button>
            </Grid>
          );
        })
      )}
    </Grid>
  );
};
