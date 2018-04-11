<?php

class TM_OrderAttachment_Block_Adminhtml_Attachment extends Mage_Adminhtml_Block_Widget_Grid_Container
{
    public function __construct()
    {
        $this->_blockGroup = 'orderattachment';
        $this->_controller = 'adminhtml_attachment';
        $this->_headerText = Mage::helper('orderattachment')->__('Order Attachments');
        parent::__construct();

        $this->_removeButton('add');

        if ($this->_isAllowedAction('clear')) {
            $alert = $this->__('Are you sure?');
            $url   = $this->getUrl('*/*/clear', array('mode' => 'lost'));

            $this->_addButton('clear', array(
                'label'   => Mage::helper('orderattachment')->__('Clear lost attachments'),
                'title'   => Mage::helper('orderattachment')->__('Clear attachments with empty order_id and quote_id'),
                'onclick' => 'if (confirm(\'' . $alert . '\')) { setLocation(\'' . $url .'\'); }',
                'class'   => 'delete'
            ));

            $url = $this->getUrl('*/*/clear', array('mode' => 'old'));
            $this->_addButton('clear_old', array(
                'label'   => Mage::helper('orderattachment')->__('Clear old guest entries'),
                'title'   => Mage::helper('orderattachment')->__('Clear attachments with empty order_id, from guest carts, updated more than 2 days ago'),
                'onclick' => 'if (confirm(\'' . $alert . '\')) { setLocation(\'' . $url .'\'); }',
                'class'   => 'delete'
            ));
        }
    }

    /**
     * Check permission for passed action
     *
     * @param string $action
     * @return bool
     */
    protected function _isAllowedAction($action)
    {
        return Mage::getSingleton('admin/session')->isAllowed('templates_master/orderattachment/' . $action);
    }
}
