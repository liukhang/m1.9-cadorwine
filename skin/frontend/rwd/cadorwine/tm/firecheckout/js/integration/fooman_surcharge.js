document.observe('dom:loaded', function(e) {
    // fix missing detailed taxvat row
    if ($$('.summary-total').length) {
        checkout.updateSections('review');
    }
});
document.observe('firecheckout:setResponseAfter', function(e) {
    if (e.memo.url !== checkout.urls.update_sections &&
        e.memo.response.update_section &&
        e.memo.response.update_section.review) {

        // fix missing detailed taxvat row
        if ($$('.summary-total').length) {
            checkout.updateSections('review');
        }
    }
});
