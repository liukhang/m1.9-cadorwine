<?php

class TM_OrderAttachment_Model_Resource_Attachment extends Mage_Core_Model_Mysql4_Abstract
{
    protected function _construct()
    {
        $this->_init('orderattachment/attachment', 'attachment_id');
    }

    /**
     * Remove attachment from filesystem
     *
     * @param  Mage_Core_Model_Abstract $object
     * @return TM_OrderAttachment_Model_Resource_Attachment
     */
    protected function _afterDelete(Mage_Core_Model_Abstract $object)
    {
        @unlink($object->getFullPath());
        return $this;
    }
}
