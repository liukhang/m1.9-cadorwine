<?php

class TM_OrderAttachment_Block_Adminhtml_Attachment_Edit extends Mage_Adminhtml_Block_Widget_Form_Container
{
    public function __construct()
    {
        $this->_blockGroup = 'orderattachment';
        $this->_objectId   = 'attachment_id';
        $this->_controller = 'adminhtml_attachment';

        parent::__construct();


        if ($this->_isAllowedAction('save')) {
            $this->_addButton('saveandcontinue', array(
                'label'     => Mage::helper('adminhtml')->__('Save and Continue Edit'),
                'onclick'   => 'saveAndContinueEdit()',
                'class'     => 'save',
            ), -100);
        } else {
            $this->_removeButton('save');
        }

        if (!$this->_isAllowedAction('delete')) {
            $this->_removeButton('delete');
        }
    }

    public function getSaveUrl()
    {
        return $this->getUrl('*/*/save');
    }

    /**
     * Get edit form container header text
     *
     * @return string
     */
    public function getHeaderText()
    {
        return Mage::helper('orderattachment')->__("Edit Attachment");
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

    protected function _prepareLayout()
    {
        $this->_formScripts[] = "
            function saveAndContinueEdit(){
                editForm.submit($('edit_form').action+'back/edit/');
            }
        ";
        return parent::_prepareLayout();
    }
}
