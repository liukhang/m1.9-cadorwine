<?php

class TM_OrderAttachment_Block_Adminhtml_Sales_Order_View_Tab_Attachment
    extends Mage_Adminhtml_Block_Widget implements Mage_Adminhtml_Block_Widget_Tab_Interface
{
    public function __construct()
    {
        parent::__construct();
        $this->setTemplate('tm/orderattachment/sales/order/view/tab/attachment.phtml');
    }

    public function getAttachments()
    {
        return Mage::helper('orderattachment')
            ->getAttachmentsByOrderId($this->getOrder()->getId());
    }

    public function getOrder()
    {
        return Mage::registry('current_order');
    }

    public function isReadonly()
    {
        return false;
    }

    /**
     * Get tab label
     *
     * @return string
     */
    public function getTabLabel()
    {
        return Mage::helper('orderattachment')->__('Order Attachments');
    }

    /**
     * Get tab title
     *
     * @return string
     */
    public function getTabTitle()
    {
        return Mage::helper('orderattachment')->__('Order Attachments');
    }

    /**
     * Check if tab can be displayed
     *
     * @return boolean
     */
    public function canShowTab()
    {
        return Mage::getSingleton('admin/session')->isAllowed('templates_master/orderattachment');
    }

    /**
     * Check if tab is hidden
     *
     * @return boolean
     */
    public function isHidden()
    {
        return false;
    }

    public function isAllowedAction($action)
    {
        return Mage::getSingleton('admin/session')->isAllowed('templates_master/orderattachment/' . $action);
    }
}
