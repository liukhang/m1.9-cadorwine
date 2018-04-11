<?php

class TM_OrderAttachment_Helper_Data extends Mage_Core_Helper_Abstract
{
    /**
     * Retrieve attachments assigned to quote
     *
     * @param  integer $quoteId
     * @return TM_OrderAttachment_Model_Resource_Attachment_Collection
     */
    public function getAttachmentsByQuoteId($quoteId)
    {
        $collection = Mage::getResourceModel('orderattachment/attachment_collection');
        $collection->addFieldToFilter('quote_id', $quoteId);
        return $collection;
    }

    /**
     * Retrieve order attachments
     *
     * @param  integer $orderId
     * @return TM_OrderAttachment_Model_Resource_Attachment_Collection
     */
    public function getAttachmentsByOrderId($orderId)
    {
        $collection = Mage::getResourceModel('orderattachment/attachment_collection');
        $collection->addFieldToFilter('order_id', $orderId);
        return $collection;
    }

    /**
     * @return array
     */
    public function getAllowedExtensions()
    {
        $extensions = Mage::getStoreConfig('orderattachment/restrictions/extension');
        return explode(',', $extensions);
    }

    /**
     * @return integer KB
     */
    public function getAllowedFilesize()
    {
        return Mage::getStoreConfig('orderattachment/restrictions/size');
    }

    public function getAllowedFilecount()
    {
        return Mage::getStoreConfig('orderattachment/restrictions/count');
    }

    public function isEnabled()
    {
        return Mage::getStoreConfigFlag('orderattachment/general/enabled')
            && !Mage::getStoreConfigFlag('advanced/modules_disable_output/TM_OrderAttachment');
    }

    public function getBaseDir()
    {
        return Mage::getBaseDir('var') . '/tm/orderattachment';
    }

    /**
     * Validate filesize against allowed size config. Used for Varien_File_Uploader.
     * @see  TM_OrderAttachment_IndexController::uploadAction
     *
     * @param  string $filename Path to the file
     * @return true
     * @throws Exception
     */
    public function validateFilesize($filename)
    {
        $filesize = round(filesize($filename) / 1024);
        $allowed  = $this->getAllowedFilesize();
        if ($filesize > $allowed) {
            throw new Exception($this->__('Files may not exceed %sKB', $allowed));
        }
        return true;
    }
}
