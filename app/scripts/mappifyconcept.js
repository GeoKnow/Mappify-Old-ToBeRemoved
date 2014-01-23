'use strict';

var mappifyConceptIdCounter = 0;

var MappifyConcept = function() {
  this.init();
  this.markerIconPath = null;
  this.infoTemplate = null;
  this.sponateQuery = null;
  this.sponateMapping = null;
};

MappifyConcept.prototype = {
    // cls attributes
    nameTemplate: 'Concept ',
    idTemplate: 'concept',
    // methods
    init : function() {
      this.name = this.nameTemplate + mappifyConceptIdCounter;
      this.id = this.idTemplate + mappifyConceptIdCounter;
      mappifyConceptIdCounter++;
    },
    getSponateQuery: function() {
      return this.sponateQuery;
    }
};