document.observe('firecheckout:saveBefore', function(e) {
    if (e.memo.forceSave) {
        return;
    }

    e.memo.stopFurtherProcessing = true;

    // make a request to standard controller to get bongo redirect form
    var url = checkout.urls.billing_address
        .replace(
            'firecheckout/index/saveBilling',
            'checkout/onepage/saveBilling'
        );
    checkout.update(url, {}, function (response) {
        try {
            response = response.responseText.evalJSON();
        } catch (e) {
            return;
        }

        if (!response.update_section) {
            return;
        }

        // prevent onecolumn mode logic with goto sections
        response.stopFurtherProcessing = true;

        if (response.update_section.html.indexOf("$('bongo_form_div').remove();") !== -1) {
            // response has a bongo form that we will submit shortly
            $(document.body).insert(
                '<div style="display:none">' + response.update_section.html + '</div>'
            );

            checkout.update(checkout.urls.shipping_method, {}, function (response) {
                response.stopFurtherProcessing = true;

                // redirect to bongointernational instead of order placing
                $('bongo_form').submit();
            });
        } else {
            // save order
            checkout.setLoadWaiting(false);
            checkout.save('', true);
        }
    });
});
