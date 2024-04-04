import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';

import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../../store';

import ReportLoader from '../../containers/ReportLoader';
import HomeContainer from '../../containers/HomeContainer.jsx';
import { wrap_report_loader } from '../../containers/ReportLoader';
import s from './App.module.scss';
import FileCoverageDetails from '../../containers/FileCoverageDetails';

const HomeContainerReportLoader = wrap_report_loader(HomeContainer);
const FileCoverageDetailsReportLoader = wrap_report_loader(FileCoverageDetails);
export default class App extends React.Component {
  render() {
    return (
      <>
        <CssBaseline />
        <Provider store={store}>
          <Router className={s.body}>
            <Routes>
              <Route path="/" element={<HomeContainerReportLoader/>} />
              <Route path="/load" element={<ReportLoader/>} />
              <Route path="/browse/:filename" element={<FileCoverageDetailsReportLoader/>} />
            </Routes>
          </Router>
        </Provider>
      </>
    );
  }
}
