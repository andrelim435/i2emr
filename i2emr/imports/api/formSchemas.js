import SimpleSchema from 'simpl-schema';

import Patientinfo from '/imports/api/patientinfo';

// Customise validation error messages
SimpleSchema.setDefaultMessages({
  messages: {
    en: {
      "IDnotUnique": "ID is already registered",
    },
  },
});

// Define the schema
export const formSchemas = {
  "Registration":
  new SimpleSchema({
    name: {
      type: String,
      regEx: /^\D+$/,
      label: "Name",
    },
    id: {
      type: String,
      regEx: /^[A-z][0-9]{7}[A-z]$/,
      label: "ID",
      custom: function () {
        if (Meteor.isClient && this.isSet) {
          // Do a blocking, direct database query
          // This is important, AutoFrom validation will not work otherwise
          if (Patientinfo.find({id:this.value}).count() !== 0) {
            // console.log("ID not unique");
            return "IDnotUnique";
          }
        }
      }
    },
    gender: {
      type: String,
      allowedValues: ['male', 'female'],
    },
    age: {
      type: SimpleSchema.Integer,
      min: 0,
    },
    contactNumber: {
      type: SimpleSchema.Integer,
    },
    spokenLanguages: {
      type: Array,
    },
    'spokenLanguages.$': {
      type: String,
      allowedValues: ['Sambalpuri', 'Odia', 'English', 'Others'],
    },
    writtenLanguages: {
      type: Array,
    },
    'writtenLanguages.$': {
      type: String,
      allowedValues: ['Sambalpuri', 'Odia', 'English', 'Others'],
    },
    address: {
      type: String,
    },
    anyDrugAllergies: {
      type: String,
      allowedValues: ['Yes', 'No'],
    },
    drugAllergies: {
      type: String,
      optional: true,
    },
  }),

  "Height & weight":
  new SimpleSchema({
    height: {
      type: Number,
      min: 0.7,
      max: 2.8,
      label: "Height (m)",
    },
    weight: {
      type: Number,
      min: 5,
      max: 500,
      label: "Weight (kg)",
    },
    waist: {
      type: Number,
      label: "Waist circumference (cm)",
    },
    hip: {
      type: Number,
      label: "Hip circumference (cm)",
    },
  }),

  "CBG & Hb":
  new SimpleSchema({
    cbg: {
      type: SimpleSchema.Integer,
      min: 20,
      max: 400,
      label: "Capillary Blood Glucose (mg/dL)",
    },
    hb: {
      type: Number,
      min: 4,
      max: 40,
      label: "Hemoglobin (g/dL)"
    },
  }),

  "Phlebotomy": 
  new SimpleSchema({
    phleboCompleted: {
      type: Boolean,
    },
  }),

  "Blood pressure":
  new SimpleSchema({
    bp1Sys: {
      type: SimpleSchema.Integer,
      min: 50,
      max: 300,
      label: "1st Systolic blood pressure"
    },
    bp1Dia: {
      type: SimpleSchema.Integer,
      min: 20,
      max: 200,
      label: "1st Diastolic blood pressure"
    },
    bp2Sys: {
      type: SimpleSchema.Integer,
      min: 50,
      max: 300,
      label: "2nd Systolic blood pressure"
    },
    bp2Dia: {
      type: SimpleSchema.Integer,
      min: 20,
      max: 200,
      label: "2nd Diastolic blood pressure"
    },
    bp3Sys: {
      type: SimpleSchema.Integer,
      min: 50,
      max: 300,
      label: "3rd Systolic blood pressure"
    },
    bp3Dia: {
      type: SimpleSchema.Integer,
      min: 20,
      max: 200,
      label: "3rd Diastolic blood pressure"
    },
  }),
}