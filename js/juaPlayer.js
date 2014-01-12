/**
 * @author unixander
 * @name juaPlayer
 * @version 1.0.1.2
 */
var btnFullScreenPressed=false;
/*
$(function() {
	juaPlayer.source = 'sample/test.WebM';
	juaPlayer.width = 700;
	juaPlayer.height = 300;
	juaPlayer.init();
});
*/

var juaPlayer = {
	//Player options
	player : null, //player instance
	source : null, //source of file
	width : null,
	height : null,
	poster : null,
	audio : null,
	video : null,
	//other options
	mousedown : false,
	playing : false,
	watchProgress : null,
	draw: null,
	bFullScreen : null,
	original : null,
	juaPlayerTags : '<div class="juaPlayer" id="juaPlayer_inner">' +
					'<video class="juaPlayer" id="video"></video>'+
					'<div class="juaCanvas" id="juaCanvas"></div>'+
					'<div class="juaPlayer" id="controls">'+
					'<div class="juaPlayer" id="controls_inner">'+
					'<div class="juaPlayer play" id="btnPlay"></div>'+
					'<div class="juaPlayer" id="panel">'+
					'<div class="juaPlayer" id="bar">'+
					'<div class="juaPlayer" id="progressbar"></div>'+
					'<div class="juaPlayer" id="loadedbar"></div>'+
					'<div class="juaPlayer" id="playedbar"></div>'+
					'<div class="juaPlayer" id="playControl"></div></div></div>'+
					'<div class="juaPlayer" id="txtTimeRem">00:00:00</div>'+
					'<div class="juaPlayer" id="divider">|</div>'+
					'<div class="juaPlayer" id="txtTotalTime">00:00:00</div>'+
					'<div class="juaPlayer sound_high" id="btnVolume"></div>'+
					'<div class="juaPlayer" id="volume">'+
					'<div class="juaPlayer" id="volume_inner">'+
					'<div class="juaPlayer" id="volume_line"></div>'+
					'<div class="juaPlayer" id="volumer"></div></div></div>'+
					'<div class="juaPlayer expand" id="btnFullScreen"></div>'+
					'<div class="juaPlayer tools" id="btnTools"></div></div></div></div>',
	init : function() {
		preinit();
	}
};

var preinit = function(e) {
	wrapVideoPlayer();
	initPlayer();
};


var initPlayer = function() {
	$('.juaPlayer#video').attr('src', juaPlayer.source);
	juaPlayer.video = $('.juaPlayer#video').get(0);
	juaPlayer.video.load();
	$('.juaPlayer#juaPlayer').width(juaPlayer.width);
	$('.juaPlayer#juaPlayer').height(juaPlayer.height);
	juaPlayer.video.width = juaPlayer.width;
	juaPlayer.video.height = juaPlayer.height;
	$('.juaPlayer#video').append('<p>Your user agent does not support the HTML5 Video element.</p>');
	$('.juaPlayer#video').bind('progress', function() {
		updateLoadBar();
	}).bind('ended', function() {
		$(".juaPlayer#btnPlay").removeClass('pause').addClass('play');
		$('.juaPlayer#txtTimeRem').html(formatTime(juaPlayer.video.duration).txt);
		playing = false;
	}).bind('durationchange', function() {
		$('.juaPlayer#txtTotalTime').html(formatTime(juaPlayer.video.duration).txt);
	});

	$('.juaPlayer#panel').mouseup(function(e) {
		juaPlayer.mousedown = false;
	}).mousedown(function(e) {
		juaPlayer.mousedown = true;
	}).mousemove(function(e) {
		if (!juaPlayer.mousedown)
			return;
		moveProgressControl(e);
	}).click(function(e) {
		moveProgressControl(e);
	}).mouseleave(function(e){
		juaPlayer.mousedown = false;
	});

	$('.juaPlayer#btnVolume').hover(function(e) {
		$('.juaPlayer#volume').show();
		$('.juaPlayer#volume').animate({
			height : 60,
			opacity : 1
		});
	});

	$('.juaPlayer#volume').mouseup(function(e) {
		juaPlayer.mousedown = false;
	}).mousedown(function(e) {
		juaPlayer.mousedown = true;
	}).mousemove(function(e) {
		if (!juaPlayer.mousedown)
			return;
		moveVolumeControl(e);
	});

	$('.juaPlayer#volume,.juaPlayer#volume_line').click(function(e) {
		moveVolumeControl(e);
	});

	$('.juaPlayer#btnVolume').click(function() {
		if (juaPlayer.video.muted) {
			if (juaPlayer.video.volume <= 0)
				$(this).removeClass('sound_high sound_low').addClass('sound_mute');
			else if (juaPlayer.video.volume > 0.4)
				$(this).removeClass('sound_mute sound_low').addClass('sound_high');
			else if (juaPlayer.video.volume > 0)
				$(this).removeClass('sound_high sound_mute').addClass('sound_low');
			juaPlayer.video.muted = false;
		} else {
			$(this).removeClass('sound_high sound_low').addClass('sound_mute');
			juaPlayer.video.muted = true;
		}
	});

	$('.juaPlayer#volume').mouseleave(function(e) {
		juaPlayer.mousedown = false;
		$('.juaPlayer#volume').hide();
		$('.juaPlayer#volume').animate({
			height : 0,
			opacity : 0
		});
	});

	$('.juaPlayer#btnPlay').click(function(e) {
		juaPlayer.playing = !juaPlayer.playing;
		if (juaPlayer.playing) {
			$(this).removeClass('play').addClass('pause');
			juaPlayer.video.play();
			juaPlayer.watchProgress = setTimeout(updateProgressBar, 500);
			drawCanvas();
			juaCanvas.sort();
		} else {
			$(this).removeClass('pause').addClass('play');
			juaPlayer.video.pause();
			juaCanvas.clearScreen();
			clearTimeout(juaPlayer.draw);
		}
	});

	$('.juaPlayer#controls').mouseleave(function(e) {
		juaPlayer.mousedown = false;
		if ($('.juaPlayer#volume').height() > 0) {
			$('.juaPlayer#volume').show();
			$('.juaPlayer#volume').animate({
				height : 0,
				opacity : 0
			});
		}
	});

	$('.juaPlayer#juaPlayer').mouseleave(function(e) {
		$('.juaPlayer#controls').animate({
			opacity : 0.0
		});
	}).mouseenter(function(e) {
		$('.juaPlayer#controls').animate({
			opacity : 1
		});
	});

	$('.juaPlayer#btnFullScreen').click(function(){
		btnFullScreenPressed=true;
		onFullScreenBtn();
	});
	$(window).bind("fullscreenchange mosfullscreenchange webkitfullscreenchange",function(){
		if(!btnFullScreenPressed)
			onFullScreenBtn();
		btnFullScreenPressed=false;
	});
};

var onFullScreenBtn=function() {
		juaPlayer.bFullScreen = !juaPlayer.bFullScreen;
		juaPlayer.player = $('.juaPlayer#juaPlayer_inner').get(0);
		juaCanvas.saveInstance();
		if (juaPlayer.bFullScreen) {
			launchFullScreen(document.getElementById("juaPlayer"));
			juaPlayer.original = {
				offsetWidth : juaPlayer.player.offsetWidth,
				offsetHeight : juaPlayer.player.offsetHeight,
				barWidth : $(".juaPlayer#progressbar").width()
			};
			juaPlayer.player.style.width = window.innerWidth + "px";
			juaPlayer.player.style.height = window.innerHeight + "px";
			juaPlayer.player.style.position = "fixed";
			juaPlayer.player.style.left = 0;
			juaPlayer.player.style.top = 0;
			juaCanvas.canvas.node.width=window.innerWidth;
			juaCanvas.canvas.node.height=window.innerHeight;
			reCalculate(juaPlayer.original.barWidth,$(".juaPlayer#progressbar").width());
			$('.juaPlayer#btnFullScreen').removeClass('expand').addClass('import_icon');
		} else {
			cancelFullscreen();
			reCalculate($(".juaPlayer#progressbar").width(),juaPlayer.original.barWidth);
			juaPlayer.player.style.width = juaPlayer.original.offsetWidth + "px";
			juaPlayer.player.style.height = juaPlayer.original.offsetHeight + "px";
			juaCanvas.canvas.node.width=juaPlayer.original.offsetWidth;
			juaCanvas.canvas.node.height=juaPlayer.original.offsetHeight;
			juaPlayer.player.style.position = "absolute";
			$('.juaPlayer#btnFullScreen').removeClass('import_icon').addClass('expand');
		}
		juaCanvas.reloadInstance();
	};

var reCalculate=function(oldSize,newSize){
	var currentX=parseInt($(".juaPlayer#playControl").css('left')),
	newX=(currentX*newSize)/oldSize;
	$(".juaPlayer#playControl").css('left', newX);
	$(".juaPlayer#playedbar").css('width', (newX + 3));
};

var wrapVideoPlayer = function(e) {
	if (document.getElementById('juaPlayer'))
		return;
	$('.juaPlayer').attr('id', 'juaPlayer');
	$('.juaPlayer#juaPlayer').html(juaPlayer.juaPlayerTags);
};

var moveProgressControl = function(e) {
	var startx = $('.juaPlayer#bar').offset().left, endx = startx + $('.juaPlayer#bar').width();
	var offset = e.pageX - startx ;
	var flag = $('.juaPlayer#loadedbar').width() > (offset);
	if (flag && endx >= e.pageX && startx <= e.pageX) {
		$(".juaPlayer#playControl").css('left', offset - 3);
		$(".juaPlayer#playedbar").css('width', offset / $(".juaPlayer#progressbar").width() * 100 + "%");
		if (offset < -3) {
			juaPlayer.video.currentTime = 0;
		} else {
			juaPlayer.video.currentTime = juaPlayer.video.duration * offset / $(".juaPlayer#progressbar").width();
		}
	} else if (!flag) {
		var newWidth = $('#loadedbar').width();
		juaPlayer.video.currentTime = juaPlayer.video.duration * newWidth / $(".juaPlayer#progressbar").width();
		$(".juaPlayer#playControl").css('left', newWidth - 3);
		$(".juaPlayer#playedbar").css('width', newWidth / $(".juaPlayer#progressbar").width() * 100 + "%");
	}
	$('.juaPlayer#txtTimeRem').html(formatTime(juaPlayer.video.currentTime).txt);
	juaCanvas.clearScreen();
	juaCanvas.resetAllPoints();
	juaCanvas.tool.draw(juaPlayer.video.currentTime);
};

var moveVolumeControl = function(e) {
	juaPlayer.video.muted = false;
	var starty = $('.juaPlayer#volume_line').offset().top, endy = starty + $('.juaPlayer#volume_line').height();
	var offset = e.pageY - starty + 3;
	var flag = $('.juaPlayer#volume_line').height() > offset - 3;
	if (flag && endy >= e.pageY && starty <= e.pageY) {
		$('.juaPlayer#volumer').css('top', offset);
		if (offset <= 3) {
			juaPlayer.video.volume = 1;
		} else {
			juaPlayer.video.volume = 1 - (offset - 2) / $('.juaPlayer#volume_line').height();
		}
	} else if (!flag) {
		$('.juaPlayer#volumer').css('top', $('.juaPlayer#volume_line').height());
		juaPlayer.video.muted = true;
		$('.juaPlayer#btnVolume').removeClass('sound_high sound_low').addClass('sound_mute');
	}
	if (juaPlayer.video.muted || juaPlayer.video.volume <= 0)
		$('.juaPlayer#btnVolume').removeClass('sound_high sound_low').addClass('sound_mute');
	else if (juaPlayer.video.volume > 0.4)
		$('.juaPlayer#btnVolume').removeClass('sound_mute sound_low').addClass('sound_high');
	else if (juaPlayer.video.volume > 0)
		$('.juaPlayer#btnVolume').removeClass('sound_high sound_mute').addClass('sound_low');
};

var updateLoadBar = function() {
	if (juaPlayer.video.buffered.length > 0) {
		var percent = juaPlayer.video.buffered.end(0) / juaPlayer.video.duration * 100;
		$('.juaPlayer#loadedbar').width(percent + "%");
	}
};

var updateProgressBar = function() {
	if (!juaPlayer.video.ended && !juaPlayer.video.paused) {
		var newWidth = $('.juaPlayer#progressbar').width() * juaPlayer.video.currentTime / juaPlayer.video.duration;
		$(".juaPlayer#playControl").css('left', newWidth - 3 );
		$(".juaPlayer#playedbar").css('width', newWidth / $('.juaPlayer#progressbar').width() * 100 + "%");
		$('.juaPlayer#txtTimeRem').html(formatTime(juaPlayer.video.currentTime).txt);
		if (juaPlayer.video.ended) {
			clearTimeout(juaPlayer.watchProgress);
		}
		juaPlayer.watchProgress = setTimeout(updateProgressBar, 500);
	}
};

var drawCanvas=function(){
	if(!juaCanvas||juaCanvas.canvas===null){
		console.log('Canvas not initialized');
		return;
	}
	var func=juaCanvas.tool['draw'];
	if(func){
		func(juaPlayer.video.currentTime);
	}
	
	juaPlayer.draw=setTimeout(drawCanvas,10);
	
};

var formatTime = function(time) {
	var hours = Math.floor(time / 3600);
	time -= hours * 3600;
	var minutes = Math.floor(time / 60);
	var seconds = Math.round(time - minutes * 60);
	var txt;
	if (hours < 10)
		txt = "0" + hours + ":";
	else
		txt = hours + ":";
	if (minutes < 10)
		txt += "0" + minutes + ":";
	else
		txt += minutes + ":";
	if (seconds < 10)
		txt += "0" + seconds;
	else
		txt += seconds;
	return {
		hours : hours,
		minutes : minutes,
		seconds : seconds,
		txt : txt
	};
};

var launchFullScreen=function(element) {
  if(element.requestFullScreen) {
    element.requestFullScreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen();
  }
};

var cancelFullscreen=function() {
  if(document.cancelFullScreen) {
    document.cancelFullScreen();
  } else if(document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if(document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen();
  }
};
