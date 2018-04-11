<?php

class TM_OrderAttachment_OrderController extends Mage_Sales_Controller_Abstract
{
    public function preDispatch()
    {
        parent::preDispatch();

        if (Mage::getSingleton('customer/session')->isLoggedIn()) {
            $action = $this->getRequest()->getActionName();
            $loginUrl = Mage::helper('customer')->getLoginUrl();
            if (!Mage::getSingleton('customer/session')->authenticate($this, $loginUrl)) {
                $this->setFlag('', self::FLAG_NO_DISPATCH, true);
            }
        }

        $helper = Mage::helper('orderattachment');
        if (!$helper->isEnabled() || !Mage::getStoreConfigFlag('orderattachment/general/orderview_upload')) {
            $this->setFlag('', self::FLAG_NO_DISPATCH, true);
        }
    }

    protected function _loadValidOrder($orderId = null)
    {
        if (!Mage::getSingleton('customer/session')->isLoggedIn()) {
            return Mage::helper('sales/guest')->loadValidOrder();
        } else {
            return parent::_loadValidOrder($orderId);
        }
    }

    public function uploadAction()
    {
        if (!$this->getRequest()->isPost()) {
            return;
        }

        if (!$this->_validateFormKey()) {
            $response = array(
                'success' => false,
                'error' => 'Invalid form key'
            );
            $this->getResponse()->setBody(Mage::helper('core')->jsonEncode($response));
            return;
        }

        if (!$this->_loadValidOrder()) {
            return;
        }

        $order = Mage::registry('current_order');
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
                'quote_id' => null,
                'order_id' => $order->getId(),
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

    public function saveAction()
    {
        if (!$this->getRequest()->isPost() || !$this->_validateFormKey()) {
            $this->_redirectReferer();
            return;
        }

        if (!$this->_loadValidOrder()) {
            $this->_redirectReferer();
            return;
        }

        $order = Mage::registry('current_order');
        $attachments = $this->getRequest()->getParam('attachment');
        if (!$attachments) {
            $this->_redirectReferer();
            return;
        }

        foreach ($attachments as $id => $values) {
            if (!isset($values['comment'])) {
                continue;
            }
            $attachment = Mage::getModel('orderattachment/attachment');
            $attachment->load($id);
            if ($attachment->getOrderId() !== $order->getId()) {
                continue;
            }
            $attachment->setComment($values['comment'])->save();
        }

        $this->_redirectReferer();
    }

    public function deleteAction()
    {
        if (!$this->getRequest()->isPost() || !$this->_validateFormKey()) {
            return;
        }

        if (!$hash = $this->getRequest()->getParam('hash')) {
            return;
        }

        if (!$this->_loadValidOrder()) {
            return;
        }

        $order = Mage::registry('current_order');
        try {
            $collection = Mage::getResourceModel('orderattachment/attachment_collection');
            $collection->addFieldToFilter('hash', $hash)
                ->addFieldToFilter('order_id', $order->getId());

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
