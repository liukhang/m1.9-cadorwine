<?php

class TM_FireCheckout_Helper_Address extends Mage_Core_Helper_Abstract
{
    const STATUS_DEFAULT = 'optional';

    protected $_sortedFields = null;

    protected $_fieldStatus = null;

    /**
     * Retrive sorted and grouped fields by rows
     * @return array
     * <code>
     *  array(
     *      array(
     *          'name'
     *      ),
     *      array(
     *          'email',
     *          'company'
     *      ),
     *      ...
     *  )
     * </code>
     */
    public function getSortedFields()
    {
        if (null === $this->_sortedFields) {
            $this->_sortedFields = array();
            $fields = Mage::getStoreConfig('firecheckout/address_form_order');
            asort($fields);

            $i = 0;
            $prevOrder = 0;
            foreach ($fields as $field => $order) {
                if ($order - $prevOrder > 1) {
                    $i++;
                }
                $prevOrder = $order;
                $this->_sortedFields[$i][] = $field;
            }
        }
        return $this->_sortedFields;
    }

    public function getFieldStatus($field = null)
    {
        if (null === $this->_fieldStatus) {
            $status = Mage::getStoreConfig('firecheckout/address_form_status');
            if ('hidden' !== $status['postcode']) {
                $status['postcode'] = 'required'; // used to render asterisk
            }
            if (Mage::getStoreConfig('general/region/state_required')) {
                $status['region'] = 'required'; // used to render asterisk
            }
            $this->_fieldStatus = $status;
        }

        if (null === $field) {
            return $this->_fieldStatus;
        }
        if (!isset($this->_fieldStatus[$field])) {
            return self::STATUS_DEFAULT;
        }
        return $this->_fieldStatus[$field];
    }

    public function removeHiddenFields($fields)
    {
        foreach ($fields as $fieldId => $config) {
            if (isset($config['status'])) {
                $status = $config['status'];
            } else {
                $status = $this->getFieldStatus($fieldId);
                $fields[$fieldId]['status'] = $status;
            }
            if ('hidden' === $status && empty($config['required_to_render'])) {
                unset($fields[$fieldId]);
            }
        }
        return $fields;
    }

    /**
     * Get fields splitted into rows
     *
     * @param  array $fields
     * @return array
     */
    public function getRows($fields)
    {
        $result = array();
        $rows   = $this->getSortedFields();
        $fields = $this->removeHiddenFields($fields);

        foreach ($rows as $row) {
            $_fields = array();
            $_isMulticolumn = false;
            $_visibleFieldsCount = 0;
            foreach ($row as $field) {
                if (!isset($fields[$field])) {
                    continue;
                }
                $_fields[$field] = $fields[$field];
                if (!isset($fields[$field]['status'])
                    || $fields[$field]['status'] !== 'hidden') {

                    $_visibleFieldsCount++;
                }
                if ('name' === $field) {
                    $_isMulticolumn = true;
                }
            }
            if ($_fields) {
                $result[] = new Varien_Object(array(
                    'is_multicolumn' => $_visibleFieldsCount > 1 || $_isMulticolumn,
                    'is_visible' => (bool)$_visibleFieldsCount,
                    'fields' => $_fields
                ));
            }
        }

        return $result;
    }
}
