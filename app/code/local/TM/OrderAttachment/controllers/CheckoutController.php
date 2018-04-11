<?php

class TM_OrderAttachment_CheckoutController extends Mage_Core_Controller_Front_Action
{
    public function preDispatch()
    {
        parent::preDispatch();

        $helper = Mage::helper('orderattachment');
        if (!$helper->isEnabled() || !Mage::getStoreConfigFlag('orderattachment/general/checkout_upload')) {
            $this->setFlag('', self::FLAG_NO_DISPATCH, true);
        }
    }

    public function uploadAction()
    {
        if (!$this->_validateFormKey()) {
            $response = array(
                'success' => false,
                'error' => 'Invalid form key'
            );
            $this->getResponse()->setBody(Mage::helper('core')->jsonEncode($response));
            return;
        }
        if (!$this->getRequest()->isPost()) {
            return;
        }
        if (!$quoteId = Mage::getSingleton('checkout/session')->getQuote()->getId()) {
            return;
        }

        $helper = Mage::helper('orderattachment');
        try {
            $uploader = new Varien_File_Uploader('attachment');
            $uploader->addValidateCallback('filesize', $helper, 'validateFilesize');
            $uploader->setAllowedExtensions($helper->getAllowedExtensions());
            $uploader->setFilesDispersion(true);
            $uploader->setFilenamesCaseSensitivity(false);
            $uploader->setAllowRenameFiles(true);
            $uploader->save($helper->getBaseDir());

            $attachment = Mage::getModel('orderattachment/attachment');
            $attachment->addData(array(
                'quote_id' => $quoteId,
                'order_id' => null,
                'path'     => $uploader->getUploadedFileName(),
                'hash'     => Mage::helper('orderattachment/url')->generateHash()
            ));
            $attachment->save();

            $response = array(
                'success'  => true,
                'id'       => $attachment->getId(),
                'hash'     => $attachment->getHash(),
                'comment'  => $attachment->getComment(),
                'filename' => $attachment->getFilename()
            );
        } catch (Exception $e) {
            $response = array(
                'success' => false,
                'error' => $e->getMessage()
            );
            Mage::logException($e);
        }
        $this->getResponse()->setBody(Mage::helper('core')->jsonEncode($response));
    }

    public function deleteAction()
    {
        if (!$this->_validateFormKey() || !$this->getRequest()->isPost()) {
            return;
        }
        if (!$quoteId = Mage::getSingleton('checkout/session')->getQuote()->getId()) {
            return;
        }
        if (!$hash = $this->getRequest()->getParam('hash')) {
            return;
        }

        try {
            $collection = Mage::getResourceModel('orderattachment/attachment_collection');
            $collection->addFieldToFilter('hash', $hash)
                ->addFieldToFilter('quote_id', $quoteId);

            $attachment = $collection->getFirstItem();
            if (!$attachment->getId()) {
                throw new Exception('Unable to find attachment to delete.');
            }

            $attachment->delete();
            $response = array(
                'success' => true
            );
        } catch (Exception $e) {
            $response = array(
                'success' => false,
                'error' => $e->getMessage()
            );
        }
        $this->getResponse()->setBody(Mage::helper('core')->jsonEncode($response));
    }
}
