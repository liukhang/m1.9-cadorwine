<?php

class TM_OrderAttachment_Block_Adminhtml_Attachment_Grid_Renderer_Order
    extends Mage_Adminhtml_Block_Widget_Grid_Column_Renderer_Abstract
{
    public function render(Varien_Object $row)
    {
        if (!$row->getOrderId()) {
            return false;
        }

        $href = Mage::helper('adminhtml')->getUrl(
            'adminhtml/sales_order/view',
            array(
                'order_id' => $row->getOrderId()
            )
        );
        return '<a href="'.$href.'" title="'.$this->__('View Order').'">'.$row->getOrderId().'</a>';
    }
}
