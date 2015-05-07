var cache_domains = new Array();
var cache_companies = new Array();
var cache_tabs = new Array();
var currentTabId = null;
var tabIdChanges = new Array();

chrome.storage.local.clear();

chrome.tabs.getSelected(null, function(tab) {
	currentTabId = tab.id;
});

function getCurrentTabsTrackers() {
	return cache_tabs[tab.id];
}

function resetCacheTabs(tabId) {
	cache_tabs[tabId] = new Array();
	chrome.storage.local.remove('cache_tabs_' + tabId);
}

function whois(domain, callback) {
	var r = new XMLHttpRequest();
	r.open("GET", "http://ttserver.localhost/app_dev.php/api/whois/?domain="
			+ domain, true);
	r.onreadystatechange = function() {
		if (r.readyState != 4 || (r.status != 200 && r.status != 302))
			return;
		callback(JSON.parse(r.responseText));
	};
	r.send();
}

function getCompanyFromWhois(jsonwhois) {
	return jsonwhois.Organization;
}

function storeCompanyFromDomain(domain, tabId) {
	var domain_index = cache_domains.indexOf(domain);
	if (-1 == domain_index) {
		whois(
				domain,
				function(jsonwhois) {
					var company = getCompanyFromWhois(jsonwhois);
					if (company) {
						cache_companies.push(company);
						cache_domains.push(domain);
						if (undefined === cache_tabs[tabId]) {
							cache_tabs[tabId] = new Array();
						}
						if (-1 == cache_tabs[tabId].indexOf(company)) {
							cache_tabs[tabId].push(company);
							var companiesCount = cache_tabs[tabId].length;
							if (companiesCount > 1) {
								var title = companiesCount
										+ " companies are tracking you";
							} else {
								var title = companiesCount
										+ " company is tracking you";
							}
							if (tabIdChanges[tabId]) {
								var titleTabId = tabIdChanges[tabId];
							} else {
								var titleTabId = tabId;
							}
							chrome.pageAction.setTitle({
								"title" : title,
								"tabId" : titleTabId
							});
							var tabs_trackers = new Object();
							tabs_trackers['cache_tabs_' + tabId] = cache_tabs[tabId];
							storeCache(tabs_trackers);
						}
					}
				});
	}
}

function storeCache(datas) {
	chrome.storage.local.set(datas);
}

function storeCompanyFromHeaders(url, headers, tabId) {
	headers.forEach(function(v, i, a) {
		var rgx = new RegExp("cookie", "i");
		var results = new Array();
		if (rgx.test(v.name)) {
			var domain_matches = /domain\=(.+\.)?([^\;\.]+\.[^\;\.]+)\;/i
					.exec(v.value);
			if (null != domain_matches && domain_matches.length == 2) {
				var domain = domain_matches[1];
				storeCompanyFromDomain(domain, tabId);
			} else {
				var domain_matches = /\:\/\/(.+\.)?([^\/\.]+\.[^\/\.]+)\//i
						.exec(url);
				if (null != domain_matches && domain_matches.length == 3) {
					var domain = domain_matches[2];
					storeCompanyFromDomain(domain, tabId);
				}
			}
		}
	});
}

function processDetails(url, headers, tabId) {
	if (null == /ttserver\.localhost/i.exec(url)) {
		storeCompanyFromHeaders(url, headers, tabId);
	}
}
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	resetCacheTabs(tabId);
});
chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
	tabIdChanges[removedTabId] = addedTabId;
	chrome.storage.local.get('cache_tabs_' + removedTabId, function(
			old_tabs_trackers) {
		var tabs_trackers = new Object();
		tabs_trackers['cache_tabs_' + addedTabId] = old_tabs_trackers;
		storeCache(tabs_trackers);
	});
	resetCacheTabs(removedTabId);
	chrome.pageAction.show(addedTabId);
});
chrome.tabs.onActivated.addListener(function(tabInfo) {
	chrome.pageAction.show(tabInfo.tabId);
	resetCacheTabs(tabInfo.tabId);
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	chrome.pageAction.show(tabId);
});
chrome.webRequest.onHeadersReceived.addListener(function(details) {
	if (details.tabId >= 0) {
		processDetails(details.url, details.responseHeaders, details.tabId);
	}
}, {
	urls : [ "<all_urls>" ]
}, [ "responseHeaders" ]);
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
	if (details.tabId >= 0) {
		processDetails(details.url, details.requestHeaders, details.tabId);
	}
}, {
	urls : [ "<all_urls>" ]
}, [ "requestHeaders" ]);
