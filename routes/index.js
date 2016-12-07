var express = require('express');
var router = express.Router();

var plywood = require('plywood');
var ply = plywood.ply;
var $ = plywood.$;


var External = plywood.External;
var druidRequesterFactory = require('plywood-druid-requester').druidRequesterFactory;


/* Plywood connection*/ 
var druidRequester = druidRequesterFactory({
  host: '127.0.0.1:8082',
  allowSelectQueries: true
}); 

var randData = External.fromJS({
  engine: 'druid', 
  source: 'out2', 
  timeAttribute: 'timestamp',
  allowSelectQueries: true

}, druidRequester);

var context = {

  out2: randData
};


var ATTRIBUTES = ["A", "B", "C", "D", "group", "title", "optedin"];  


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/filter', function(req, res, next){
  var query = req.body.filters;
  var aggregations = req.body.aggregations;
  var select = req.body.select;
  console.log(query);
  var ex = ply()
      .apply("out2", $('out2')
      .filter($("timestamp")
        .in({
           start: new Date("2016-12-01T00:00:00Z"),
           end: new Date("2016-12-12T00:00:00Z")
          })
     
      )
    );
  
  var filters = {};


  //Apply filters
  //
  for(var attribute in query) {

    var filter = query[attribute].filter;
    ex = ex.apply("out2", $('out2')
        .filter($(attribute).in(filter)));
    //console.log(ex);
   // ex = ex.filter($("country").in(query[attribute]));

  }

  //ex = ex.filter($("country").in(["Qatar", "Omam"]));
  //Compute aggregates

  //Perform aggregations
  for(var attribute in aggregations){
    var aggregation = aggregations[attribute];
    console.log(attribute);
    console.log(aggregation);
    ex = ex.apply(attribute, $("out2").split("$"+attribute, attribute)
        .apply("Count", $("out2").count()));
  }

  //Perform selections
  for(var attribute in select){
    ex = ex.apply("select", $("out2").select(attribute).limit(select[attribute].limit));
  }

  /*
  ex = ex.apply("countries", $("out2").split("$country", "country")
    .apply("Count", $("out2").count()));

  ex = ex.apply("A", $("out2").split("$A", "A")
    .apply("Count", $("out2").count()));
  ex = ex.apply("B", $("out2").split("$B", "B")
    .apply("Count", $("out2").count()));
  ex = ex.apply("C", $("out2").split("$B", "B")
    .apply("Count", $("out2").count()));
  ex = ex.apply("select", $("out2").select("D"));
  */

    /*      
    .and($('A').in(["0", "1", "2"]))))
    .apply("Count", $('out2').count())
    .apply("Countries", $("out2").split("$country","country")
        .apply("Count", $("out2").count()))
    .apply("Ds", $("out2").split("$D", "D")
        .apply("Count", $("out2").count()));
    */
    
    
  ex.compute(context).then(function(data){
    res.end(JSON.stringify(data.toJS(), null ,2));
    //res.end();
  }).done();

  
});

router.get('/filter', function(req, res, next){ 
  console.log(req.query.query);
  var queryString = JSON.parse(req.query.query);
  console.log(queryString);

  

  res.end();
});

module.exports = router;
