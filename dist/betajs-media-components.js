/*!
betajs-media-components - v0.0.3 - 2015-12-11
Copyright (c) Oliver Friedmann
MIT Software License.
*/
/*!
betajs-scoped - v0.0.2 - 2015-07-08
Copyright (c) Oliver Friedmann
MIT Software License.
*/
var Scoped = (function () {
var Globals = {

	get : function(key) {
		if (typeof window !== "undefined")
			return window[key];
		if (typeof global !== "undefined")
			return global[key];
		return null;
	},

	set : function(key, value) {
		if (typeof window !== "undefined")
			window[key] = value;
		if (typeof global !== "undefined")
			global[key] = value;
		return value;
	},
	
	setPath: function (path, value) {
		var args = path.split(".");
		if (args.length == 1)
			return this.set(path, value);		
		var current = this.get(args[0]) || this.set(args[0], {});
		for (var i = 1; i < args.length - 1; ++i) {
			if (!(args[i] in current))
				current[args[i]] = {};
			current = current[args[i]];
		}
		current[args[args.length - 1]] = value;
		return value;
	},
	
	getPath: function (path) {
		var args = path.split(".");
		if (args.length == 1)
			return this.get(path);		
		var current = this.get(args[0]);
		for (var i = 1; i < args.length; ++i) {
			if (!current)
				return current;
			current = current[args[i]];
		}
		return current;
	}

};
var Helper = {
		
	method: function (obj, func) {
		return function () {
			return func.apply(obj, arguments);
		};
	},
	
	extend: function (base, overwrite) {
		base = base || {};
		overwrite = overwrite || {};
		for (var key in overwrite)
			base[key] = overwrite[key];
		return base;
	},
	
	typeOf: function (obj) {
		return Object.prototype.toString.call(obj) === '[object Array]' ? "array" : typeof obj;
	},
	
	isEmpty: function (obj) {
		if (obj === null || typeof obj === "undefined")
			return true;
		if (this.typeOf(obj) == "array")
			return obj.length === 0;
		if (typeof obj !== "object")
			return false;
		for (var key in obj)
			return false;
		return true;
	},
	
	matchArgs: function (args, pattern) {
		var i = 0;
		var result = {};
		for (var key in pattern) {
			if (pattern[key] === true || this.typeOf(args[i]) == pattern[key]) {
				result[key] = args[i];
				i++;
			} else if (this.typeOf(args[i]) == "undefined")
				i++;
		}
		return result;
	},
	
	stringify: function (value) {
		if (this.typeOf(value) == "function")
			return "" + value;
		return JSON.stringify(value);
	}	

};
var Attach = {
		
	__namespace: "Scoped",
	
	upgrade: function (namespace) {
		var current = Globals.get(namespace || Attach.__namespace);
		if (current && Helper.typeOf(current) == "object" && current.guid == this.guid && Helper.typeOf(current.version) == "string") {
			var my_version = this.version.split(".");
			var current_version = current.version.split(".");
			var newer = false;
			for (var i = 0; i < Math.min(my_version.length, current_version.length); ++i) {
				newer = parseInt(my_version[i], 10) > parseInt(current_version[i], 10);
				if (my_version[i] != current_version[i]) 
					break;
			}
			return newer ? this.attach(namespace) : current;				
		} else
			return this.attach(namespace);		
	},

	attach : function(namespace) {
		if (namespace)
			Attach.__namespace = namespace;
		var current = Globals.get(Attach.__namespace);
		if (current == this)
			return this;
		Attach.__revert = current;
		Globals.set(Attach.__namespace, this);
		return this;
	},
	
	detach: function (forceDetach) {
		if (forceDetach)
			Globals.set(Attach.__namespace, null);
		if (typeof Attach.__revert != "undefined")
			Globals.set(Attach.__namespace, Attach.__revert);
		delete Attach.__revert;
		return this;
	},
	
	exports: function (mod, object, forceExport) {
		mod = mod || (typeof module != "undefined" ? module : null);
		if (typeof mod == "object" && mod && "exports" in mod && (forceExport || mod.exports == this || !mod.exports || Helper.isEmpty(mod.exports)))
			mod.exports = object || this;
		return this;
	}	

};

function newNamespace (options) {
	
	options = Helper.extend({
		tree: false,
		global: false,
		root: {}
	}, options);
	
	function initNode(options) {
		return Helper.extend({
			route: null,
			parent: null,
			children: {},
			watchers: [],
			data: {},
			ready: false,
			lazy: []
		}, options);
	}
	
	var nsRoot = initNode({ready: true});
	
	var treeRoot = null;
	
	if (options.tree) {
		if (options.global) {
			try {
				if (window)
					treeRoot = window;
			} catch (e) { }
			try {
				if (global)
					treeRoot = global;
			} catch (e) { }
		} else
			treeRoot = options.root;
		nsRoot.data = treeRoot;
	}
	
	function nodeDigest(node) {
		if (node.ready)
			return;
		if (node.parent && !node.parent.ready) {
			nodeDigest(node.parent);
			return;
		}
		if (node.route in node.parent.data) {
			node.data = node.parent.data[node.route];
			node.ready = true;
			for (var i = 0; i < node.watchers.length; ++i)
				node.watchers[i].callback.call(node.watchers[i].context || this, node.data);
			node.watchers = [];
			for (var key in node.children)
				nodeDigest(node.children[key]);
		}
	}
	
	function nodeEnforce(node) {
		if (node.ready)
			return;
		if (node.parent && !node.parent.ready)
			nodeEnforce(node.parent);
		node.ready = true;
		if (options.tree && typeof node.parent.data == "object")
			node.parent.data[node.route] = node.data;
		for (var i = 0; i < node.watchers.length; ++i)
			node.watchers[i].callback.call(node.watchers[i].context || this, node.data);
		node.watchers = [];
	}
	
	function nodeSetData(node, value) {
		if (typeof value == "object") {
			for (var key in value) {
				node.data[key] = value[key];
				if (node.children[key])
					node.children[key].data = value[key];
			}
		} else
			node.data = value;
		nodeEnforce(node);
		for (var k in node.children)
			nodeDigest(node.children[k]);
	}
	
	function nodeClearData(node) {
		if (node.ready && node.data) {
			for (var key in node.data)
				delete node.data[key];
		}
	}
	
	function nodeNavigate(path) {
		if (!path)
			return nsRoot;
		var routes = path.split(".");
		var current = nsRoot;
		for (var i = 0; i < routes.length; ++i) {
			if (routes[i] in current.children)
				current = current.children[routes[i]];
			else {
				current.children[routes[i]] = initNode({
					parent: current,
					route: routes[i]
				});
				current = current.children[routes[i]];
				nodeDigest(current);
			}
		}
		return current;
	}
	
	function nodeAddWatcher(node, callback, context) {
		if (node.ready)
			callback.call(context || this, node.data);
		else {
			node.watchers.push({
				callback: callback,
				context: context
			});
			if (node.lazy.length > 0) {
				var f = function (node) {
					if (node.lazy.length > 0) {
						var lazy = node.lazy.shift();
						lazy.callback.call(lazy.context || this, node.data);
						f(node);
					}
				};
				f(node);
			}
		}
	}
	
	function nodeUnresolvedWatchers(node, base, result) {
		node = node || nsRoot;
		result = result || [];
		if (!node.ready)
			result.push(base);
		for (var k in node.children) {
			var c = node.children[k];
			var r = (base ? base + "." : "") + c.route;
			result = nodeUnresolvedWatchers(c, r, result);
		}
		return result;
	}

	return {
		
		extend: function (path, value) {
			nodeSetData(nodeNavigate(path), value);
		},
		
		set: function (path, value) {
			var node = nodeNavigate(path);
			if (node.data)
				nodeClearData(node);
			nodeSetData(node, value);
		},
		
		lazy: function (path, callback, context) {
			var node = nodeNavigate(path);
			if (node.ready)
				callback(context || this, node.data);
			else {
				node.lazy.push({
					callback: callback,
					context: context
				});
			}
		},
		
		digest: function (path) {
			nodeDigest(nodeNavigate(path));
		},
		
		obtain: function (path, callback, context) {
			nodeAddWatcher(nodeNavigate(path), callback, context);
		},
		
		unresolvedWatchers: function (path) {
			return nodeUnresolvedWatchers(nodeNavigate(path), path);
		}
		
	};
	
}
function newScope (parent, parentNamespace, rootNamespace, globalNamespace) {
	
	var self = this;
	var nextScope = null;
	var childScopes = [];
	var localNamespace = newNamespace({tree: true});
	var privateNamespace = newNamespace({tree: false});
	
	var bindings = {
		"global": {
			namespace: globalNamespace
		}, "root": {
			namespace: rootNamespace
		}, "local": {
			namespace: localNamespace
		}, "default": {
			namespace: privateNamespace
		}, "parent": {
			namespace: parentNamespace
		}, "scope": {
			namespace: localNamespace,
			readonly: false
		}
	};
	
	var custom = function (argmts, name, callback) {
		var args = Helper.matchArgs(argmts, {
			options: "object",
			namespaceLocator: true,
			dependencies: "array",
			hiddenDependencies: "array",
			callback: true,
			context: "object"
		});
		
		var options = Helper.extend({
			lazy: this.options.lazy
		}, args.options || {});
		
		var ns = this.resolve(args.namespaceLocator);
		
		var execute = function () {
			this.require(args.dependencies, args.hiddenDependencies, function () {
				arguments[arguments.length - 1].ns = ns;
				if (this.options.compile) {
					var params = [];
					for (var i = 0; i < argmts.length; ++i)
						params.push(Helper.stringify(argmts[i]));
					this.compiled += this.options.ident + "." + name + "(" + params.join(", ") + ");\n\n";
				}
				var result = args.callback.apply(args.context || this, arguments);
				callback.call(this, ns, result);
			}, this);
		};
		
		if (options.lazy)
			ns.namespace.lazy(ns.path, execute, this);
		else
			execute.apply(this);

		return this;
	};
	
	return {
		
		getGlobal: Helper.method(Globals, Globals.getPath),
		setGlobal: Helper.method(Globals, Globals.setPath),
		
		options: {
			lazy: false,
			ident: "Scoped",
			compile: false			
		},
		
		compiled: "",
		
		nextScope: function () {
			if (!nextScope)
				nextScope = newScope(this, localNamespace, rootNamespace, globalNamespace);
			return nextScope;
		},
		
		subScope: function () {
			var sub = this.nextScope();
			childScopes.push(sub);
			nextScope = null;
			return sub;
		},
		
		binding: function (alias, namespaceLocator, options) {
			if (!bindings[alias] || !bindings[alias].readonly) {
				var ns;
				if (Helper.typeOf(namespaceLocator) != "string") {
					ns = {
						namespace: newNamespace({
							tree: true,
							root: namespaceLocator
						}),
						path: null	
					};
				} else
					ns = this.resolve(namespaceLocator);
				bindings[alias] = Helper.extend(options, ns);
			}
			return this;
		},
		
		resolve: function (namespaceLocator) {
			var parts = namespaceLocator.split(":");
			if (parts.length == 1) {
				return {
					namespace: privateNamespace,
					path: parts[0]
				};
			} else {
				var binding = bindings[parts[0]];
				if (!binding)
					throw ("The namespace '" + parts[0] + "' has not been defined (yet).");
				return {
					namespace: binding.namespace,
					path : binding.path && parts[1] ? binding.path + "." + parts[1] : (binding.path || parts[1])
				};
			}
		},
		
		define: function () {
			return custom.call(this, arguments, "define", function (ns, result) {
				ns.namespace.set(ns.path, result);
			});
		},
		
		extend: function () {
			return custom.call(this, arguments, "extend", function (ns, result) {
				ns.namespace.extend(ns.path, result);
			});
		},
		
		condition: function () {
			return custom.call(this, arguments, "condition", function (ns, result) {
				if (result)
					ns.namespace.set(ns.path, result);
			});
		},
		
		require: function () {
			var args = Helper.matchArgs(arguments, {
				dependencies: "array",
				hiddenDependencies: "array",
				callback: "function",
				context: "object"
			});
			args.callback = args.callback || function () {};
			var dependencies = args.dependencies || [];
			var allDependencies = dependencies.concat(args.hiddenDependencies || []);
			var count = allDependencies.length;
			var deps = [];
			var environment = {};
			if (count) {
				var f = function (value) {
					if (this.i < deps.length)
						deps[this.i] = value;
					count--;
					if (count === 0) {
						deps.push(environment);
						args.callback.apply(args.context || this.ctx, deps);
					}
				};
				for (var i = 0; i < allDependencies.length; ++i) {
					var ns = this.resolve(allDependencies[i]);
					if (i < dependencies.length)
						deps.push(null);
					ns.namespace.obtain(ns.path, f, {
						ctx: this,
						i: i
					});
				}
			} else {
				deps.push(environment);
				args.callback.apply(args.context || this, deps);
			}
			return this;
		},
		
		digest: function (namespaceLocator) {
			var ns = this.resolve(namespaceLocator);
			ns.namespace.digest(ns.path);
			return this;
		},
		
		unresolved: function (namespaceLocator) {
			var ns = this.resolve(namespaceLocator);
			return ns.namespace.unresolvedWatchers(ns.path);
		}
		
	};
	
}
var globalNamespace = newNamespace({tree: true, global: true});
var rootNamespace = newNamespace({tree: true});
var rootScope = newScope(null, rootNamespace, rootNamespace, globalNamespace);

var Public = Helper.extend(rootScope, {
		
	guid: "4b6878ee-cb6a-46b3-94ac-27d91f58d666",
	version: '9.9436392609879',
		
	upgrade: Attach.upgrade,
	attach: Attach.attach,
	detach: Attach.detach,
	exports: Attach.exports
	
});

Public = Public.upgrade();
Public.exports();
	return Public;
}).call(this);

/*!
betajs-media-components - v0.0.3 - 2015-12-11
Copyright (c) Oliver Friedmann
MIT Software License.
*/
(function () {

var Scoped = this.subScope();

Scoped.binding("module", "global:BetaJS.MediaComponents");
Scoped.binding("base", "global:BetaJS");

Scoped.binding("jquery", "global:jQuery");

Scoped.define("module:", function () {
	return {
		guid: "7a20804e-be62-4982-91c6-98eb096d2e70",
		version: '10.1449878958998'
	};
});

BetaJS = BetaJS || {};
BetaJS.MediaComponents = BetaJS.MediaComponents || {};
BetaJS.MediaComponents.Templates = BetaJS.MediaComponents.Templates || {};
BetaJS.MediaComponents.Templates.controlbar = ' <div class="{{css}}-dashboard {{activitydelta > 5000 ? (css + \'-dashboard-hidden\') : \'\'}}">  <div class="{{css}}-progressbar {{activitydelta < 2500 || ismobile ? \'\' : (css + \'-progressbar-small\')}}"       onmousedown="{{startUpdatePosition(domEvent)}}"       onmouseup="{{stopUpdatePosition(domEvent)}}"       onmouseleave="{{stopUpdatePosition(domEvent)}}"       onmousemove="{{progressUpdatePosition(domEvent)}}">   <div class="{{css}}-progressbar-cache" ba-styles="{{{width: Math.round(duration ? cached / duration * 100 : 0) + \'%\'}}}"></div>   <div class="{{css}}-progressbar-position" ba-styles="{{{width: Math.round(duration ? position / duration * 100 : 0) + \'%\'}}}" title="{{string(\'video-progress\')}}">    <div class="{{css}}-progressbar-button"></div>   </div>  </div>  <div class="{{css}}-backbar"></div>  <div class="{{css}}-controlbar">         <div class="{{css}}-leftbutton-container" ba-if="{{rerecordable}}">             <div class="{{css}}-button-inner" ba-click="rerecord()" title="{{string(\'rerecord-video\')}">                 <i class="{{css}}-icon-ccw"></i>             </div>         </div>   <div class="{{css}}-leftbutton-container">    <div class="{{css}}-button-inner" ba-show="{{!playing}}" ba-click="play()" title="{{string(\'play-video\')}}">     <i class="{{css}}-icon-play"></i>    </div>             <div class="{{css}}-button-inner" ba-show="{{playing}}" ba-click="pause()" title="{{string(\'pause-video\')}}">                 <i class="{{css}}-icon-pause"></i>             </div>   </div>   <div class="{{css}}-time-container">    <div class="{{css}}-time-value" title="{{string(\'elapsed-time\')}}">{{position_formatted}}</div>    <div class="{{css}}-time-sep">/</div>    <div class="{{css}}-time-value" title="{{string(\'total-time\')}}">{{duration_formatted}}</div>   </div>   <div class="{{css}}-rightbutton-container" ba-if="{{fullscreen}}">    <div class="{{css}}-button-inner" ba-click="toggle_fullscreen()" title="{{string(\'fullscreen-video\')}}">     <i class="{{css}}-icon-resize-full"></i>    </div>   </div>   <div class="{{css}}-volumebar">    <div class="{{css}}-volumebar-inner"         onmousedown="{{startUpdateVolume(domEvent)}}"                  onmouseup="{{stopUpdateVolume(domEvent)}}"                  onmouseleave="{{stopUpdateVolume(domEvent)}}"                  onmousemove="{{progressUpdateVolume(domEvent)}}">     <div class="{{css}}-volumebar-position" ba-styles="{{{width: Math.min(100, Math.round(volume * 100)) + \'%\'}}}">         <div class="{{css}}-volumebar-button" title="{{string(\'volume-button\')}}"></div>     </div>        </div>   </div>   <div class="{{css}}-rightbutton-container">    <div class="{{css}}-button-inner" ba-click="toggle_volume()" title="{{string(volume > 0 ? \'volume-mute\' : \'volume-unmute\')}}">     <i class="{{css + \'-icon-volume-\' + (volume >= 0.5 ? \'up\' : (volume > 0 ? \'down\' : \'off\')) }}"></i>    </div>   </div>  </div> </div> ';

BetaJS.MediaComponents.Templates.loader = ' <div class="{{css}}-loader-container">     <div class="{{css}}-loader-loader" title="{{string(\'tooltip\')}}">     </div> </div>';

BetaJS.MediaComponents.Templates.message = ' <div class="{{css}}-message-container" ba-click="click()">     <div class=\'{{css}}-message-message\'>         {{message}}     </div> </div>';

BetaJS.MediaComponents.Templates.playbutton = ' <div class="{{css}}-playbutton-container">  <div class="{{css}}-playbutton-button" ba-click="play()" title="{{string(\'tooltip\')}}"></div> </div> ';

BetaJS.MediaComponents.Templates.player = ' <div     class="{{css}}-container {{css}}-{{ie8 ? \'ie8\' : \'noie8\'}}"     ba-on:mousemove="user_activity()"     ba-on:mousedown="user_activity()"     ba-on:touchstart="user_activity()" >     <video class="{{css}}-video"></video>     <div class=\'{{css}}-overlay\'>              <ba-{{dyncontrolbar}}             ba-css="{{css}}"             ba-template="{{tmplcontrolbar}}"             ba-show="{{state===\'main\'}}"             ba-playing="{{playing}}"             ba-event:rerecord="rerecord"             ba-event:play="play"             ba-event:pause="pause"             ba-event:position="seek"             ba-event:volume="set_volume"             ba-event:fullscreen="toggle_fullscreen"             ba-volume="{{volume}}"             ba-duration="{{duration}}"             ba-cached="{{buffered}}"             ba-position="{{position}}"             ba-activitydelta="{{activity_delta}}"             ba-rerecordable="{{rerecordable}}"             ba-fullscreen="{{fullscreensupport}}"         ></ba-{{dyncontrolbar}}>                  <ba-{{dynplaybutton}}             ba-css="{{css}}"             ba-template="{{tmplplaybutton}}"             ba-show="{{state===\'init\'}}"             ba-event:play="load"         ></ba-{{dynplaybutton}}>                  <ba-{{dynloader}}             ba-css="{{css}}"             ba-template="{{tmplloader}}"             ba-show="{{state===\'loading\' || buffering}}"         ></ba-{{dynloader}}>                  <ba-{{dynmessage}}             ba-css="{{css}}"             ba-template="{{tmplmessage}}"             ba-show="{{state===\'message\'}}"             ba-message="{{message}}"         ></ba-{{dynmessage}}>     </div> </div> ';

Scoped.require(["module:Assets"], function (Assets) {
	Assets.strings.register({
		"ba-videoplayer-playbutton.tooltip": "Hier clicken um Wiedergabe zu starten.",
		"ba-videoplayer-loader.tooltip": "Video wird geladen...",
    	"ba-videoplayer-controlbar.video-progress": "Videofortschritt",
    	"ba-videoplayer-controlbar.rerecord-video": "Video erneut aufnehmen?",
    	"ba-videoplayer-controlbar.play-video": "Video wiedergeben",
    	"ba-videoplayer-controlbar.pause-video": "Video pausieren",
    	"ba-videoplayer-controlbar.elapsed-time": "Vergangene Zeit",
    	"ba-videoplayer-controlbar.total-time": "L&auml;nge des Videos",
    	"ba-videoplayer-controlbar.fullscreen-video": "Vollbildmodus",
    	"ba-videoplayer-controlbar.volume-button": "Lautst&auml;rke regulieren",
    	"ba-videoplayer-controlbar.volume-mute": "Ton abstellen",
    	"ba-videoplayer-controlbar.volume-unmute": "Ton wieder einstellen"
	}, ["language:de"]);
});


Scoped.define("module:VideoPlayer.Dynamics.Controlbar", [
    "base:Dynamics.Dynamic",
    "base:Time",
    "module:Templates",
    "jquery:",
    "module:Assets",
    "base:Browser.Info"
], function (Class, Time, Templates, $, Assets, Info, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			template: Templates.controlbar,
			
			attrs: {
				"css": "ba-videoplayer",
				"duration": 0,
				"position": 0,
				"cached": 0,
				"volume": 1.0,
				"expandedprogress": true,
				"playing": false,
				"rerecordable": false,
				"fullscreen": true,
				"activitydelta": 0
			},
			
			functions: {
				
				startUpdatePosition: function (event) {
					event[0].preventDefault();
					this.set("_updatePosition", true);
					this.call("progressUpdatePosition", event);
				},
				
				progressUpdatePosition: function (event) {
					event[0].preventDefault();
					if (!this.get("_updatePosition"))
						return;
					this.set("position", this.get("duration") * (event[0].clientX - $(event[0].currentTarget).offset().left) / $(event[0].currentTarget).width());
					this.trigger("position", this.get("position"));
				},
				
				stopUpdatePosition: function (event) {
					event[0].preventDefault();
					this.set("_updatePosition", false);
				},
				
				startUpdateVolume: function (event) {
					event[0].preventDefault();
					this.set("_updateVolume", true);
					this.call("progressUpdateVolume", event);
				},
				
				progressUpdateVolume: function (event) {
					event[0].preventDefault();
					if (!this.get("_updateVolume"))
						return;
					this.set("volume", (event[0].clientX - $(event[0].currentTarget).offset().left) / $(event[0].currentTarget).width());
					this.trigger("volume", this.get("volume"));
				},
				
				stopUpdateVolume: function (event) {
					event[0].preventDefault();
					this.set("_updateVolume", false);
				},

				play: function () {
					this.trigger("play");
				},
				
				pause: function () {
					this.trigger("pause");
				},
				
				toggle_volume: function () {
					if (this.get("volume") > 0) {
						this.__oldVolume = this.get("volume");
						this.set("volume", 0);
					} else 
						this.set("volume", this.__oldVolume || 1);
					this.trigger("volume", this.get("volume"));
				},
				
				toggle_fullscreen: function () {
					this.trigger("fullscreen");
				},
				
				rerecord: function () {
					this.trigger("rerecord");
				}
				
			},
			
			create: function () {
				this.properties().compute("position_formatted", function () {
					return Time.formatTime(this.get("position") * 1000, "mm:ss");
				}, ['position']);
				this.properties().compute("duration_formatted", function () {
					return Time.formatTime(this.get("duration") * 1000, "mm:ss");
				}, ['duration']);
				this.set("ismobile", Info.isMobile());
			}
			
		};
	})
	.register("ba-videoplayer-controlbar")
    .attachStringTable(Assets.strings)
    .addStrings({
    	"video-progress": "Video progress",
    	"rerecord-video": "Re-record video?",
    	"play-video": "Play video",
    	"pause-video": "Pause video",
    	"elapsed-time": "Elasped time",
    	"total-time": "Total length of video",
    	"fullscreen-video": "Enter fullscreen",
    	"volume-button": "Set volume",
    	"volume-mute": "Mute sound",
    	"volume-unmute": "Unmute sound"
    });
});
Scoped.define("module:VideoPlayer.Dynamics.Loader", [
    "base:Dynamics.Dynamic",
    "module:Templates",
    "module:Assets"
], function (Class, Templates, Assets, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			template: Templates.loader,
			
			attrs: {
				"css": "ba-videoplayer"
			}
			
		};
	})
	.register("ba-videoplayer-loader")
    .attachStringTable(Assets.strings)
    .addStrings({
    	"tooltip": "Loading video..."
    });
});
Scoped.define("module:VideoPlayer.Dynamics.Message", [
    "base:Dynamics.Dynamic",
    "module:Templates"
], function (Class, Templates, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			template: Templates.message,
			
			attrs: {
				"css": "ba-videoplayer",
				"message": ''
			},
			
			functions: {
				
				click: function () {
					alert("click");
				}
				
			}
			
		};
	}).register("ba-videoplayer-message");
});
Scoped.define("module:VideoPlayer.Dynamics.Playbutton", [
    "base:Dynamics.Dynamic",
    "module:Templates",
    "module:Assets"
], function (Class, Templates, Assets, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			template: Templates.playbutton,
			
			attrs: {
				"css": "ba-videoplayer"
			},
			
			functions: {
				
				play: function () {
					this.trigger("play");
				}
				
			}
			
		};
	})
	.register("ba-videoplayer-playbutton")
    .attachStringTable(Assets.strings)
    .addStrings({
    	"tooltip": "Click to play video."
    });
});
Scoped.define("module:VideoPlayer.Dynamics.Player", [
    "base:Dynamics.Dynamic",
    "module:Templates",
    "module:Assets",
    "base:Browser.Info",
    "base:Media.Player.VideoPlayerWrapper",
    "base:Types",
    "base:Objs",
    "base:Strings",
    "base:Time",
    "base:Timers"
], function (Class, Templates, Assets, Info, VideoPlayerWrapper, Types, Objs, Strings, Time, Timers, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			template: Templates.player,
			
			attrs: {
				"css": "ba-videoplayer",
				"dynplaybutton": "videoplayer-playbutton",
				"tmplplaybutton": "",
				"dynloader": "videoplayer-loader",
				"tmplloader": "",
				"dynmessage": "videoplayer-message",
				"tmplmessage": "",
				"dyncontrolbar": "videoplayer-controlbar",
				"tmplcontrolbar": "",
				"poster": "",
				"source": "",
				"sources": [],
				"forceflash": false,
				"rerecordable": false,
				"theme": ""
			},
			
			create: function () {
				if (this.get("theme") in Assets.themes)
					this.setAll(Assets.themes[this.get("theme")]);
				
				this._timer = this.auto_destroy(new Timers.Timer({
					context: this,
					fire: this._timerFire,
					delay: 100,
					start: true
				}));
				this.set("ie8", Info.isInternetExplorer() && Info.internetExplorerVersion() < 9);
				
				this.set("message", "");
				this.set("state", "init");
				this.set("playing", false);
				this.set("loaded", false);
				this.set("duration", 0.0);
				this.set("position", 0.0);
				this.set("buffered", 0.0);
				this.set("last_activity", Time.now());
				this.set("volume", 1.0);
				
				this.properties().compute("buffering", function () {
					return this.get("buffered") < this.get("position");
				}, ["buffered", "position"]);
			},
			
			_afterActivate: function () {
				var video = this.element().find("video").get(0);
				VideoPlayerWrapper.create({
			    	element: video,
			    	poster: this.get("poster"),
			    	source: this.get("source"),
			    	sources: this.get("sources"),
			    	forceflash: !!this.get("forceflash"),
			    	preload: true
			    }).error(function () {
			    	
			    	// TODO
			    	
			    }, this).success(function (instance) {
			    	
			    	this.player = this.auto_destroy(instance);			    	
					this.set("loaded", this.player.loaded());
					// TODO loaded
					// TODO error
					this.player.on("loaded", this._eventLoaded, this);
					if (this.player.loaded())
						this._eventLoaded();
					this.player.on("playing", this._eventPlaying, this);
					this.player.on("paused", this._eventPaused, this);
					this.player.on("ended", this._eventEnded, this);
			    }, this);
			},
			
			functions: {
				
				load: function () {
					this._methodLoad();
				},
				
				play: function () {
					this._methodPlay();
				},
				
				rerecord: function () {
					this._methodRerecord();
				},
				
				pause: function () {
					this._methodPause();
				},
				
				seek: function (position) {
					this._methodSeek(position);
				},
				
				user_activity: function () {
					this.set("last_activity", Time.now());
					this.set("activity_delta", 0);
				},
				
				set_volume: function (volume) {
					this._methodSetVolume(volume);
				},
				
				toggle_fullscreen: function () {
					this.player.enterFullscreen();
				}
			
			},
			
			_methodLoad: function () {
				if (this.get("state") === "init") {
					if (this.get("loaded")) {
						this.set("state", "main");
						this.player.play();
					} else {
						this.set("state", "loading");
						this.player.play();
					}
				}
			},
			
			_methodPlay: function () {
				if (this.get("state") === "main") {
					this.player.play();
				}
			},
			
			_methodPause: function () {
				if (this.get("state") === "main") {
					this.player.pause();
				}
			},

			_methodRerecord: function () {
				if (!this.get("rerecordable"))
					return;
				this.trigger("rerecord");
			},
			
			_methodSeek: function (position) {
				this.player.setPosition(position);
				this.trigger("seek", position);
			},
			
			_methodSetVolume: function (volume) {
				volume = Math.min(1.0, volume);
				this.set("volume", volume);
				this.player.setVolume(volume);
				this.player.setMuted(volume <= 0);
			},
			
			_eventLoaded: function () {
				this.set("loaded", true);
				this.set("duration", this.player.duration());
				this.set("fullscreensupport", this.player.supportsFullscreen());
				if (this.get("state") === "loading")
					this.set("state", "main");
				this.trigger("loaded");
			},
			
			_eventPlaying: function () {
				this.set("playing", true);
				this.trigger("playing");
			},
			
			_eventPaused: function () {
				this.set("playing", false);
				this.trigger("paused");
			},

			_eventEnded: function () {
				this.set("playing", false);
				this.trigger("ended");
				this.set("state", "init");
			},
			
			_timerFire: function () {
				if (this.get("state") === "main") {
					this.set("activity_delta", Time.now() - this.get("last_activity"));
					this.set("position", this.player.position());
					this.set("buffered", this.player.buffered());
					this.set("duration", this.player.duration());
				}
			}
			
		};
	}).register("ba-videoplayer");
});
Scoped.define("module:Assets", [
    "base:Classes.LocaleTable",
    "base:Browser.Info"
], function (LocaleTable, Info) {
	
	var strings = new LocaleTable();
	strings.setWeakLocale(Info.language());
	
	return {
		
		strings: strings,
		
		themes: {}
		
	};
});
}).call(Scoped);