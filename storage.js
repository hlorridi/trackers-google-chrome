var storage = {

	set : function(key, value) {
		var object = new Object();
		object[key] = value;
		chrome.storage.local.set(object);
	},	
	
	sets : function(arrayOfObjects) {
		chrome.storage.local.set(arrayOfObjects);
	},

	get : function(key, callback) {
		chrome.storage.local.get(key.toString(), callback);
	},

	remove : function(key) {
		chrome.storage.local.remove(key.toString());
	}
};