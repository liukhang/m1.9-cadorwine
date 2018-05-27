directPost.prototype.preparePayment = function() {
    this.changeInputOptions('autocomplete', 'off');
    if ($(this.iframeId)) {
        var button = $('authorizenet-submit');
        button.observe('click', function() {
            if ($(this.iframeId)) {
                if (this.validate()) {
                    this.saveOnepageOrder();
                }
            } else {
                review.save();
            }
        }.bind(this));

        $(this.iframeId).observe('load', this.onLoadIframe);
    }
}
directPost.prototype.loadIframe = function() {
    if (this.paymentRequestSent) {
        this.paymentRequestSent = false;
        if (!this.hasError) {
            this.returnQuote();
        }
        if (this.tmpForm) {
            document.body.removeChild(this.tmpForm);
        }
    }
}
directPost.prototype.showError = function(msg) {
    this.hasError = true;
    $(this.iframeId).hide();
    this.resetLoadWaiting();
    alert(msg.stripTags().toString());
}
directPost.prototype.returnQuote = function() {
    var url = this.orderSaveUrl.replace('place', 'returnQuote');
    new Ajax.Request(url, {
        onSuccess : function(transport) {
            var response;
            try {
                response = transport.responseJSON || transport.responseText.evalJSON(true) || {};
            } catch (e) {
                response = {};
            }

            if (response.error_message) {
                alert(response.error_message.stripTags().toString());
            }
            $(this.iframeId).show();
            this.resetLoadWaiting();
        }.bind(this)
    });
}
directPost.prototype.setLoadWaiting = function() {
    checkout.setLoadWaiting(true);
    checkout.setLoadingButton($('authorizenet-submit'));
};
directPost.prototype.resetLoadWaiting = function() {
    checkout.setLoadWaiting(false);
    checkout.setLoadingButton($('authorizenet-submit'), false);
};
