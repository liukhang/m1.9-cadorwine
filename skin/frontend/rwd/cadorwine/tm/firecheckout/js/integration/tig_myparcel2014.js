if (typeof mypajQuery !== 'undefined') {
    mypajQuery(document).on('change', 'input[name="shipping_method"]', function () {
        var sections = FC.Ajax.getSectionsToUpdate('shipping-method');
        if (sections.length) {
            checkout.update(
                checkout.urls.shipping_method,
                FC.Ajax.arrayToJson(sections)
            );
        }
    });
}
