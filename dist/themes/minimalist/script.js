/*!
betajs-media-components - v0.0.41 - 2017-01-03
Copyright (c) Ziggeo,Oliver Friedmann
Apache-2.0 Software License.
*/
(function () {

var Scoped = this.subScope();

Scoped.binding("browser", "global:BetaJS.Browser");
Scoped.binding("module", "global:BetaJS.MediaComponents");

Scoped.extend('module:Templates', function () {
return {"minimalist-video_player_controlbar":"<div class=\"{{css}}-dashboard {{activitydelta > 5000 && hideoninactivity ? (css + '-dashboard-hidden') : ''}}\">      <div class='{{css}}-controlbar-header'>         <div class=\"{{css}}-controlbar-header-icons-block\">              <div class=\"{{css}}-right-block\">                  <div class=\"{{css}}-button-container\"  ba-click=\"toggle_fullscreen()\" title=\"{{string('fullscreen-video')}}\">                     <div class=\"{{css}}-button-inner {{css}}-full-screen-btn-inner\">                         <i class=\"{{css}}-icon-resize-full\"></i>                     </div>                 </div>                  <div class=\"{{css}}-button-container\" ba-click=\"toggle_volume()\" title=\"{{string(volume > 0 ? 'volume-mute' : 'volume-unmute')}}\">                     <div class=\"{{css}}-button-inner\">                         <i class=\"{{css + '-icon-volume-' + (volume >= 0.5 ? 'up' : (volume > 0 ? 'down' : 'off')) }}\"></i>                     </div>                 </div>              </div>          </div>          <div class=\"{{css}}-controlbar-header-title-block\" ba-if=\"{{title}}\">             <div class=\"{{css}}-title\"><h4>{{title}}</h4></div>         </div>     </div>      <div class=\"{{css}}-controlbar-footer\">          <div class=\"{{css}}-controlbar-top-block\">              <div class=\"{{css}}-button-container\" ba-if=\"{{submittable}}\"  ba-click=\"submit()\">                 <div class=\"{{css}}-button-inner\">                     {{string('submit-video')}}                 </div>             </div>              <div class=\"{{css}}-button-container\" ba-if=\"{{rerecordable}}\" ba-click=\"rerecord()\" title=\"{{string('rerecord-video')}}\">                 <div class=\"{{css}}-button-inner\">                     <i class=\"{{css}}-icon-ccw\"></i>                 </div>             </div>              <div class=\"{{css}}-button-container\" ba-if=\"{{!playing}}\" ba-click=\"play()\" title=\"{{string('play-video')}}\">                 <div class=\"{{css}}-button-inner\">                     <i class=\"{{css}}-icon-play\"></i>                 </div>             </div>              <div class=\"{{css}}-button-container\" ba-if=\"{{playing}}\" ba-click=\"pause()\" title=\"{{string('pause-video')}}\">                 <div class=\"{{css}}-button-inner\">                     <i class=\"{{css}}-icon-pause\"></i>                 </div>             </div>          </div>         <div class=\"{{css}}-controlbar-middle-block\">              <div class=\"{{css}}-progressbar\">                 <div class=\"{{css}}-progressbar-inner\"                      onmousedown=\"{{startUpdatePosition(domEvent)}}\"                      onmouseup=\"{{stopUpdatePosition(domEvent)}}\"                      onmouseleave=\"{{stopUpdatePosition(domEvent)}}\"                      onmousemove=\"{{progressUpdatePosition(domEvent)}}\">                      <div class=\"{{css}}-progressbar-cache\" ba-styles=\"{{{width: Math.round(duration ? cached / duration * 100 : 0) + '%'}}}\"></div>                     <div class=\"{{css}}-progressbar-position\" ba-styles=\"{{{width: Math.round(duration ? position / duration * 100 : 0) + '%'}}}\" title=\"{{string('video-progress')}}\">                         <div class=\"{{css}}-progressbar-button\"></div>                     </div>                 </div>             </div>          </div>         <div class=\"{{css}}-controlbar-bottom-block\">              <div class=\"{{css}}-button-container {{css}}-time-container\">                 <div class=\"{{css}}-time-value\" title=\"{{string('elapsed-time')}}\">{{formatTime(position)}}</div>                 <p> / </p>                 <div class=\"{{css}}-time-value\" title=\"{{string('elapsed-time')}}\">{{formatTime(duration || position)}}</div>             </div>              <div class=\"{{css}}-button-container\" ba-if=\"{{streams.length > 1 && currentstream}}\" ba-click=\"toggle_stream()\" title=\"{{string('change-resolution')}}\">                 <div class=\"{{css}}-button-inner {{css}}-stream-label-container\">                     <span class=\"{{css}}-button-text {{css}}-stream-label\">{{currentstream_label}}</span>                 </div>             </div>         </div>     </div>  </div> "};
});
Scoped.extend("module:Assets.playerthemes", [
    "module:Templates",
    "browser:Info"
], function (Templates, Info) {
	var ie8 = Info.isInternetExplorer() && Info.internetExplorerVersion() <= 8;
	return {
		"minimalist": {
			css: "ba-videoplayer-minimalist-theme",
			csstheme: "ba-videoplayer-minimalist-theme",
			tmplcontrolbar: Templates["minimalist-video_player_controlbar"],
			cssloader: ie8 ? "ba-videoplayer" : "",
			cssmessage: "ba-videoplayer",
			cssplaybutton: ie8 ? "ba-videoplayer" : ""
		}
	};
});

Scoped.extend("module:Assets.recorderthemes", [ "module:Templates" ], function(
		Templates) {
	return {
		"minimalist" : {
			css : "ba-videorecorder-theme-minimalist",
			cssmessage : "ba-videorecorder",
			tmpltopmessage : Templates["minimalist-video_recorder_topmessage"],
			tmplcontrolbar : Templates["minimalist-video_recorder_controlbar"],
			tmplimagegallery : Templates["minimalist-recorder_imagegallery"],
			cssloader: "ba-videorecorder",
			tmplmessage : Templates["minimalist-video_recorder_message"]
		}
	};
});

}).call(Scoped);