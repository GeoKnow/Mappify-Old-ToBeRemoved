'use strict';

angular.module('mui2App')
  .factory('strTemplateParser', function() {

    var StrTmpltParser = function() {
    }
    StrTmpltParser.prototype = {
        resolve : function(inputStr, queryResults) {
            var parsePos = 0;
            while (parsePos < inputStr.length) {
                parsePos = inputStr.indexOf('{{');
                if (parsePos < 0) { break };

                var closingPos = inputStr.indexOf('}}');
                if (closingPos < 0) { break }; // then sth's wrong here

                var startPos = parsePos + 2; // parsepos is the position of the
                                             // first {{
                var attr = inputStr.substr(startPos, closingPos-startPos);
                if (queryResults[attr] !== 'undefined') {
                    var attrValue = queryResults[attr];
                    // remove leading and trailing angle brackets
                    if (attrValue.startsWith('<') && attrValue.endsWith('>')) {
                        attrValue = attrValue.substring(1, attrValue.length-1);
                    }
                    inputStr = inputStr.replace('{{' + attr + '}}', attrValue);
                }
                parsePos += 2; // just in case the {{ was not replaced
            }
            return inputStr;
        }
    };

    return new StrTmpltParser();
  });