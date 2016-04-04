/*
 * Voronoi Diagram on Google Maps V3
 * Author : ASWIN SIVA
 * email : aswinsiva@iitj.ac.in
 * Description : Javascript implementation of Voronoi Diagram on Google Maps
 * Dependency : Uses rhill-voronoi-core.js library
*/

var map;
var sites = [];
var voronoiedges = [];

function mapload() {
	var india_lat_long = new google.maps.LatLng(21.7679,78.8718);
	var mapProp = {
  		center : india_lat_long,
  		zoom : 7,
  		mapTypeId : google.maps.MapTypeId.ROADMAP
  	};
	map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

	google.maps.event.addListener(map, 'click', function(event) {
		addsite(event.latLng);
	});
}

function addsite(site) {
	var marker = new google.maps.Marker({position : site, map : map});
	sites.push(site);
}

function create_voronoi_diagram() {
	if (sites.length <= 1)
		return;

	for (var i = 0; i < voronoiedges.length; i++)
		voronoiedges[i].setMap(null);
	voronoiedges = []
	
	var mapbounds = map.getBounds();
	var swbound = mapbounds.getSouthWest();
	var nebound = mapbounds.getNorthEast();
	
	var origin = {
		x : map.getProjection().fromLatLngToPoint(swbound).x,
		y : map.getProjection().fromLatLngToPoint(nebound).y
	};

	var opporigin = {
		x : map.getProjection().fromLatLngToPoint(nebound).x,
		y : map.getProjection().fromLatLngToPoint(swbound).y
	};

	var site_coords = [];
	for (var i = 0; i < sites.length; i++) {
		var site = map.getProjection().fromLatLngToPoint(sites[i]);
		site.x -= origin.x;
		site.y -= origin.y;

		if (site.x < 0 || site.y < 0) {
			alert("ERROR!\nSite out of Map\nPlease Zoom out and try again!");
			location.reload()
			return;
		}
		site_coords.push({x : site.x, y : site.y});
	}
	
	var voronoi = new Voronoi();
	var boundary = {xl : 0, xr : opporigin.x - origin.x, yt : 0, yb : opporigin.y - origin.y};
	var voronoi_diagram = voronoi.compute(site_coords, boundary);

	for (var i = 0; i < voronoi_diagram.edges.length; i++) {
		var pt1 = { x : voronoi_diagram.edges[i].va.x + origin.x,
					y : voronoi_diagram.edges[i].va.y + origin.y
			  	  };

		var pt2 = {x : voronoi_diagram.edges[i].vb.x + origin.x,
			   	   y : voronoi_diagram.edges[i].vb.y + origin.y
			  	  };

		pt1 = map.getProjection().fromPointToLatLng(pt1);
		pt2 = map.getProjection().fromPointToLatLng(pt2);

		var voronoiedge = new google.maps.Polyline({
		    path: [pt1, pt2],
		    strokeColor: "#FF0000",
		    strokeOpacity: 1.0,
		    strokeWeight: 2
		  });

  		voronoiedge.setMap(map);
  		voronoiedges.push(voronoiedge);

	}
}

google.maps.event.addDomListener(window, 'load', mapload);