//depends on mapbox/Leaflet and d3
var dotDensity =  function(){
  
  var svg;
  var g;


  function init(){
    map._initPathRoot();
    svg = d3.select("#map").select("svg");
    g = svg.append("g").attr("class", "leaflet-zoom-hide");
  }

  function getMSAs(bounds){
   var endpoint = '/api/msas/';
            var params = { neLat: bounds.neLat,
                       neLon: bounds.neLon,
                       swLat: bounds.swLat,
                       swLon: bounds.swLon };
        return $.ajax({url: endpoint, data: params, traditional: true})
          .then(function(data){
            diffMSAs(data);
          }) 
  }

  function diffMSAs(data){
    console.log('diffing',data);
  }

  function update(bounds){
    getMSAs(bounds);
  }

  function draw(){  
    var data = sfMSA;
    var points = makeDots(data.tracts.features).map(function(point){
      var latlng = new L.LatLng(point[1], point[0]);
      return map.latLngToLayerPoint(latlng);
    });

    g.selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("class", "densityDot")
      .attr({
        "cx":function(d, i) { return d.x; },
        "cy":function(d, i) { return d.y; },
        "r":1,
        fill:"#444"            
      });
  }


  function wipe(){
    d3.selectAll(".densityDot").remove();
  }


  //https://github.com/substack/point-in-polygon 
  function pointInPoly(point, vs) {
    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      var xi = vs[i][0], yi = vs[i][1];
      var xj = vs[j][0], yj = vs[j][1];

      var intersect = ((yi > y) != (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }


  function randomPoint(rBounds){
    var point = new Array(2);
    var west = rBounds.getNorth();
    var north = rBounds.getEast();
    var east = rBounds.getSouth();
    var south = rBounds.getWest();
    point[0] = west + Math.random()*(east - west);
    point[1] = north + Math.random()*(south - north);
    return point;
  }


  function makeDots(features){
    var points = []; 
    for(var i=0; i<features.length; i++){
      var feat=features[i];
      var poly = feat.geometry.coordinates[0];
      var reverseBounds = L.latLngBounds(poly);
      if(!reverseBounds) continue;
      for(var j=0,len=feat.properties.volume/10>>0; j<len; j++){
        var pt = randomPoint(reverseBounds);
        var bail = 0;
        while(!pointInPoly(pt,poly)){
          if(++bail>10) break;
          pt = randomPoint(reverseBounds);
        }
        points.push(pt);
      } 
    }
    return points;
  }

  return {
    init:init,
    update:update,
    wipe:wipe
  }
}();
