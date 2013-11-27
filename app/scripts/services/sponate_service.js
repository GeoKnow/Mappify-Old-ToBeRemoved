'use strict';

angular.module('mui2App')
  .factory('sponateService', function(sparqlService) {
    var prefixes = {
        'dbpedia-owl': 'http://dbpedia.org/ontology/',
        'dbpedia': 'http://.org/resource/',
        'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
        'foaf': 'http://xmlns.com/foaf/0.1/'
      };
    var qef = new Jassa.service.QueryExecutionFactoryHttp("http://10.23.0.1/sparql", []);
    return new Jassa.sponate.StoreFacade(qef, prefixes);
  });