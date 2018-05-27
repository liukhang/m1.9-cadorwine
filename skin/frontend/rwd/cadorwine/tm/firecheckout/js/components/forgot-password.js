var FC = FC || {};
FC.ForgotPassword = {
    forgot: function(emailField, messageContainer, triggerEl) {
        if (!Validation.validate(emailField)) {
            FC.Utils.shake(emailField.next('.validation-advice'));
            return;
        }

        if (this.showPopupWithCaptcha(emailField.getValue())) {
            return;
        }

        triggerEl.setOpacity(0);
        var parentEl = triggerEl.up('.input-box').down('input');
        if (parentEl) {
            checkout.setLoadingField(parentEl);
        }

        new Ajax.Request(checkout.urls.forgotpassword, {
            parameters: {
                email: emailField.getValue()
            },
            onSuccess: function(transport) {
                if (parentEl) {
                    checkout.setLoadingField(parentEl, false);
                }
                triggerEl.setOpacity(1);

                FC.Messenger.clear(messageContainer);

                var response = transport.responseText.evalJSON();
                if (response.error) {
                    FC.Messenger.add(response.error, messageContainer, 'error');
                    checkout.updateCaptcha('user_forgotpassword');
                } else if (response.message) {
                    FC.Messenger.add(response.message, messageContainer, 'success');
                }
            }
        });
    },

    showPopupWithCaptcha: function(email) {
        var forgotWindow = $('firecheckout-forgot-window');
        if (forgotWindow.down('#user_forgotpassword')) {
            firecheckoutWindow
                .update(forgotWindow)
                .show();
            forgotWindow.down('#email_address').setValue(email);
            var captchaInput = forgotWindow.down('#captcha_user_forgotpassword');
            if (captchaInput) {
                captchaInput.focus();
            }
            return true;
        }
        return false;
    }
};
