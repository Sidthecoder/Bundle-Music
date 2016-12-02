var audioPlayer = $(".audio-player")[0];

function pad(n) {
	if(n < 10) { return "0" + n;
	} else { return n.toString(); }
}

function formatTime(seconds) {
	seconds = Math.floor(seconds);
	if(seconds < 60) { return "00:" + pad(seconds) }
	else { return pad(parseInt(seconds / 60, 10)) + ":" + pad(seconds % 60); }
}

function getTracksDurations() {
	var tracks = $(".track-list li");
	var i = 0;
	$(tracks).each(function () {
		var track = this, url = $(track).data("url");
		var a = '<audio src="' + url + '" id="temp-player-' + i + '">';
		$(".wrap").append(a);
		$("#temp-player-" + i).on("loadedmetadata", function () {
			var str = formatTime(this.duration);
			$(this).remove();
			$(track).find(".time").html(str);
		});
		i++;
	});
}

window.RAF = (function () {
	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			function (callback) {
				window.setTimeout(callback, 1000 / 60);
			};
})();

function updatePlayer () {
	var percent = audioPlayer.currentTime / audioPlayer.duration * 100;
	$(".progress").val(percent);
	$(".timer").html(formatTime(audioPlayer.currentTime));
}

$(function () {
	getTracksDurations();
	
	$("li.track-info").on("click", function () {
		$(this).addClass("active")
				.siblings().removeClass("active");
		$(audioPlayer).attr("src", $(this).data("url"));
		$(".cover").css({ "background-image" : "linear-gradient(to bottom, rgba(0, 0, 0, .75), rgba(0, 0, 0, 0)), url(" + $(this).data("cover") + ")" });
		audioPlayer.play();
	});
	
	$(".play").on("click", function () {
		audioPlayer.play();
		$(this).hide();
		$(".pause").show();
	});
	
	$(".pause").on("click", function () {
		audioPlayer.pause();
		$(this).hide();
		$(".play").show();
	});
	
	$(".stop").on("click", function () {
		audioPlayer.currentTime = 0;
		audioPlayer.pause();
	});
	
	$(".prev").on("click", function () {
		$(".track-list li.active:not(:first-child)").removeClass("active")
				.prev().addClass("active").click();
	});
	
	$(".next").on("click", function () {
		$(".track-list li.active:not(:last-child)").removeClass("active")
				.next().addClass("active").click();
	});
	
	$(".volume-down").on("click", function () {
		audioPlayer.volume -= .1;
	});	
	$(".volume-up").on("click", function () {
		audioPlayer.volume += .1;
	});
	
	$(".progress").on("click", function (e) {
		var percent = (e.clientX - $(this).offset().left)  / $(this).width() * 100;
		audioPlayer.currentTime = percent * audioPlayer.duration / 100;
	});
	
	$(audioPlayer).on("pause", function () {
		$(".pause").hide();
		$(".play").show();
	});
	
	$(audioPlayer).on("play", function () {
		$(".play").hide();
		$(".pause").show();
	});
	
	$(audioPlayer).on("ended", function () {
		$(".track-list li.active:not(:last-child)").next().click();
	});
	
	//load first track
	$(audioPlayer).attr("src", $(".track-list li.active").data("url"));
	$(".cover").css({ "background-image" : "linear-gradient(to bottom, rgba(0, 0, 0, .75), rgba(0, 0, 0, 0)), url(" + $(".track-list li.active").data("cover") + ")" });
	
	(function animLoop() {
		RAF(animLoop);
		updatePlayer();
	})();
});
var Konami = function (callback) {
	var konami = {
		addEvent: function (obj, type, fn, ref_obj) {
			if (obj.addEventListener)
				obj.addEventListener(type, fn, false);
			else if (obj.attachEvent) {
				// IE
				obj["e" + type + fn] = fn;
				obj[type + fn] = function () {
					obj["e" + type + fn](window.event, ref_obj);
				}
				obj.attachEvent("on" + type, obj[type + fn]);
			}
		},
		input: "",
		pattern: "38384040373937396665",
		load: function (link) {
			this.addEvent(document, "keydown", function (e, ref_obj) {
				if (ref_obj) konami = ref_obj; // IE
				konami.input += e ? e.keyCode : event.keyCode;
				if (konami.input.length > konami.pattern.length)
					konami.input = konami.input.substr((konami.input.length - konami.pattern.length));
				if (konami.input == konami.pattern) {
					konami.code(link);
					konami.input = "";
					e.preventDefault();
					return false;
				}
			}, this);
			this.iphone.load(link);
		},
		code: function (link) {
			window.location = link
		},
		iphone: {
			start_x: 0,
			start_y: 0,
			stop_x: 0,
			stop_y: 0,
			tap: false,
			capture: false,
			orig_keys: "",
			keys: ["UP", "UP", "DOWN", "DOWN", "LEFT", "RIGHT", "LEFT", "RIGHT", "TAP", "TAP"],
			code: function (link) {
				konami.code(link);
			},
			load: function (link) {
				this.orig_keys = this.keys;
				konami.addEvent(document, "touchmove", function (e) {
					if (e.touches.length == 1 && konami.iphone.capture == true) {
						var touch = e.touches[0];
						konami.iphone.stop_x = touch.pageX;
						konami.iphone.stop_y = touch.pageY;
						konami.iphone.tap = false;
						konami.iphone.capture = false;
						konami.iphone.check_direction();
					}
				});
				konami.addEvent(document, "touchend", function (evt) {
					if (konami.iphone.tap == true) konami.iphone.check_direction(link);
				}, false);
				konami.addEvent(document, "touchstart", function (evt) {
					konami.iphone.start_x = evt.changedTouches[0].pageX;
					konami.iphone.start_y = evt.changedTouches[0].pageY;
					konami.iphone.tap = true;
					konami.iphone.capture = true;
				});
			},
			check_direction: function (link) {
				x_magnitude = Math.abs(this.start_x - this.stop_x);
				y_magnitude = Math.abs(this.start_y - this.stop_y);
				x = ((this.start_x - this.stop_x) < 0) ? "RIGHT" : "LEFT";
				y = ((this.start_y - this.stop_y) < 0) ? "DOWN" : "UP";
				result = (x_magnitude > y_magnitude) ? x : y;
				result = (this.tap == true) ? "TAP" : result;

				if (result == this.keys[0]) this.keys = this.keys.slice(1, this.keys.length);
				if (this.keys.length == 0) {
					this.keys = this.orig_keys;
					this.code(link);
				}
			}
		}
	}

	typeof callback === "string" && konami.load(callback);
	if (typeof callback === "function") {
		konami.code = callback;
		konami.load();
	}

	return konami;
};
