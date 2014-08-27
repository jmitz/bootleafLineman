// esriMap.js

var queryDistrict = {
  queryUrl: "http://geoservices.epa.illinois.gov/arcgis/rest/services/Boundaries/LegislativeDistricts/FeatureServer/2",
  outFields: [
   'DistrictNum',
    'SenateNum'
  ],
  searchFields: {
    Senate: 'SenateNum',
    House: 'DistrictNum'
  },
  filterFields: {
    Senate: 'SenateDist',
    House: 'StateHouseDist'
  }
};

var testResult;

require([
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  'esri/geometry/Extent',
  "esri/SpatialReference"
  ],
  function (
    Query,
    QueryTask,
    Extent,
    SpatialReference
    ){
    var spatialRef = new SpatialReference(4326);
    var query = new Query();
    query.geometryPrecision = 4;
    query.returnGeometry = true;
    query.outSpatialReference = spatialRef;
    query.outFields = queryDistrict.outFields;

    var queryTask = new QueryTask(queryDistrict.queryUrl);

    queryDistrict.findDistrict = function(districtInfo, map){
      var queryString = queryDistrict.searchFields[districtInfo.type] + ' = ' + districtInfo.district;
      queryDistrict.executeQuery(queryString, map);
    };

    queryDistrict.executeQuery = function(where, map){
      query.where = where;
      queryTask.execute(query, function(results){
        queryDistrict.bounds = getBounds(results.features);
        map.fitBounds(queryDistrict.bounds);
      });
    };

    function getBounds(features){
      var fullExtent;
      for (index = 0; index < features.length; ++index){
        var ext = features[index].geometry.getExtent();
        if (fullExtent) {
          fullExtent = fullExtent.union(ext);
        }
        else {
          fullExtent = new Extent(ext);
        }
      }
      var returnBounds = [
        [fullExtent.ymin, fullExtent.xmin],
        [fullExtent.ymax, fullExtent.xmax]
      ];
      return returnBounds;
    }
});

