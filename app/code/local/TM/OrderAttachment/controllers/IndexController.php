<?php

class TM_OrderAttachment_IndexController extends Mage_Core_Controller_Front_Action
{
    public function downloadAction()
    {
        $orderId = $this->getRequest()->getParam('order_id');
        $hash    = $this->getRequest()->getParam('hash');
        if (!$orderId || !$hash) {
            $this->_redirectReferer();
        }

        $collection = Mage::getResourceModel('orderattachment/attachment_collection');
        $collection->addFieldToFilter('order_id', $orderId)
            ->addFieldToFilter('hash', $hash);

        $attachment = $collection->getFirstItem();
        if ($attachment->getId()) {
            $baseDir  = Mage::helper('orderattachment')->getBaseDir();
            $filename = $baseDir . $attachment->getPath();
            if (is_readable($filename) && is_file($filename)) {
                $this->getResponse()
                    // ->setHeader('Content-Type', 'application/octet-stream')
                    ->setHeader('Content-Type', 'application/force-download')
                    ->setHeader('Content-Disposition', 'attachment; filename=' . basename($filename))
                    ->setHeader('Content-Length', filesize($filename))
                    ->setHeader('Expires', 0)
                    ->setHeader('Pragma', 'public')
                    ->setHeader('Cache-Control', 'must-revalidate')
                    ->sendHeaders();
                readfile($filename);
                exit;
            } else {
                Mage::getSingleton('core/session')->addError(
                    Mage::helper('orderattachment')->__('File was not found')
                );
            }
        } else {
            Mage::getSingleton('core/session')->addError(
                Mage::helper('orderattachment')->__('Attachment was not found')
            );
        }

        $this->_redirectReferer();
    }
}
