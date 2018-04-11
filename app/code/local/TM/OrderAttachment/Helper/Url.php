<?php

class TM_OrderAttachment_Helper_Url extends Mage_Core_Helper_Abstract
{
    /**
     * Generate random string for attachment hash
     *
     * @return string
     */
    public function generateHash()
    {
        $chars = Mage_Core_Helper_Data::CHARS_LOWERS
            . Mage_Core_Helper_Data::CHARS_UPPERS
            . Mage_Core_Helper_Data::CHARS_DIGITS;
        return Mage::helper('core')->getRandomString(16, $chars);
    }

    /**
     * Get attachment download url
     *
     * @param  TM_OrderAttachment_Model_Attachment $attachment
     * @return string
     */
    public function getDownloadUrl($attachment)
    {
        return $this->_getUrl('orderattachment/index/download', array(
            'order_id' => $attachment->getOrderId(),
            'hash'     => $attachment->getHash()
        ));
    }
}
