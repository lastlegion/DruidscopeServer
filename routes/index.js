var express = require('express');
var router = express.Router();

var plywood = require('plywood');
var ply = plywood.ply;
var $ = plywood.$;


var External = plywood.External;
var druidRequesterFactory = require('plywood-druid-requester').druidRequesterFactory;


/* Plywood connection*/ 
var druidRequester = druidRequesterFactory({
  host: '127.0.0.1:8082'
}); 

var randData = External.fromJS({
  engine: 'druid', 
  source: 'out2', 
  timeAttribute: 'timestamp',

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
  var query = req.body;
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
    console.log(attribute);
    console.log(query[attribute]);
    ex = ex.apply("out2", $('out2')
        .filter($(attribute).in(query[attribute])));
    //console.log(ex);
   // ex = ex.filter($("country").in(query[attribute]));

  }

  //ex = ex.filter($("country").in(["Qatar", "Omam"]));
  //Compute aggregates

  ex = ex.apply("countries", $("out2").split("$country", "country")
    .apply("Count", $("out2").count()));
    /*      
    .and($('A').in(["0", "1", "2"]))))
    .apply("Count", $('out2').count())
    .apply("Countries", $("out2").split("$country","country")
        .apply("Count", $("out2").count()))
    .apply("Ds", $("out2").split("$D", "D")
        .apply("Count", $("out2").count()));
    */
    
    
  ex.compute(context).then(function(data){
    console.log(JSON.stringify(data.toJS(), null ,2));
    res.end();
  }).done();

  
});

router.get('/filter', function(req, res, next){ 
  console.log(req.query.query);
  var queryString = JSON.parse(req.query.query);
  console.log(queryString);

  

  res.end();
});

module.exports = router;
