import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import AutoForm from 'uniforms-material/AutoForm';
import { formSchemas } from '/imports/api/formSchemas';
import { formLayouts } from '/imports/api/formLayouts';
import SubmitField from 'uniforms-material/SubmitField';
import ErrorsField from 'uniforms-material/ErrorsField';

class ClearableAutoForm extends AutoForm {
  constructor(props) {
    super(props);
  }

  onSubmit () {
      // If you don't care about this Promise
      return super.onSubmit(...arguments).then(() => {
        if (!this.props.noUserSelected) {
          this.reset()
        }
      });

      // If you do care about this Promise
      return super.onSubmit(...arguments).then(result => {
          this.reset();
          return result;
      });
  }
}

class Form extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.formRef = null;

    this.stations = Object.keys(formLayouts);

    // Non multipage forms are functions (in order to pass in patientinfo). Multipage forms are objects with functions for each page
    this.isMultipage = typeof(formSchemas[this.props.station]) === 'object';
    // this.pageIndex = 0;
    this.oldID = null;
    this.multiData = {};

    this.state = {
      pageIndex: 0,
      stationQueue: null,
    };
  }

  handleSubmit(newForm) { 
    // If no user
    if (this.props.id === null && this.props.station !== "Basic Patient Information") {
        window.scrollTo(0, 0)
        alert("Please take a patient before submitting");
        return
    }

    // Insert/update patientinfo database
    if (this.isMultipage) {
      if (this.state.pageIndex < Object.keys(formSchemas[this.props.station]).length - 1) {
        // If not at last subpage
        // Concat and store multipage form data
        const subSchemaName = Object.keys(formSchemas[this.props.station])[this.state.pageIndex];
        // this.multiData[subSchemaName] = newForm;

        var formData = {};
        formData[subSchemaName] = newForm;
        formData.id = this.props.id;

        Meteor.call('patientinfo.update', formData);

        // this.pageIndex++;
        this.setState((state, props) => ({
          pageIndex: state.pageIndex + 1
        }));

        // console.log("Next subpage");
      } else { // On last subpage
        const subSchemaName = Object.keys(formSchemas[this.props.station])[this.state.pageIndex];
        // this.multiData[subSchemaName] = newForm;
        
        var formData = {};
        formData[subSchemaName] = newForm;
        formData.id = this.props.id;

        Meteor.call('patientinfo.update', formData);
        Meteor.call('patientinfo.nextstation', this.props.id);
        Session.set('currentPatient',null);
        
        // Empty data for multipage form
        this.multiData = {};
        // Reset page index
        // this.pageIndex = 0;
        this.setState({
          pageIndex: 0,
          tabValue: 0,
        });
      }
    } else { // not multipage
      if (this.props.station == "Basic Patient Information") {
        // Meteor.call('patientinfo.insert', this.multiData);
        var formData = {};
        formData[this.props.station] = newForm;
        formData.id = this.props.id;
        Meteor.call('patientinfo.insert', formData, (error, result) => {
          if (result) { alert("Successful! ID is " + String(result)); }
          else { alert("Unsuccessful"); } 
        });
      } else {
        // Store data in array, so that it can be $push[ed] into mongo
        var formData = {};
        formData[this.props.station] = newForm;
        formData.id = this.props.id;

        // if (!this.isMultipage || this.pageIndex >= Object.keys(formSchemas[this.props.station]).length - 1) {
        // console.log(this.stations[this.stations.indexOf(this.props.station)+1]);
        // newForm.nextStation = this.stations[this.stations.indexOf(this.props.station)+1];

        Meteor.call('patientinfo.update', formData);
        Meteor.call('patientinfo.nextstation', this.props.id);

        Session.set('currentPatient',null);
      }
    }
    window.scrollTo(0, 0)
  }

  handleTabChange = (event, value) => {
    this.setState({ tabValue:value });
  };

  handleSkipStation(stationToSkip, event) {
    if (confirm("Confirm skip " + stationToSkip + "?")) {
      Meteor.call('patientinfo.skipStation', this.props.id, this.props.station, stationToSkip);
    }
  }

  makeStationEntry(station) {
    // onClick={this.editField.bind(this,field)}
    return (
      <Fragment>
        <Button variant="text" fullWidth={true} onClick={this.handleSkipStation.bind(this,station)}>
          {station}
        </Button>
      </Fragment>
    );
  }

  getStationList() {
    // console.log(this.props.stationQueue);
    const newStationQueue = this.props.stationQueue.map(
      station => this.makeStationEntry(station)
    );
    
    return (
      <div>
        {newStationQueue}
      </div>
    );
  }

  render() {
    // Index into appropriate form for multipage forms
    var currentFormSchema = formSchemas[this.props.station];
    var currentFormLayout = formLayouts[this.props.station];
    if (this.isMultipage) {
      currentFormSchema = currentFormSchema[Object.keys(currentFormSchema)[this.state.pageIndex]];
      currentFormLayout = currentFormLayout[Object.keys(currentFormLayout)[this.state.pageIndex]];
    }
    
    const newForm = () => (
      <ClearableAutoForm
        schema={currentFormSchema(this.props.patientInfo)}
        onSubmit={this.handleSubmit}
        onSubmitSuccess={() => {
          if (this.props.id !== null && this.props.station !== "Basic Patient Information" && (!this.isMultipage || (this.state.pageIndex == 0))) {
            alert("Successful");
          }}}
        onSubmitFailure={() => {
          if (!this.isMultipage || (this.state.pageIndex == 0)) {
            alert('Unsuccessful')
          }}}
        noUserSelected = {this.props.id === null && this.props.station !== "Basic Patient Information"}
      >
        {currentFormLayout(this.props.patientInfo)}
        <ErrorsField />
        <div>
          <SubmitField inputRef={(ref) => this.formRef = ref} />
        </div>
        
        <br /><Divider />
        {/* {typeof(this.props.stationQueue) !== "undefined" &&
          <Typography variant="h6">
            Next station: {this.props.stationQueue[1]}
          </Typography>
        } */}
      </ClearableAutoForm>
    );
    
    // Replace undefined with default value of 0
    const tabValue = (this.state.tabValue === undefined) ? 0 : this.state.tabValue;
    
    return (
      <Paper elevation={2} p={0} m={0}>
        <AppBar position="static" color="default">
          {/* <Tabs value={tabValue} onChange={this.handleTabChange}>
            <Tab label="Form" />
            <Tab label="Stations" />
          </Tabs> */}
        </AppBar>
        {tabValue === 0 && newForm()}
        {tabValue === 1 && typeof(this.props.stationQueue) !== "undefined" && this.getStationList()}
      </Paper>
    );
  }
}

export default Form;