<?php

class TM_CheckoutSuccess_Model_Observer
{
    public function registerCurrentOrder($observer)
    {
        if (!Mage::helper('checkoutsuccess')->isEnabled()
            || Mage::registry('current_order')
            || Mage::registry('current_recurring_profile')) {

            return;
        }

        $session = Mage::getSingleton('checkout/session');
        if (!$session->getLastSuccessQuoteId()) {
            return;
        }

        $lastQuoteId = $session->getLastQuoteId();
        $lastOrderId = $session->getLastOrderId();
        $lastRecurringProfiles = $session->getLastRecurringProfileIds();
        if (!$lastQuoteId || (!$lastOrderId && empty($lastRecurringProfiles))) {
            return;
        }

        if ($lastOrderId) {
            Mage::register('current_order', Mage::getModel('sales/order')->load($lastOrderId));
        } elseif ($lastRecurringProfiles) {
            $profileId = current($lastRecurringProfiles);
            Mage::register(
                'current_recurring_profile',
                Mage::getModel('sales/recurring_profile')->load($profileId)
            );
        }
    }

    public function updateLayout($observer)
    {
        $request = $observer->getAction()->getRequest();
        if ($request->getModuleName() !== 'checkout'
            || $request->getControllerName() !== 'onepage'
            || $request->getActionName() !== 'success') {

            return;
        }

        if (!Mage::helper('checkoutsuccess')->isEnabled()) {
            return;
        }

        if (Mage::registry('current_order')) {
            Mage::app()->getLayout()->getUpdate()->addHandle('tm_checkoutsuccess_order_view');
        } elseif (Mage::registry('current_recurring_profile')) {
            Mage::app()->getLayout()->getUpdate()->addHandle('tm_checkoutsuccess_recurring_profile_view');
        }
    }
}
