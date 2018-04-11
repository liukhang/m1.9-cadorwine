<?php

class TM_OrderAttachment_Block_Adminhtml_Attachment_Edit_Form extends Mage_Adminhtml_Block_Widget_Form
{
    protected function _prepareForm()
    {
        $model = Mage::registry('orderattachment');

        $form = new Varien_Data_Form(array(
            'id'     => 'edit_form',
            'action' => $this->getData('action'),
            'method' => 'post'
        ));

        $form->setHtmlIdPrefix('orderattachment_');

        $fieldset = $form->addFieldset('base_fieldset', array(
            'legend' => Mage::helper('cms')->__('General Information'),
            'class'  => 'fieldset-wide'
        ));

        $fieldset->addField('attachment_id', 'hidden', array(
            'name' => 'attachment_id',
        ));

        $fieldset->addField('path', 'link', array(
            'href'  => $model->getDownloadUrl(),
            'name'  => 'path',
            'label' => Mage::helper('orderattachment')->__('Attachment'),
            'title' => Mage::helper('orderattachment')->__('Download Attachment')
        ));

        $fieldset->addField('order_id', 'link', array(
            'href'  => Mage::helper('adminhtml')->getUrl(
                'adminhtml/sales_order/view', array('order_id' => $model->getOrderId())
            ),
            'name'  => 'order_id',
            'label' => Mage::helper('sales')->__('Order ID'),
            'title' => Mage::helper('sales')->__('Order ID')
        ));

        $fieldset->addField('comment', 'textarea', array(
            'name'  => 'comment',
            'label' => Mage::helper('sales')->__('Comment'),
            'title' => Mage::helper('sales')->__('Comment')
        ));

        $form->setValues($model->getData());
        $form->setUseContainer(true);
        $form->setFieldNameSuffix('attachment');
        $this->setForm($form);

        return parent::_prepareForm();
    }
}
