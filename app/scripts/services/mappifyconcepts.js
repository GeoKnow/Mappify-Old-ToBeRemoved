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
      var index = this.concepts.indexOf(concept);
      this.concepts[index].sponateQuery = queryStr;
    },
    getMarkerIconPath: function(concept) {
      var index = this.concepts.indexOf(concept);
      return this.concepts[index].markerIconPath;
    },
    setMarkerIconPath: function(concept, markerIconPath) {
      var index = this.concepts.indexOf(concept);
      this.concepts[index].markerIconPath = markerIconPath;
    }
};
