'use strict';

angular.module('mui2App')
  .factory('sponateService', function(sparqlService) {
    var prefixes = {
        'dbpedia-owl': 'http://dbpedia.org/ontology/',
        'dbpedia': 'http://.org/resource/',
        'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
        'foaf': 'http://xmlns.com/foaf/0.1/'
      };
    return new Jassa.sponate.StoreFacade(sparqlService.conn, prefixes);
  });