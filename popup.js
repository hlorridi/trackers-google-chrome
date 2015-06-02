function displayTrackers() {
    chrome.tabs.getSelected(null, function(tab) {
        tabs.storage.restore(tab.id, function() {
            var track_list_node = document.getElementById('track_list');
            while (track_list_node.firstChild)
                track_list_node.removeChild(track_list_node.firstChild);
            var company_list = tabs.getCompanies(tab.id);
            for (i = 0; i < company_list.length; i++) {
                var li = document.createElement('li');
                li.innerText = company_list[i];
                document.getElementById('track_list').appendChild(li);
            }
            storage.get('client_country', function(datas) {
                var companyCount = company_list.length;
                if ("FR" == datas.client_country) {
                    var li = document.createElement('li');
                    li.innerHTML = "and The French Gourvernment too (<a href='http://www.assemblee-nationale.fr/14/ta/ta0511.asp' target='_blank' title='Read The Law adopted on Mai 5 2015'>law</a>)";
                    li.className = "country";
                    document.getElementById('track_list').appendChild(li);
                    companyCount++;
                }
                var title = ((companyCount == 1) ? '1 tracker' : (companyCount + ' trackers')) + " found";
                document.getElementById('counter').innerText = title;
            })
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    displayTrackers();
});