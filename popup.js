function checkCnty() {
	var is_french = false;
	var r = new XMLHttpRequest();
	r.open("GET", "http://ttserver.localhost/app_dev.php/api/geoloc/", true);
	r.onreadystatechange = function() {
		if (r.readyState != 4 || (r.status != 200))
			return;
		geoloc = JSON.parse(r.responseText);
		if ("FR" == geoloc.country_code) {
			var li = document.createElement('li');
			li.innerHTML = "<i>and The French Gourvernment too</i>";
			document.getElementById('track_list').appendChild(li);
		}
	};
	r.send();
}

function displayTrackers() {
	chrome.tabs.getSelected(null, function(tab) {
		chrome.storage.local.get(null, function(datas) {
			var track_list_node = document.getElementById('track_list');
			while (track_list_node.firstChild)
				track_list_node.removeChild(track_list_node.firstChild);
			var track_list = datas["cache_tabs_" + tab.id];
			for (i = 0; i < track_list.length; i++) {
				var li = document.createElement('li');
				li.innerText = track_list[i];
				document.getElementById('track_list').appendChild(li);
			}
			if (track_list.length > 1) {
				var title = track_list.length + " companies are tracking you";
			} else {
				var title = track_list.length + " company is tracking you";
			}
			document.getElementById('counter').innerText = title;
			checkCnty();
		});
	});
}

document.addEventListener('DOMContentLoaded', function() {
	displayTrackers();
});