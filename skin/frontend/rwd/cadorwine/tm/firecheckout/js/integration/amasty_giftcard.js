if (typeof showLoading === 'undefined') {
    function showLoading() {
        checkout.setLoadWaiting(true);
    }
}
if (typeof hideLoading === 'undefined') {
    function hideLoading() {
        checkout.setLoadWaiting(false);
    }
}
if (typeof ajaxUpdate === 'undefined') {
    function ajaxUpdate(url, callback, params) {
        callback = callback.wrap(function(o, response) {
            // amasty wait for parsed response in callback
            o(response.responseText.evalJSON());

            checkout.update(checkout.urls.shopping_cart);
        });
        checkout.update(url, params, callback);
    }
}
