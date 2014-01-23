'use strict';

angular.module('mappifyApp')
  .factory('mappifyConceptsService', function(){
    return new MappifyConcepts();
  });

var MappifyConcepts = function() {
  this.concepts = [];
  this.selectedConcept = null;
};
MappifyConcepts.prototype = {
    getConcepts : function() {
      return this.concepts;
    },
    getSelectedConcept : function() {
      return this.selectedConcept;
    },
    addConcept: function() {
      this.concepts.push(new MappifyConcept());
    },
    createAndAddConcept : function(name) {
      var concept = new MappifyConcept();
      if (name !== null) {
        concept.name = name;
      }
      this.concepts.push(concept);
      
      return concept;
    },
    deleteConcept : function(selectedConcept) {
      var index = this.concepts.indexOf(selectedConcept);
      this.concepts.splice(index, 1);
    },
    getSponateQuery : function(selectedConcept) {
      var index = this.concepts.indexOf(selectedConcept);
      return this.concepts[index].getSponateQuery();
    },
    setSponateQuery: function(concept, queryStr) {
      concept.sponateQuery = queryStr;
    },
    getMarkerIconPath: function(concept) {
      var index = this.concepts.indexOf(concept);
      return this.concepts[index].markerIconPath;
    },
    setMarkerIconPath: function(concept, markerIconPath) {
      concept.markerIconPath = markerIconPath;
    },
    getSponateMapping: function(concept) {
      var index = this.concepts.indexOf(concept);
      return this.concepts[index].sponateMapping;
    },
    setSponateMapping: function(concept, mappingStr) {
      concept.sponateMapping = mappingStr;
    },
    getInfoTemplate: function(concept) {
      var index = this.concepts.indexOf(concept);
      return this.concepts[index].infoTemplate;
    },
    setInfoTemplate: function(concept, infoTemplate) {
      concept.infoTemplate = infoTemplate;
    },
    saveCurrentValues: function(mainScope) {
      if (mainScope.selectedMappifyConcept !== null) {
        var concept = mainScope.selectedMappifyConcept;
        // write markerIconPath
        concept.markerIconPath = mainScope.markerFilePath;
        // write infoTemplate
        concept.infoTemplate = mainScope.infoTemplate;
        // write sponate query
        concept.sponateQuery = mainScope.sponateQuery;
        // write sponateMapping
        concept.sponateMapping = mainScope.sponateMapping;
      }
    }
};
