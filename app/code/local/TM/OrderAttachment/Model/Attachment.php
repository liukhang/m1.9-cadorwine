<?php

class TM_OrderAttachment_Model_Attachment extends Mage_Core_Model_Abstract
{
    protected function _construct()
    {
        $this->_init('orderattachment/attachment');
    }

    /**
     * Returns attachment filename
     *
     * @return string
     */
    public function getFilename()
    {
        $path = $this->getPath();
        $index = strrpos($path, '/');
        if (false !== $index) {
            return substr($path, $index + 1);
        }
        return $path;
    }

    /**
     * Retrieve full filepath to the attachment
     *
     * @return string
     */
    public function getFullPath()
    {
        return Mage::helper('orderattachment')->getBaseDir() . $this->getPath();
    }

    /**
     * Retrieve download attachment url
     *
     * @return string
     */
    public function getDownloadUrl()
    {
        return Mage::helper('orderattachment/url')->getDownloadUrl($this);
    }
}
