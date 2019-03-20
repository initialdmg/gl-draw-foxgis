var Feature = require('./feature');
var LineString = require('./line_string');

var Arc = function(ctx, geojson) {
  Feature.call(this, ctx, geojson);
};

Arc.prototype = new LineString();
function getCenterPos (x1,y1,x2,y2,x3,y3){
	var a=2*(x2-x1);
	var b=2*(y2-y1);
	var c=x2*x2+y2*y2-x1*x1-y1*y1;
	var d=2*(x3-x2);
	var e=2*(y3-y2);
	var f=x3*x3+y3*y3-x2*x2-y2*y2;
	var x=(b*f-e*c)/(b*d-e*a);
	var y=(d*c-a*f)/(b*d-e*a);
	// console.log("x:"+x+"y:"+y);
	var r= Math.sqrt((x-x1)*(x-x1)+(y-y1)*(y-y1));//半径
	return {x: x, y: y, r: r};
}
//根据p1,p2,p3三个点确定圆弧坐标
Arc.prototype.getArcVertex = function(ctx,p1,p2,p3) {
	var x1 = p1.x,
			x2 = p2.x,
			x3 = p3.x,
			y1 = p1.y,
			y2 = p2.y,
			y3 = p3.y;
	if(x3===x2&&y3===y2){
		return false;
	}
	var c = {x:0,y:0}//圆心
	// var k = (x2-x1)/(x3-x2);	// x比例
	// var p1_SS = x1*x1+y1*y1;	// p1 x^2+y^2
	// var p2_SS = x2*x2+y2*y2;
	// var p3_SS = x3*x3+y3*y3;
	// //三个点确定的圆心坐标
	// c.y = ((1+k)*p2_SS-p1_SS-k*p3_SS)/(2*(1+k)*y2-2*k*y3-2*y1);
	// c.x = (2*(y1-y2)*c.y+p2_SS-p1_SS)/(2*(x2-x1));
	//圆的半径
	//var radius = Math.sqrt((c.x-x1)*(c.x-x1)+(c.y-y1)*(c.y-y1));
	var res = getCenterPos(x1,y1,x2,y2,x3,y3);
	c.x = res.x;
	c.y = res.y;
	// var radius = res.r;
	// var start = Math.atan((y1-c.y)/(x1 - c.x));
	// var middle = Math.asin((y2-c.y)/(x2 - c.x));
	// var end = Math.asin((y3-c.y)/(x3 - c.x));
	// var interval = (end - start) / 10
	var PI = Math.PI;
	var arcVertex = [];
	for(var i=0;i<=100;i++){
		var x = c.x+(x1-c.x)*Math.cos(i*PI/50)-(y1-c.y)*Math.sin(i*PI/50);
		var y = c.y+(x1-c.x)*Math.sin(i*PI/50)+(y1-c.y)*Math.cos(i*PI/50);

		try {
			var lnglat = ctx.map.unproject([x,y]);
			arcVertex.push([lnglat.lng,lnglat.lat]);
			var angle = Math.atan((y-c.y)/(x-c.x))-Math.atan((y3-c.y)/(x3-c.x));
			if(Math.abs(angle)<PI/50&&(x-c.x)/(x3-c.x)>0){
				break;
			}
		} catch (e) {
		}
		
	}
	return arcVertex;
};

module.exports = Arc;