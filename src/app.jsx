import React from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import Container from '@material-ui/core/Container';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import AppBar from './app-bar';
import Search from './searchRoute';
import Edit from './edit';
import Add from './add';
import Summary from './summary';
import Daily from './daily';

export default () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar />
        <Container maxWidth="md" component="main">
          <Switch>
            <Route path="/search/:keyword">
              <Search />
            </Route>
            <Route path="/search">
              <Search />
            </Route>
            <Route path="/edit/:level/:index">
              <Edit />
            </Route>
            <Route path="/add">
              <Add />
            </Route>
            <Route path="/summary">
              <Summary />
            </Route>
            <Route path="/daily/:lang">
              <Daily />
            </Route>
            <Redirect from="/" to="/search" exact />
          </Switch>
        </Container>
      </Router>
    </ThemeProvider>
  );
};
