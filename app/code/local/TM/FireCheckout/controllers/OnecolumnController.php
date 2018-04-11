<?php

require_once 'TM/FireCheckout/controllers/IndexController.php';

class TM_FireCheckout_OnecolumnController extends TM_FireCheckout_IndexController
{
    /**
     * All pre/postdispatch observers are removed automatically,
     * bacause event name depends on controller name.
     *
     * This is done to skip captcha and address validations
     */
    public function saveOrderAction()
    {
        return parent::saveOrderAction();
    }

    /**
     * Rewritten to listen to predispatch event, to validate captcha and address
     *
     * @return [type] [description]
     */
    public function saveBillingAction()
    {
        return parent::saveBillingAction();
    }
}
