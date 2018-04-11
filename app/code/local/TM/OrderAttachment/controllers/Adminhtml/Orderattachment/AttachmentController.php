<?php

class TM_OrderAttachment_Adminhtml_Orderattachment_AttachmentController extends Mage_Adminhtml_Controller_Action
{
    protected function _initAction()
    {
        $this->loadLayout()
            ->_setActiveMenu('templates_master/orderattachment')
            ->_addBreadcrumb(
                $this->__("Order Attachments"),
                $this->__("Order Attachments")
            );
        return $this;
    }

    public function indexAction()
    {
        $this->_title($this->__("Order Attachments"));
        $this->_initAction();
        $this->renderLayout();
    }

    public function editAction()
    {
        $this->_title($this->__('Edit Attachment'));

        $id = $this->getRequest()->getParam('attachment_id');
        $model = Mage::getModel('orderattachment/attachment');

        if (!$id) {
            Mage::getSingleton('adminhtml/session')->addError(
                $this->__('This attachment no longer exists.')
            );
            $this->_redirect('*/*/');
            return;
        }

        $model->load($id);
        if (!$model->getId()) {
            Mage::getSingleton('adminhtml/session')->addError(
                $this->__('This attachment no longer exists.'));
            $this->_redirect('*/*/');
            return;
        }

        $data = Mage::getSingleton('adminhtml/session')->getFormData(true);
        if (!empty($data)) {
            $model->setData($data);
        }

        Mage::register('orderattachment', $model);

        $this->_initAction()
            ->_addBreadcrumb(
                $this->__('Attachment'),
                $this->__('Attachment')
            );

        $this->renderLayout();
    }

    public function saveAction()
    {
        if (!$data = $this->getRequest()->getPost('attachment')) {
            $this->_redirect('*/*/');
            return;
        }
        if (!isset($data['attachment_id'])) {
            $this->_redirect('*/*/');
            return;
        }

        try {
            $model = Mage::getModel('orderattachment/attachment');
            $model->addData($data);
            $model->save();
            Mage::getSingleton('adminhtml/session')->addSuccess(
                Mage::helper('orderattachment')->__('Attachment has been saved.')
            );
            Mage::getSingleton('adminhtml/session')->setFormData(false);
            if ($this->getRequest()->getParam('back')) {
                $this->_redirect('*/*/edit', array('attachment_id' => $model->getId(), '_current' => true));
                return;
            }
            $this->_redirect('*/*/');
            return;
        } catch (Exception $e) {
            $this->_getSession()->addError($e->getMessage());
        }
        $this->_getSession()->setFormData($data);
        $this->_redirect('*/*/edit', array('_current'=>true));
    }

    public function deleteAction()
    {
        if ($id = $this->getRequest()->getParam('attachment_id')) {
            try {
                $model = Mage::getModel('orderattachment/attachment');
                $model->load($id);
                $model->delete();
                Mage::getSingleton('adminhtml/session')->addSuccess(
                    Mage::helper('orderattachment')->__('Attachment has been deleted.'));
                $this->_redirect('*/*/');
                return;
            } catch (Exception $e) {
                Mage::getSingleton('adminhtml/session')->addError($e->getMessage());
                $this->_redirect('*/*/edit', array('attachment_id' => $id));
                return;
            }
        }
        Mage::getSingleton('adminhtml/session')->addError(
            Mage::helper('orderattachment')->__('Unable to find attachment to delete.')
        );
        $this->_redirect('*/*/');
    }

    public function clearAction()
    {
        try {
            if ($this->getRequest()->getParam('mode') === 'old') {
                $result = Mage::getModel('orderattachment/observer')->clearOldGuestAttachments();
            } else {
                $result = Mage::getModel('orderattachment/observer')->clearGhostAttachments();
            }
            Mage::getSingleton('adminhtml/session')->addSuccess(
                Mage::helper('adminhtml')->__('Total of %d record(s) have been deleted.', $result)
            );
        } catch (Exception $e) {
            Mage::getSingleton('adminhtml/session')->addError($e->getMessage());
        }
        $this->_redirect('*/*/');
    }

    public function massDeleteAction()
    {
        $ids = $this->getRequest()->getParam('attachment_id');
        if (!is_array($ids)) {
            $this->_getSession()->addError($this->__('Please select item(s).'));
        } else {
            if (!empty($ids)) {
                try {
                    $attachments = Mage::getResourceModel('orderattachment/attachment_collection');
                    $attachments->addFieldToFilter('attachment_id', array('in' => $ids));
                    foreach ($attachments as $attachment) {
                        $attachment->delete();
                    }
                    $this->_getSession()->addSuccess(
                        $this->__('Total of %d record(s) have been deleted.', count($ids))
                    );
                } catch (Exception $e) {
                    $this->_getSession()->addError($e->getMessage());
                }
            }
        }
        $this->_redirect('*/*/index');
    }

    public function gridAction()
    {
        $this->loadLayout();
        $this->renderLayout();
    }

    /**
     * Check the permission to run it
     *
     * @return boolean
     */
    protected function _isAllowed()
    {
        $action = strtolower($this->getRequest()->getActionName());
        if ('massdelete' === $action) {
            $action = 'delete';
        }
        switch ($action) {
            case 'save':
            case 'clear':
            case 'delete':
                return Mage::getSingleton('admin/session')->isAllowed('templates_master/orderattachment/' . $action);
            default:
                return Mage::getSingleton('admin/session')->isAllowed('templates_master/orderattachment');
        }
    }
}
