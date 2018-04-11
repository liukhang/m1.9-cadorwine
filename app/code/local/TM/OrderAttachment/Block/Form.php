<?php

class TM_OrderAttachment_Block_Form extends Mage_Core_Block_Template
{
    public function getAttachments()
    {
        $quoteId = Mage::getSingleton('checkout/session')->getQuote()->getId();
        return Mage::helper('orderattachment')->getAttachmentsByQuoteId($quoteId);
    }

    public function getTemplate()
    {
        if (!Mage::helper('orderattachment')->isEnabled()) {
            return false;
        }
        return parent::getTemplate();
    }
}
