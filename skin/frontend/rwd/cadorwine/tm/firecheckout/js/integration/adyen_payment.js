document.observe('firecheckout:setResponseAfter', function(e) {
    var response = e.memo.response;
    if (response.update_section && response.update_section['payment-method']) {
        if (typeof cseUpdate === 'function') {
            cseUpdate();
        }
    }
});
