import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import ButtonBase from '@material-ui/core/ButtonBase';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Fab from '@material-ui/core/Fab';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import { pink } from '@material-ui/core/colors';
import {
  EventAvailable,
  EventBusy,
  Refresh,
  Remove,
  ShowChart,
} from '@material-ui/icons';

import { get } from './utils';

const useStyles = makeStyles({
  cardAction: {
    width: '100%',
    display: 'block',
    textAlign: 'initial',
  },
  cardHeader: {
    padding: '8px',
  },
  avatar: {
    margin: '0 8px 0 0',
  },
  paper: {
    marginTop: '8px',
    padding: '8px 0',
  },
  number: {
    textAlign: 'right',
  },
  icon: {
    textAlign: 'right',
    paddingTop: '2px !important',
    height: '28px',
  },
  paperWithFab: {
    position: 'relative',
  },
  fabs: {
    position: 'absolute',
    bottom: '16px',
    right: '16px',
  },
  upperFabs: {
    position: 'absolute',
    bottom: '88px',
    right: '16px',
  },
  fab: {
    marginLeft: '16px',
  },
});

const selected = {
  backgroundColor: pink.A400,
};

export default () => {
  const [langs, setLangs] = useState(undefined);
  const [levels, setLevels] = useState([]);
  const [selectedLang, setSelectedLang] = useState('all');
  const [filterToday, setFilterToday] = useState(false);
  const classes = useStyles();

  function fetch() {
    const tzOffset = new Date().getTimezoneOffset();
    get(`/api/meta/${tzOffset}`, ({ langs: resLangs, levels: resLevels }) => {
      setLangs(Object.entries(resLangs).sort());
      setLevels(resLevels);
    });
  }

  useEffect(() => {
    fetch();
  }, []);

  const toTitle = ({ learning, fresh }) => {
    return fresh === 0 ? learning : `${learning}.${fresh}`;
  };

  const filterByLang = (lang) => {
    setSelectedLang(lang === selectedLang ? 'all' : lang);
  };

  if (langs === undefined) {
    return <LinearProgress />;
  }

  const days = [];
  for (let i = 0; i < 11; i += 1) {
    days[i] = { day: i, streaks: [], sum: 0 };
    for (let j = 0; j < 11 - i && j < 10; j += 1) {
      days[i].streaks[j] = { streak: j, sum: 0 };
    }
  }

  const sums = [];
  for (let i = 0; i < 10; i += 1) {
    sums[i] = { streak: i, sum: 0 };
  }

  const monthSet = {};
  levels.forEach(({ level }) => {
    const month = level.substring(1);
    monthSet[month] = month;
  });

  let monthKeys = Object.keys(monthSet).sort();
  if (monthKeys.length > 10) {
    monthKeys = monthKeys.slice(-9);
    monthKeys.unshift('Old');
  }
  const months = monthKeys.map((month) => ({ month, streaks: [] }));
  const monthMap = {};
  for (let i = 0; i < months.length; i += 1) {
    const { month, streaks } = months[i];
    monthMap[month] = months[i];
    for (let j = 0; j < 10; j += 1) {
      streaks[j] = { streak: j, sum: 0 };
    }
  }

  levels.forEach(({ level, summary }) => {
    const lang = level.substring(0, 1);
    if (selectedLang !== 'all' && lang !== selectedLang) {
      return;
    }
    const month = monthMap[level.substring(1)] ?? monthMap.Old;
    summary.forEach(([streak, day, count]) => {
      if (filterToday && day !== 0) {
        return;
      }
      const index = streak <= 0 ? 9 : 10 - streak;
      month.streaks[index].sum += count;
      sums[index].sum += count;
      days[day].streaks[index].sum += count;
      days[day].sum += count;
    });
  });

  return (
    <>
      <Grid container spacing={1}>
        {langs.map(([lang, summary]) => (
          <Grid item key={lang} xs={4}>
            <Card variant="outlined">
              <ButtonBase
                className={classes.cardAction}
                onClick={() => filterByLang(lang)}
                aria-label={lang}
              >
                <CardHeader
                  classes={{
                    root: classes.cardHeader,
                    avatar: classes.avatar,
                  }}
                  avatar={
                    <Avatar
                      style={selectedLang === lang ? selected : {}}
                      aria-label={`Avatar-${lang}`}
                    >
                      {lang}
                    </Avatar>
                  }
                  title={toTitle(summary)}
                  subheader={summary.learned}
                />
              </ButtonBase>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Paper
        variant="outlined"
        className={`${classes.paper} ${classes.paperWithFab}`}
      >
        <Grid container spacing={1}>
          {months.map(({ month, streaks }) => (
            <Grid key={month} container item xs={12} spacing={1}>
              <Grid item xs={2} className={classes.number}>
                <b>{month}</b>
              </Grid>
              {streaks.map((streak) => (
                <Grid
                  key={streak.streak}
                  item
                  xs={1}
                  className={classes.number}
                  data-testid={`M-${month}-${streak.streak}`}
                >
                  {streak.sum === 0 ? null : streak.sum}
                </Grid>
              ))}
            </Grid>
          ))}
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={2} className={classes.icon}>
              <ShowChart />
            </Grid>
            {sums.map((streak) => (
              <Grid
                key={streak.streak}
                item
                xs={1}
                className={classes.number}
                data-testid={`S-${streak.streak}`}
              >
                <b>{streak.sum === 0 ? null : streak.sum}</b>
              </Grid>
            ))}
          </Grid>
          {days.map(({ day, streaks, sum }) => (
            <Grid key={day} container item xs={12} spacing={1}>
              <Grid
                item
                xs={2}
                className={classes.number}
                data-testid={`D-${day}`}
              >
                <b>{sum}</b>
              </Grid>
              {streaks.map((streak) => (
                <Grid
                  key={streak.streak}
                  item
                  xs={1}
                  className={classes.number}
                  data-testid={`D-${day}-${streak.streak}`}
                >
                  {streak.sum === 0 ? null : streak.sum}
                </Grid>
              ))}
            </Grid>
          ))}
        </Grid>
        <div className={classes.upperFabs}>
          <Fab
            color="secondary"
            aria-label="daily"
            className={classes.fab}
            component={Link}
            to="/daily/S"
          >
            <Remove />
          </Fab>
        </div>
        <div className={classes.fabs}>
          <Fab
            color={filterToday ? 'secondary' : 'default'}
            aria-label="today"
            className={classes.fab}
            onClick={() => setFilterToday(!filterToday)}
          >
            {filterToday ? <EventBusy /> : <EventAvailable />}
          </Fab>
          <Fab
            color="primary"
            aria-label="refresh"
            className={classes.fab}
            onClick={() => fetch()}
          >
            <Refresh />
          </Fab>
        </div>
      </Paper>
    </>
  );
};
