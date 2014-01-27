'use strict';

angular.module('mappifyApp')
  .factory('sponateService', function() {
    
    /** SPARQL endpoint settings */
    var endpointUri = 'http://localhost/sparql';
    var defaultGraphs = ['http://dbpedia.org'];
    var conn =
        new Jassa.service.SparqlServiceHttp(endpointUri, defaultGraphs);
    
    /** prefix definitions */
    var prefixes = {
        'dbo': 'http://dbpedia.org/ontology/',
        'dbpedia': 'http://dbpedia.org/resource/',
        'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
        'foaf': 'http://xmlns.com/foaf/0.1/',
        'geo': 'http://www.w3.org/2003/01/geo/wgs84_pos#' 
    };
    
    return new Jassa.sponate.StoreFacade(conn, prefixes);
  });