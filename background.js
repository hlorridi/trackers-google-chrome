chrome.storage.local.clear();
var client_country = null;
ajaxRequest("http://tools.ingenki.com/api/geoloc/", function(geoloc) {
    client_country = geoloc.country_code;
    storage.set('client_country', geoloc.country_code);
});

function checkTrackersFromHeaders(url, headers, tabId) {
    if (null == /ingenki.com/i.exec(url)) {
        headers.forEach(function(v, i, a) {
            var rgx = new RegExp("cookie", "i");
            var results = new Array();
            if (rgx.test(v.name)) {
                var domain_matches = /domain\=\.?([^;]+)\;/i.exec(v.value);
                if (domain_matches) {
                    var domain = getMainDomain(domain_matches[1]);
                } else {
                    var uriparse = parseUri(url);
                    var domain = uriparse.main_domain;
                }
                // console.log('bastard\'s cookie : '+domain);
                if (domain) {
                    // console.log('get company by domain '+domain);
                    companies.getByDomain(domain, function(company) {
                        if (company) {
                            // console.log('company found : ');
                            // console.log(company);
                            tabs.addCompany(tabId, company.name, function(tab) {
                                tabs.executeIfExists(tabId, function(tabInfo) {
                                    if (chrome.runtime.lastError) {
                                        // console.log(chrome.runtime.lastError.message);
                                    } else {
                                        var companiesCount = tabs.getCompaniesCount(tabInfo.id);
                                        if ('FR' == client_country) companiesCount++;
                                        var title = ((1 == companiesCount) ? '1 tracker' : companiesCount + ' trackers') + ' found';
                                        chrome.browserAction.setBadgeText({
                                            "text" : companiesCount.toString(),
                                            "tabId" : tabInfo.id
                                        });
                                        chrome.browserAction.setTitle({
                                            "title" : title,
                                            "tabId" : tabInfo.id
                                        });
                                    }
                                });
                            });
                        }else{
                            // console.log('no company found : '+domain);
                        }
                    });
                }else{
                    // console.log('no domain found : '+v.value+' - '+url);
                }
            }
        });
    }
}

chrome.tabs.onCreated.addListener(function(tab) {
    tabs.handler.onCreated(tab);
});
chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
    tabs.handler.onReplaced(addedTabId, removedTabId);
});
// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
// var storedTab = tabs.get(tabId);
// console.log('status : '+changeInfo.status);
// if(storedTab && undefined!=tab.url && tab.url!=storedTab.url){
// console.log('storedTab - tab url changed');
// tabs.remove(tabId);
// tabs.set(tabId, changeInfo.url, []);
// }
// });
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    tabs.handler.onRemoved(tabId, removeInfo);
});
chrome.webRequest.onHeadersReceived.addListener(function(details) {
    if (details.tabId >= 0 && null == /ingenki.com/i.exec(details.url)) {
        checkTrackersFromHeaders(details.url, details.responseHeaders, details.tabId);
    }
}, {
    urls : [
        "<all_urls>"
    ]
}, [
        "blocking", "responseHeaders"
]);
chrome.webRequest.onResponseStarted.addListener(function(details) {
    if (details.tabId >= 0 && null == /ingenki.com/i.exec(details.url)) {
        if(details.fromCache){
            // console.log('loaded data from cache');
            // console.log(details.responseHeaders);
        }
        checkTrackersFromHeaders(details.url, details.responseHeaders, details.tabId);
    }
}, {
    urls : [
        "<all_urls>"
    ]
}, [
        "responseHeaders"
]);
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
    if (details.tabId >= 0 && null == /ingenki.com/i.exec(details.url)) {
        if(details.fromCache){
            // console.log('loaded data from cache');
            // console.log(details.requestHeaders);
        }
        checkTrackersFromHeaders(details.url, details.requestHeaders, details.tabId);
    }
}, {
    urls : [
        "<all_urls>"
    ]
}, [
        "blocking", "requestHeaders"
]);
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
    if (0 == details.frameId) {
        tabs.remove(details.tabId);
    }
}, {
    urls : [
        "<all_urls>"
    ]
});
