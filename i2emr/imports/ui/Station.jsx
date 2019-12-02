import React, { Component } from 'react';
import Search from './Search.jsx';

import { Radio } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';

export default class Station extends Component {
  render() {
    return (
      <div>
        <Grid container direction="row" justify="flex-start" alignItems="center" >
          <Grid item xs={5}>
            <h1>{this.props.station}</h1>
          </Grid>
          {this.props.station !== "Basic Patient Information" &&
            <Grid item xs={5}>
              <Search station={this.props.station}/>
            </Grid>
          }
        </Grid>
      </div>
    );
  }
}
