'use strict';

var redliner = (function redliner() {

  var path = require('path'),
      fs = require('fs'),
      yaml = require('js-yaml'),
      phantom = require('phantom'),
      chai = require('chai'),
      expect = chai.expect;


  return function(config) {

    var url = path.resolve(__dirname, config.resource);

    function getRedlines() {
      var p = path.resolve(__dirname, config.redlines);
      var redlineFiles = fs.readdirSync(p);

      var ymls = redlineFiles.map(function (file) {
            return path.resolve(p, file);
        }).filter(function (file) {
            return (fs.statSync(file).isFile() && path.extname(file) === '.yml');
        });

      return ymls;
    }


    var redlines = getRedlines();

    console.info('\nFound the following specifications of red lines:\n');
    console.info(redlines);
    console.info('\nRunning Tests...');


    /**
     * Run the engine for each yml file found
     */

    redlines.map(function redlines(yml) {

      try {
        var redline = yaml.safeLoad(fs.readFileSync(yml), 'utf8');
      } catch (e) {
        console.log(e);
      }

      var computedStyles;

      // For each Test in the yml file, load the page in PhantomJS
      redline.tests.forEach(function redlineAudit(test) {

        var className = redline.className;
        var testName = test.testGroup.testName
        delete test.testGroup.testName;

        var arr = Object.keys(test.testGroup).map(key => test.testGroup[key]);

        before(function() {

          // create the phantom instance
          return phantom.create().then(function (ph) {

            // create the phantom page
            return ph.createPage().then(function (page) {

              // open the url in the page
              return page.open(url).then(function (status) {

                // check to see if there was an error retrieving the page from the URL
                if (status == 'fail') {
                  // close the page
                  page.close();

                  // exit the phantom instance or you end up with orphaned processes
                  ph.exit();

                  throw new Error('Failed to load the HTML resource.');
                }
                // run some js within the opened page
                return page.evaluate(function (className) {

                  // select an element and return it
                  var element = document.querySelector(className);

									if (element == undefined) {
										return;
									}

                  return window.getComputedStyle(element);

                }, className).then(function (result) {

									// close the page
                  page.close();

                  // exit the phantom instance or you end up with orphaned processes
                  ph.exit();

                  if(!result) {
                    throw new Error('Could not render the '+className+' element for some reason.');
                  }

                  computedStyles = result;

                });
              });
            });
          });
        });

        // start the tests in Mocha
        describe(redline.formalName+' ('+className+')', function() {

          describe('#'+testName, function() {

            Object.keys(test.testGroup).map(function(key) {

              it('should have ' + key + ': '+test.testGroup[key], function (done) {
                expect(computedStyles[key]).to.equal(test.testGroup[key]);
                done();
              });

            });
          });
        });
      });

    });

  } // end return function

})();

module.exports = redliner;
