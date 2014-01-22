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
    addConcept : function() {
      this.concepts.push(new MappifyConcept());
    },
    deleteConcept : function(selectedConcept) {
      var index = this.concepts.indexOf(selectedConcept);
      this.concepts.splice(index, 1);
    }
};
