import React from 'react';
import {connect} from 'react-redux'
import Header from '../components/Header/Header';

const mapStateToProps = (state) => {
  return state;
}

export const HeaderContainer = connect(
  mapStateToProps,
)(Header);

export default HeaderContainer;
