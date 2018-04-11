<?php

class TM_OrderAttachment_Block_View extends Mage_Core_Block_Template
{
    public function getAttachments()
    {
        return Mage::helper('orderattachment')
            ->getAttachmentsByOrderId($this->getOrderId());
    }

    public function getOrderId()
    {
        $order = $this->getData('order'); // email template
        if ($order) {
            return $order->getId();
        }

        $orderId = $this->getData('order_id');
        if ($orderId) {
            return $orderId;
        }

        $order = Mage::registry('current_order');
        if ($order) {
            return $order->getId();
        }

        return false;
    }

    public function getTemplate()
    {
        if (!Mage::helper('orderattachment')->isEnabled()) {
            return false;
        }

        // disable upload form on all pages except order view and guest order view
        // (ex: checkout success page)
        $handles = $this->getLayout()->getUpdate()->getHandles();
        if (in_array('orderattachment_view_editable', $handles)) {
            $allowedControllers = array('order', 'guest');
            if (!in_array($this->getRequest()->getControllerName(), $allowedControllers)) {
                return 'tm/orderattachment/view.phtml';
            }
        }
        return parent::getTemplate();
    }
}
