import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';

import {HashRouter as Router, Route, Routes} from 'react-router-dom';
import {Provider} from 'react-redux'
import store from '../../store';

import ReportLoader from '../../containers/ReportLoader';
import HomeContainer from '../../containers/HomeContainer.jsx';
import {wrap_report_loader} from '../../containers/ReportLoader';
import s from './App.module.scss';
import FileCoverageDetails from '../../containers/FileCoverageDetails';

export default class App extends React.Component {
  render() {
    return (

    <React.Fragment>
      <CssBaseline />
      <Provider store={store}>
        <Router className={s.body}>
          <Routes>
            <Route exact path="/" component={wrap_report_loader(HomeContainer)} />
            <Route exact path="/load" component={ReportLoader} />
            <Route path="/browse/*" component={wrap_report_loader(FileCoverageDetails)} />
          </Routes>
        </Router>
      </Provider>
    </React.Fragment>
    );
  }
}
