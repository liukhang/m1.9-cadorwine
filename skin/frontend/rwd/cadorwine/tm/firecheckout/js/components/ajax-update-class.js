var FC = FC || {};
FC.AjaxUpdateClass = {
    getClassNameByUrl: function (url) {
        return Object.keys(checkout.urls).find(function(key) {
            return checkout.urls[key] === url;
        });
    }
};

document.observe('firecheckout:updateBefore', function(e) {
    var section = FC.AjaxUpdateClass.getClassNameByUrl(e.memo.url);
    if (!section) {
        return;
    }

    $(document.body).addClassName('fc-update-' + section);
});

document.observe('firecheckout:updateAfter', function(e) {
    var section = FC.AjaxUpdateClass.getClassNameByUrl(e.memo.url);
    if (!section) {
        return;
    }

    $(document.body).removeClassName('fc-update-' + section);
});
