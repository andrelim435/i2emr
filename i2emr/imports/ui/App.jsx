import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import Station from './Station.jsx';
import Queue from './Queue.jsx';
import Form from './Form.jsx';
import Info from './Info.jsx';
import ScreeningReview from './ScreeningReview.jsx';

import Patientinfo from '/imports/api/patientinfo';
import { formLayouts } from '/imports/api/formLayouts';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import { DialogTitle, DialogContent, DialogContentText } from '@material-ui/core';
import { infoLayouts } from '../api/infoLayouts.js';

const stationsWithInfo = new Set(Object.keys(infoLayouts))

const stationsWithInfoOnly = new Set(["Screening Review", "Oral Screening"])

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  spacing: 8,
  paper: {
    // padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  // textField: {
  //   marginLeft: theme.spacing.unit,
  //   marginRight: theme.spacing.unit,
  //   width: 10,
  // },
});

class App extends Component {
  state = {
    currentPatient: "",
    links: Object.keys(formLayouts),
  }

  selectStation(newStation, e) {
    e.preventDefault();
    window.scrollTo(0, 0);

    Session.set("station", newStation);

    const currentPatient = Session.get('currentPatient');
    if (currentPatient !== null) {
      Meteor.call('patientinfo.setBusy', currentPatient, false);
      Session.set('currentPatient', null);
    }

    this.forceUpdate()
  }

  makeStation(station) {
    return (
      <p style = {{paddingLeft: 90}}>
        <Button variant="outlined" onClick={this.selectStation.bind(this, station)}>
          {station}
        </Button>
      </p>
    )
  }

  render() {
    const station = Session.get('station');

    if (station && station === "Screening Review") {
      return (
        <div>
          <ScreeningReview stationQueue={this.selectStation.bind(this, "")} patientList={this.props.patientList} patientInfo={this.props.patientInfo} />

          <Dialog
            open={!this.props.connected}
            // onClose={this.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"You have been disconnected"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Please reconnect to wifi network.
              </DialogContentText>
            </DialogContent>
          </Dialog>

        </div>
      );
    } else if (station && stationsWithInfoOnly.has(station)) {
      return (
        <div>

          <Button variant="outlined" onClick={this.selectStation.bind(this, "")}>Back</Button>
          <br />
          <Station station={station} />

          <Grid container
            justify="flex-start"
            spacing={16}>
            <Grid item xs={12}>
              <Queue patientList={this.props.patientList} />
            </Grid>
            <Grid container
              direction="row"
              justify="flex-start"
              alignItems="flex-start"
              spacing={16}
            >
              <Grid item xs={12}>
                <Info station={station} id={Session.get('currentPatient')} patientInfo={this.props.patientInfo} />
              </Grid>

            </Grid>
          </Grid>

          <Dialog
            open={!this.props.connected}
            // onClose={this.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"You have been disconnected"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Please reconnect to wifi network.
              </DialogContentText>
            </DialogContent>
          </Dialog>

        </div>)
    }

    else if (station) {
      return (
        <div>

          <Button variant="outlined" onClick={this.selectStation.bind(this, "")}>Back</Button>
          <br />
          <Station station={station} />

          <Grid container
            justify="flex-start"
            style = {{paddingLeft: 90}}
            spacing={16}>
            {station != "Basic Patient Information" &&
              <Grid item xs={12}>
                <Queue patientList={this.props.patientList} />
              </Grid>
            }
            <Grid container
              direction="row"
              justify="flex-start"
              alignItems="flex-start"
              spacing={16}
            >
              <Grid item xs={12}>
                {station !== "Finished Patients" && <Grid container>
                  <Grid item xs={8}>
                    <Form station={station} id={Session.get('currentPatient')}
                      stationQueue={this.props.patientInfo.stationQueue} patientInfo={this.props.patientInfo} />
                  </Grid>
                  {station !== "Basic Patient Information" &&
                    < Grid item xs={4} style={{ paddingLeft: 30 }}>
                    <Info station={station} id={Session.get('currentPatient')} patientInfo={this.props.patientInfo} />
                </Grid>
                }
              </Grid>
              }
                {station === "Finished Patients" && typeof (this.props.patientList) !== "undefined" &&
                console.log(Patientinfo.find({}).fetch())
              }
            </Grid>

          {/*   <Grid item xs={4}>
              {stationsWithInfo.has(station) &&
                <Info station={station} id={Session.get('currentPatient')} patientInfo={this.props.patientInfo} />
              }
            </Grid> */}

          </Grid>
          </Grid>

        <Dialog
          open={!this.props.connected}
          // onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"You have been disconnected"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Please reconnect to wifi network.
              </DialogContentText>
          </DialogContent>
        </Dialog>

        </div >
      );

    } else {

      const links = this.state.links.map(
        link => this.makeStation(link)
      );

      return (
        <div>
          <Dialog
            open={!this.props.connected}
            // onClose={this.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"Disconnected"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                You have been disconnected. Please connect to wifi network.
              </DialogContentText>
            </DialogContent>
          </Dialog>
          <h1>Select Station </h1>
          {links}
        </div>
      );
    }

  }
}
const AppContainer = withTracker(() => {
  const connected = Meteor.status().connected;
  const station = Session.get('station');
  const currentPatientID = Session.get('currentPatient');
  var patientList = [];

  if (station === "Done") {
    patientList = Patientinfo.find().fetch();
    // } else if (station == "Registration" || station == "Phlebotomy"){
  } else {
    patientList = Patientinfo.find(
      {
        $and: [{ nextStation: station }, { $or: [{ busy: false }, { id: currentPatientID }] }
        ]
      }).fetch();
  }
  // } else {
  //   patientList = Patientinfo.find(
  //     {  $or:[{ busy: false },{ id: currentPatientID }] 
  //     }).fetch();
  // }

  //, { sort: { lastSubmit: 1 } }
  // TODO - Find better way to sent patient info in
  // Retrieve current patient info for Info component
  // If no current patient, set to null
  const patientInfo = (currentPatientID !== undefined && currentPatientID !== null) ?
    Patientinfo.findOne({ id: currentPatientID }) : { name: "" };
  // if (currentPatientID !== undefined && currentPatientID !== null) {
  //   console.log(currentPatientID);
  // }

  return {
    connected: connected,
    patientList: patientList,
    patientInfo: patientInfo,
  };
})(App);

export default withStyles(styles)(AppContainer);