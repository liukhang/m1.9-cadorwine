<?php

class TM_OrderAttachment_Block_Adminhtml_Attachment_Grid_Renderer_Action
    extends Mage_Adminhtml_Block_Widget_Grid_Column_Renderer_Abstract
{
    public function render(Varien_Object $row)
    {
        if (!$row->getOrderId()) {
            return false;
        }

        $href = $row->getDownloadUrl();
        $filename = $this->escapeHtml($row->getFilename());
        return '<a href="'.$href.'" title="'.$this->__('Download %s', $filename).'">'.$this->__('Download').'</a>';
    }
}
