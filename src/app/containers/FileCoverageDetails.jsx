import React from 'react';
import {connect} from 'react-redux'
import FileCoverageNavigation from '../components/FileCoverageNavigation/FileCoverageNavigation';

const mapStateToProps = (state) => {
  return state;
}

export const FileCoverageDetails = connect(
  mapStateToProps,
)(FileCoverageNavigation);

export default FileCoverageDetails;
