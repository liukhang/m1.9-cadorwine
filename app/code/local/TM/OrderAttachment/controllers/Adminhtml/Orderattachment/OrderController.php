<?php

class TM_OrderAttachment_Adminhtml_Orderattachment_OrderController extends Mage_Adminhtml_Controller_Action
{
    public function uploadAction()
    {
        if (!$this->getRequest()->isPost()) {
            return;
        }
        if (!$orderId = $this->getRequest()->getParam('order_id')) {
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
                'quote_id' => null,
                'order_id' => $orderId,
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
        if (!$this->getRequest()->isPost()) {
            return;
        }
        if (!$orderId = $this->getRequest()->getParam('order_id')) {
            return;
        }
        if (!$hash = $this->getRequest()->getParam('hash')) {
            return;
        }

        try {
            $collection = Mage::getResourceModel('orderattachment/attachment_collection');
            $collection->addFieldToFilter('hash', $hash)
                ->addFieldToFilter('order_id', $orderId);

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

    public function saveAction()
    {
        if (!$this->getRequest()->isPost()) {
            return;
        }

        $orderId = $this->getRequest()->getParam('order_id');
        $attachments = $this->getRequest()->getParam('attachment');
        if (!$attachments) {
            return;
        }

        foreach ($attachments as $id => $values) {
            if (!isset($values['comment'])) {
                continue;
            }
            $attachment = Mage::getModel('orderattachment/attachment');
            $attachment->load($id);
            if ($attachment->getOrderId() !== $orderId) {
                continue;
            }
            $attachment->setComment($values['comment'])->save();
        }

        $response = array('success' => true);
        $this->getResponse()->setBody(Mage::helper('core')->jsonEncode($response));
    }

    /**
     * Check the permission to run it
     *
     * @return boolean
     */
    protected function _isAllowed()
    {
        $action = strtolower($this->getRequest()->getActionName());
        if ('upload' === $action) {
            $action = 'save';
        }
        switch ($action) {
            case 'save':
            case 'delete':
                return Mage::getSingleton('admin/session')->isAllowed('templates_master/orderattachment/' . $action);
            default:
                return Mage::getSingleton('admin/session')->isAllowed('templates_master/orderattachment');
        }
    }
}
