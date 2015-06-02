function logError() {
    if (chrome.runtime.lastError) {
        // console.log(chrome.runtime.lastError.message);
    }
}

// Parse hostname and return main domain
function getMainDomain(domain) {
    var matches = /^(.*\.)?([a-z0-9\-]+)\.([a-z]{2,}|br\.com|us\.com|ar\.com|qc\.com|co\.com|us\.org|gb\.net|eu\.com|hu\.net|se\.com|uk\.com|me\.uk|co\.uk|de\.com|gr\.com|ru\.com|se\.net|uk\.net|gb\.com|org\.uk|ae\.org|in\.net|jp\.net|kr\.com|sa\.com|cn\.com|jpn\.com|za\.com)$/i.exec(domain);
    if (matches) return matches[2] + '.' + matches[3];
    return;
}

// Parse a URL. Based upon http://blog.stevenlevithan.com/archives/parseuri
// parseUri 1.2.2, (c) Steven Levithan <stevenlevithan.com>, MIT License
// Inputs: url: the URL you want to parse
// Outputs: object containing all parts of |url| as attributes
parseUri = function(url) {
    var matches = /^(([^:]+(?::|$))(?:(?:\w+:)?\/\/)?(?:[^:@\/]*(?::[^:@\/]*)?@)?(([^:\/?#]*)(?::(\d*))?))((?:[^?#\/]*\/)*[^?#]*)(\?[^#]*)?(\#.*)?/.exec(url);
    // The key values are identical to the JS location object values for that
    // key
    var keys = [
            "href", "origin", "protocol", "host", "hostname", "port", "pathname", "search", "hash"
    ];
    var uri = {};
    for (var i = 0; (matches && i < keys.length); i++)
        uri[keys[i]] = matches[i] || "";
    uri["main_domain"] = getMainDomain(uri["hostname"]);
    return uri;
};

function ajaxRequest(url, callback) {
    var _async = true;
    if (undefined === callback) {
        _async = false;
    }
    var r = new XMLHttpRequest();
    r.open("GET", url, _async);
    r.onreadystatechange = function() {
        if (r.readyState != 4 || (r.status != 200 && r.status != 302)) {
            return;
        }
        if (_async) {
            callback(JSON.parse(r.responseText));
        } else {
            return JSON.parse(r.responseText);
        }
    };
    r.onerror = function(err) {
        // console.log('AJAX ERROR');
        // console.log(err)
    };
    r.send();
}