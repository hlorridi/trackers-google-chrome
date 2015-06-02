var tabs = {

    _prefix : '_tabs_',

    _tabs : [],

    _replacedTabsId : [],

    set : function(tabId, url, companies) {
        if (undefined === companies) companies = new Array();
        tabs._tabs[tabId] = {
            url : url,
            companies : companies
        };
        tabs.storage.save(tabId);
    },

    get : function(tabId) {
        return tabs._tabs[tabId];
    },

    getAll : function() {
        return tabs._tabs;
    },

    replace : function(newTabId, oldTabId) {
        tabs._replacedTabsId[oldTabId] = newTabId;
        tabs._tabs[newTabId] = tabs._tabs[oldTabId];
        tabs.storage.save(newTabId);
        // console.log('replace tabId : '+oldTabId);
        tabs.storage.remove(oldTabId);
    },

    remove : function(tabId) {
        tabs._tabs.splice(tabId, 1);
        var oldTabsId = tabs._replacedTabsId.indexOf(tabId);
        // console.log('remove tabId : '+tabId);
        tabs.storage.remove(tabId);
        if (-1 != oldTabsId) {
            tabs._replacedTabsId.splice(oldTabsId, 1);
        }
    },

    clear : function() {
        // console.log('clear all tabs');
        tabs.storage.removeAll();
        tabs._tabs = [];
    },

    executeIfExists : function(tabId, callback) {
        chrome.tabs.get(tabId, function(tabInfo) {
            callback(tabInfo);
        });
    },

    addCompany : function(tabId, company, callback) {
        // console.log('add company ' + company + ' to tab ' + tabId);
        // console.log(tabs._tabs[tabId]);
        if (undefined === tabs.get(tabId) && undefined === tabs._replacedTabsId[tabId]) {
            // console.log('init tab ' + tabId);
            chrome.tabs.get(tabId, function(tab) {
                if (chrome.runtime.lastError) {
                    // console.log('wtf ? oO');
                    // console.log(chrome.runtime.lastError.message);
                    // check if tab have been replaced
                    if(tabs._replacedTabsId[tabId]){
                        // console.log('seem to be replaced');
                        tabs.addCompany(tabId,company,callback);
                    }else{
                        // console.log('heu ok. Houston we have a problem ');
                    }
                } else {
                    tabs.set(tab.id, tab.url, [
                        company
                    ]);
                    callback(tabs.get(tab.id));
                }
            })
        } else {
            // console.log('tab ' + tabId + ' already initialized');
            if (undefined != tabs._replacedTabsId[tabId] && -1 == tabs._tabs[tabs._replacedTabsId[tabId]].companies.indexOf(company)) {
                // console.log('push company to new tab id '+tabs._replacedTabsId[tabId]+' (old : '+tabId+')');
                tabs._tabs[tabs._replacedTabsId[tabId]].companies.push(company);
                tabs.storage.save(tabs._replacedTabsId[tabId]);
                callback(tabs._tabs[tabs._replacedTabsId[tabId]]);
            } else if (-1 == tabs._tabs[tabId].companies.indexOf(company)) {
                // console.log('push company to tab id '+tabId);
                tabs._tabs[tabId].companies.push(company);
                tabs.storage.save(tabId);
                callback(tabs._tabs[tabId]);
            }
        }
    },

    getCompaniesCount : function(tabId) {
        return (tabs._tabs[tabId]) ? tabs._tabs[tabId].companies.length : 0;
    },

    getCompanies : function(tabId) {
        return (tabs._tabs[tabId]) ? tabs._tabs[tabId].companies : null;
    },

    handler : {
        onCreated : function(tab) {
            tabs.set(tab.id, tab.url);
        },
        onUpdated : function(details) {
            tabs.set(tab.id, tab.url);
        },
        onBefore : function(tabId, details) {
            if (!tabs.get(tabId)) {
                tabs.set(tabId, details.url)
            }

        },
        onCompleted : function(tabId, details) {
            tabs.set(tab.id, tab.url);
        },
        onRemoved : function(tabId, details) {
            tabs.remove(tabId);
            tabs.storage.remove(tabId);
        },
        onReplaced : function(newTabId, oldTabId) {
            tabs.replace(newTabId, oldTabId);
            tabs.storage.save(newTabId);
            tabs.storage.remove(oldTabId);
        }
    },

    storage : {

        save : function(tabId) {
            storage.set(tabs._prefix + tabId, tabs._tabs[tabId]);
            storage.set(tabs._prefix + 'list', Object.keys(tabs._tabs));
        },

        saveAll : function() {
            var _tab_list = object[tabs._prefix + 'list'];
            var _objects = [];
            tabs._tabs.forEach(function(e, i, a) {
                var _object = new Object();
                _object[tabs._prefix + i] = e;
                _objects.push(_object);
            });
            storage.sets(_objects);
        },

        restore : function(tabId, callback) {
            storage.get(tabs._prefix + tabId, function(object) {
                tabs._tabs[tabId] = object[tabs._prefix + tabId];
                callback();
            });
        },

        restoreAll : function() {
            storage.get(tabs._prefix + 'list', function(object) {
                var _tab_list = object[tabs._prefix + 'list'];
                for (tabId in _tab_list) {
                    storage.get(tabs._prefix + tabId, function(objectTab) {
                        tabs._tabs[tabId] = objectTab[tabs._prefix + tabId];
                    });
                }
            });

        },

        remove : function(tabId) {
            storage.remove(tabs._prefix + tabId);
            storage.set(tabs._prefix + 'list', Object.keys(tabs._tabs));
        },

        removeAll : function() {
            tabs._tabs.forEach(function(e, i, a) {
                storage.remove(tabs._prefix + tabId);
            });
        },

        purge : function() {

        }
    }
}