var OrderAttachment = {};

OrderAttachment.Uploader = function(config) {
    var settings = {
            button: 'btn-attachment',
            disabledClass: 'disabled loading',
            name: 'attachment',
            multipart: true,
            // multiple: true,
            responseType: 'json',
            onChange: function(filename, ext, btn) {
                if (this._opts.manager.getCount() >= this._opts.maxCount) {
                    this._opts.errorEl.innerHTML = this._opts.messages.onLimitError;
                    return false;
                }
            },
            onSubmit: function(filename, ext) {
                this._opts.errorEl.innerHTML = '';
            },
            onSizeError: function() {
                this._opts.errorEl.innerHTML = this._opts.messages.onSizeError;
            },
            onExtError: function() {
                this._opts.errorEl.innerHTML = this._opts.messages.onExtError;
            },
            onComplete: function(file, response) {
                if (!response) {
                    this._opts.errorEl.innerHTML = this._opts.messages.onUploadError;
                    return;
                }

                if (response.error) {
                    this._opts.errorEl.innerHTML = response.error;
                    return;
                }

                if (response.success && this._opts.manager) {
                    this._opts.manager.add(response);
                }
            }
        };

    Object.extend(settings, config);

    ss.SimpleUpload.prototype.updatePosition = function() {
        if (this._btns[0] && this._input && this._input.parentNode) {
            this._overBtn = this._btns[0];
            ss.copyLayout(this._btns[0], this._input.parentNode);
        }
    };
    var simpleUpload = new ss.SimpleUpload(settings);
    setInterval(function() {
        simpleUpload.updatePosition();
    }, 500);

    return {
        getUploader: function() {
            return simpleUpload;
        }
    };
};

OrderAttachment.Manager = function(config) {
    var settings = {
        el: 'list-attachments',
        insertPosition: 'top'
    };

    Object.extend(settings, config);
    settings.template = new Template(settings.template);

    function addAttachment(item) {
        var insertRule = {};
        insertRule[settings.insertPosition] = settings.template.evaluate(item);
        $(settings.el).insert(insertRule);
        var removeBtn = $(item.hash).down('.btn-remove');
        if (removeBtn) {
            removeBtn.observe('click', function(e) {
                e.stop();
                removeAttachment(item.hash);
            });
        }
    }

    function removeAttachment(hash) {
        var row = $(hash);
        row.addClassName('disabled');
        new Ajax.Request(settings.removeUrl, {
            parameters: {
                hash: hash
            },
            onComplete: function(response) {
                try {
                    response = response.responseText.evalJSON();
                } catch (err) {
                    alert('An error has occured during request processing. Try again please');
                    row.removeClassName('disabled');
                    return false;
                }

                if (response.error) {
                    alert(response.error);
                    row.removeClassName('disabled');
                    return;
                }

                row.remove();
            }
        });
    }

    return {
        /**
         * @param {object} item
         * {
         *     filename: string
         *     comment: string
         *     hash: string
         *     id: integer
         * }
         */
        add: function(item) {
            addAttachment(item);
        },
        remove: function(hash) {
            removeAttachment(hash);
        },
        getCount: function() {
            return $(settings.el).children.length;
        }
    };
};
