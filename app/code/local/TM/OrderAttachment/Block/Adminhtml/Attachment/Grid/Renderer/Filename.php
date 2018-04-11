<?php

class TM_OrderAttachment_Block_Adminhtml_Attachment_Grid_Renderer_Filename
    extends Mage_Adminhtml_Block_Widget_Grid_Column_Renderer_Abstract
{
    public function render(Varien_Object $row)
    {
        return '<span style="display: inline-block; max-width: 200px; word-break: break-all">'
            . $this->escapeHtml($row->getFilename())
            . '</span>';
    }
}
