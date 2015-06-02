var companies = {

    _companies : [],

    _domains : [],

    set : function(name, domain) {
        var _i = companies._companies.indexOf(name);
        if (-1 == _i) {
            companies._companies.push(name);
            companies._domains.push(domain);
        } else if (undefined != domain && null != domain && "" != domain) {
            companies._domains[_i] = domain;
        }
    },

    get : function(name) {
        var _i = companies._companies.indexOf(name);
        if (-1 != _i) {
            return {
                name : name,
                domain : companies._domains[_i]
            };
        }
    },

    getByDomain : function(domain, callBack) {
        var _i = companies._domains.indexOf(domain);
        if (-1 == _i) {
            if (!domain.match(/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+([a-zA-Z]{2,6}|br\.com|us\.com|ar\.com|qc\.com|co\.com|us\.org|gb\.net|eu\.com|hu\.net|se\.com|uk\.com|me\.uk|co\.uk|de\.com|gr\.com|ru\.com|se\.net|uk\.net|gb\.com|org\.uk|ae\.org|in\.net|jp\.net|kr\.com|sa\.com|cn\.com|jpn\.com|za\.com)$/)) {
                // console.log('domain no match :'+domain);
                return;
            }
            // console.log('ajax request');
            ajaxRequest("http://tools.ingenki.com/api/whois/?domain=" + domain, function(whois) {
                if (whois && whois.Organization) {
                    companies.set(whois.Organization.trim(), domain);
                    // console.log('run ajax callback ');
                    callBack({
                        name : whois.Organization.trim(),
                        domain : domain
                    });
                }
            });
            return;
        } else {
            // console.log('run callback');
            callBack({
                name : companies._companies[_i],
                domain : domain
            });
        }
    }

};