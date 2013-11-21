'use strict';

angular.module('mui2App')
  .factory('sponateService', function(sparqlService) {
    var prefixes = {'rdfs': 'http://www.w3.org/2000/01/rdf-schema#'};
    return new Jassa.sponate.StoreFacade(sparqlService.conn, prefixes);
  });