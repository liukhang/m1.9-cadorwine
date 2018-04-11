<?php

class TM_OrderAttachment_Block_Adminhtml_Attachment_Grid extends Mage_Adminhtml_Block_Widget_Grid
{
    public function __construct()
    {
        parent::__construct();
        $this->setId('orderattachmentGrid');
        $this->setDefaultSort('attachment_id');
        $this->setDefaultDir('DESC');
        $this->setUseAjax(true);
    }

    protected function _prepareCollection()
    {
        $collection = Mage::getModel('orderattachment/attachment')->getCollection();
        $collection->joinLeft(array('quote' => 'sales/quote'), 'main_table.quote_id = quote.entity_id');
        $this->setCollection($collection);
        return parent::_prepareCollection();
    }

    protected function _prepareColumns()
    {
        $this->addColumn('attachment_id', array(
            'header' => Mage::helper('catalog')->__('ID'),
            'index'  => 'attachment_id',
            'width' => '50px',
            'type'  => 'number'
        ));

        $this->addColumn('path', array(
            'header' => Mage::helper('sitemap')->__('Filename'),
            'index'  => 'path',
            'width'  => 200,
            'renderer' => 'orderattachment/adminhtml_attachment_grid_renderer_filename'
        ));

        $this->addColumn('comment', array(
            'header'   => Mage::helper('sales')->__('Comment'),
            'index'    => 'comment',
            'type'     => 'text',
            // 'truncate' => 100,
            'nl2br'    => true,
            'escape'   => true,
        ));

        $this->addColumn('quote_id', array(
            'header' => Mage::helper('orderattachment')->__('Quote ID'),
            'index'  => 'quote_id',
            'width' => '50px',
            'type'  => 'number'
        ));

        $this->addColumn('updated_at', array(
            'header' => Mage::helper('customer')->__('Last Activity'),
            'index' => 'updated_at',
            'width' => '180px',
            'type'  => 'datetime'
        ));

        $this->addColumn('order_id', array(
            'header' => Mage::helper('sales')->__('Order ID'),
            'index'  => 'order_id',
            'width'  => '50px',
            'type'   => 'number',
            'align'  => 'right',
            'renderer'  => 'orderattachment/adminhtml_attachment_grid_renderer_order'
        ));

        $this->addColumn('actions', array(
            'header'    => Mage::helper('cms')->__('Action'),
            'width'     => 10,
            'sortable'  => false,
            'filter'    => false,
            'renderer'  => 'orderattachment/adminhtml_attachment_grid_renderer_action'
        ));

        return parent::_prepareColumns();
    }

    public function getRowUrl($row)
    {
        if ($row->getOrderId()) {
            return $this->getUrl('*/*/edit', array('attachment_id' => $row->getId()));
        }
        return false;
    }

    public function getGridUrl()
    {
        return $this->getUrl('*/*/grid', array('_current'=>true));
    }

    protected function _prepareMassaction()
    {
        $this->setMassactionIdField('attachment_id');
        $this->getMassactionBlock()->setFormFieldName('attachment_id');

        if ($this->_isAllowedAction('delete')) {
            $this->getMassactionBlock()->addItem('delete', array(
                 'label'    => Mage::helper('orderattachment')->__('Delete Attachments'),
                 'url'      => $this->getUrl('*/*/massDelete'),
                 'confirm'  => Mage::helper('adminhtml')->__('Are you sure?')
            ));
        }

        return $this;
    }

    protected function _isAllowedAction($action)
    {
        return Mage::getSingleton('admin/session')->isAllowed('templates_master/orderattachment/' . $action);
    }
}
