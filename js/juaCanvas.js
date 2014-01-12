/**
 * @author unixander
 * @name juaCanvas module for juaPlayer
 * @version 1.0.1.2
 */
 /*
$(function() {
	juaCanvas.createCanvas();
	juaCanvas.initCanvas();
});
*/

var tools = {};
var juaCanvas = {
	parent : null,
	canvas : null,
	context : null,
	started : false,
	mousedown : false,
	tool : null,
	color : "#000",
	size : 6,
	lastTime : 0,
	storage : {},
	instance : null,
	times : [],
	sort : function() {
		quickSort(this.times);
	},
	saveInstance : function() {
		this.instance = juaCanvas.canvas.node.toDataURL();
	},
	clearScreen: function(){
		this.canvas.node.width=this.canvas.node.width;
	},
	reloadInstance : function() {
		var item = new Image();
		item.src = this.instance;
		juaCanvas.context.drawImage(item, 0, 0, juaCanvas.canvas.node.width, juaCanvas.canvas.node.height);
	},
	createCanvas : function() {
		this.parent = $('.juaCanvas#juaCanvas').get(0);
		this.canvas = {};
		this.canvas.node = document.createElement('canvas');
		this.canvas.context = this.canvas.node.getContext('2d');
		this.canvas.node.width = $(this.parent).width();
		this.canvas.node.height = $(this.parent).height();
		this.parent.appendChild(this.canvas.node);
		this.context = this.canvas.context;
	},
	initCanvas : function() {
		juaCanvas.tool = new tools['pencil']();
		$(this.canvas.node).mouseleave(event_canvas).mousedown(event_canvas).mouseup(event_canvas).mousemove(event_canvas).mouseenter(event_canvas);
	},
	resetAllPoints:function(){
		for(var index in juaPlayer.storage){
			if(juaPlayer.storage[index].drawn){
				juaPlayer.storage[index].drawn=false;
			}
		}
	}
};

tools.pencil = function() {
	var tool = this, path = {}, latency=4;
	this.started = false;

	this.draw = function(time) {
		for (var index in juaCanvas.times) {
			var item = juaCanvas.storage[juaCanvas.times[index]];
			if (juaCanvas.times[index] < time - latency && item.drawn ) {
				for(var indot in item.points){
					var point=item.points[indot];
					juaCanvas.context.clearRect(point.x - point.size - 4, point.y - point.size - 4, 2 * point.size + 8, 2 * point.size + 8);
				}
				item.drawn=false;
			} else if (juaCanvas.times[index] <= time && juaCanvas.times[index] > time-latency && !item.drawn) {
				for (var indot in item.points) {
					var point=item.points[indot];
					juaCanvas.context.beginPath();
					juaCanvas.context.arc(point.x, point.y, point.size, 0, Math.PI * 2, true);
					juaCanvas.context.fillStyle = point.color;
					juaCanvas.context.fill();
					juaCanvas.context.stroke();
				}
				item.drawn=true;
			} else {
				continue;
			}
		}
	};

	this.mousedown = function(e) {
		tool.started = true;
		
	};

	this.mousemove = function(e) {
		if (tool.started) {
			var time = juaPlayer.video.currentTime;
			if(!juaCanvas.storage[time]){ 
				juaCanvas.storage[time]={
					drawn: true,
					points: new Array()
				};
			}
			juaCanvas.storage[time].points.push({
				x:e._x,
				y:e._y,
				size:juaCanvas.size,
				color: juaCanvas.color
			});
			juaCanvas.context.beginPath();
			juaCanvas.context.arc(e._x, e._y, juaCanvas.size, 0, Math.PI * 2, true);
			juaCanvas.context.fillStyle = juaCanvas.color;
			juaCanvas.context.fill();
			juaCanvas.context.stroke();
			juaCanvas.times.push(time);
		}
	};

	this.mouseup = function(e) {
		if (tool.started) {
			tool.mousemove(e);
			tool.started = false;
			quickSort(juaCanvas.times);
		}
	};

	this.mouseleave = function(e) {
		if (tool.started) {
			tool.mousemove(e);
			tool.started = false;
		}
	};
	this.mouseenter = function(e) {
		if (e.which === 1) {
			tool.mousedown(e);
		}
	};
};

var event_canvas = function(e) {
	if (!juaPlayer.video) {
		console.log('Error initializing video');
		return;
	}
	if (e.layerX || e.layerX === 0) {
		e._x = e.layerX;
		e._y = e.layerY;
	} else if (e.offsetX || e.offsetX === 0) {
		e._x = e.offsetX;
		e._y = e.offsetY;
	}
	var func = juaCanvas.tool[e.type];
	if (func) {
		func(e);
	}
};

function quickSort(input, compareFunction) {
	var cmpFnc = function(value1, value2) {
		return value1 - value2;
	};
	cmpFnc = ( typeof (compareFunction) == 'function') ? compareFunction : cmpFnc;

	if (input.length <= 1)
		return input;

	var pivot = Math.floor(Math.random() * input.length);

	var less = [], greater = [];

	var pivotElem = input.splice(pivot, 1);

	for (var x in input) {
		if (cmpFnc(input[x], pivotElem[0]) <= 0)
			less.push(input[x]);
		else
			greater.push(input[x]);
	}

	return [].concat(quickSort(less, cmpFnc), pivotElem, quickSort(greater, cmpFnc));
}