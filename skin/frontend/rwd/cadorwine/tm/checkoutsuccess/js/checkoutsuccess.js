(function() {

    setLoadingButton = function (button, status) {
        if (false === status) {
            button.removeClassName('loading').enable();
            button.down('.field-spinner-wrapper').remove();
        } else {
            button.addClassName('loading').disable();
            button.insert(
                {
                    bottom: '<div class="field-spinner-wrapper"><div class="loader"></div></div>'
                }
            );
        }
    }

    QuickCreateAccount = Class.create();
    QuickCreateAccount.prototype = {
        initialize: function(formId){
            if ($(formId)) {
                this.varienForm = new VarienForm(formId, false);
            }
        },
        registerCustomer: function(){
            if (this.varienForm.validator.validate()) {
                new Ajax.Request(
                    this.varienForm.form.action,
                    {
                        parameters: this.varienForm.form.serialize(true),
                        onCreate: this.setLoading.bind(this, true),
                        onSuccess: this.processResponse.bind(this),
                        // onFailure: function() {
                        //     console.log('something wnet wrong...');
                        // },
                        onComplete: this.setLoading.bind(this, false)
                    }
                );
            }
        },
        setLoading: function(status){
            if (false === status) {
                this.varienForm.form.enable();
                this.varienForm.form.select('.field').each(
                    function (el){
                        el.setStyle({opacity: ''});
                    }
                );
            } else {
                this.varienForm.form.disable();
                this.varienForm.form.select('.field').each(
                    function (el){
                        el.setStyle({opacity: '0.5'});
                    }
                );
            }

            setLoadingButton(this.varienForm.form.down('button'), status);
        },
        processResponse: function (resp){
            var json = resp.responseJSON,
                status = 'error';
            if (typeof json[status] === 'undefined') {
                status = 'success';
            }

            var responseContainer = this.varienForm.form.next('.response-'+status);
            if (responseContainer) {
                responseContainer.insert('<p>' + json[status] + '</p>');
                responseContainer.setStyle({display: ''});
            }

            this.varienForm.form.hide();
        }
    }

})();

document.observe(
    "dom:loaded",
    function (){
        var formId = 'quick-register';
        if ($(formId)) {
            window.quickCreateAccount = new QuickCreateAccount(formId);
            new Event.observe(
                formId,
                'submit',
                function(e){
                    e.stop();
                    quickCreateAccount.registerCustomer();
                }
            );
        }
    }
);
