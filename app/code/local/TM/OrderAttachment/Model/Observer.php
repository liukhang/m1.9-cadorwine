<?php

class TM_OrderAttachment_Model_Observer
{
    /**
     * Update comment column
     *
     * @param  $observer
     * @return void
     */
    public function saveAttachmentComment($observer)
    {
        if (!Mage::helper('orderattachment')->isEnabled()) {
            return;
        }

        $controller = $observer->getEvent()->getData('controller_action');
        $comments = $controller->getRequest()->getParam('attachment');
        if (!$comments) {
            return;
        }

        $quoteId = Mage::getSingleton('checkout/session')->getQuote()->getId();
        $attachments = Mage::helper('orderattachment')->getAttachmentsByQuoteId($quoteId);
        foreach ($attachments as $attachment) {
            if (!isset($comments[$attachment->getId()]['comment'])) {
                continue;
            }
            $attachment->setComment($comments[$attachment->getId()]['comment'])
                ->save();
        }
    }

    /**
     * Assign attachment to saved order
     *
     * @param  $observer
     * @return void
     */
    public function assignOrderId($observer)
    {
        if (!Mage::helper('orderattachment')->isEnabled()) {
            return;
        }

        $order = $observer->getOrder();
        $attachments = Mage::helper('orderattachment')
            ->getAttachmentsByQuoteId($order->getQuoteId());

        foreach ($attachments as $attachment) {
            $attachment->setOrderId($order->getId())->save();
        }
    }

    /**
     * Clean attachments without quote and order id.
     *
     * @return int Count of removed attachments
     */
    public function clearGhostAttachments()
    {
        $attachments = Mage::getResourceModel('orderattachment/attachment_collection');
        $attachments->addFieldToFilter('quote_id', array('null' => true))
            ->addFieldToFilter('order_id', array('null' => true));
        foreach ($attachments as $attachment) {
            $attachment->delete();
        }
        return count($attachments);
    }

    /**
     * Remove guest attachments from incompleted orders made more than 2 days ago
     *
     * @return int Count of remove attachments
     */
    public function clearOldGuestAttachments()
    {
        $days  = 2;
        $date  = gmdate('Y-m-d H:i:s', strtotime('now - ' . $days . ' days'));

        $attachments = Mage::getResourceModel('orderattachment/attachment_collection');
        $attachments->addFieldToFilter('main_table.quote_id', array('notnull' => true))
            ->addFieldToFilter('main_table.order_id', array('null' => true))
            ->join(array('quote' => 'sales/quote'), 'main_table.quote_id = quote.entity_id')
            ->addFieldToFilter('quote.updated_at', array('lt' => $date));

        foreach ($attachments as $attachment) {
            $attachment->delete();
        }
        return count($attachments);
    }
}
