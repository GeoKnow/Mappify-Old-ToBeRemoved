'use strict';

angular.module('mappifyApp')
  .factory('sponateService', function() {
    
    /** SPARQL endpoint settings */
    var endpointUri = 'http://localhost/sparql';
    var defaultGraphs = ['http://dbpedia.org'];
    var conn =
        Jassa.sponate.ServiceUtils.createSparqlHttp(endpointUri, defaultGraphs);
    
    /** prefix definitions */
    var prefixes = {
        'dbpedia-owl': 'http://dbpedia.org/ontology/',
        'dbpedia': 'http://.org/resource/',
        'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
        'foaf': 'http://xmlns.com/foaf/0.1/'
    };
    
    return new Jassa.sponate.StoreFacade(conn, prefixes);
  });