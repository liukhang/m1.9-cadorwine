<?php

class TM_FireCheckout_Model_System_Config_Source_ProductAttribute
    extends Mage_Catalog_Model_Resource_Product_Attribute_Collection
{
    protected function _initSelect()
    {
        parent::_initSelect();

        $this->addVisibleFilter()
            ->getSelect()
            ->where('frontend_input IN (?)', array('text', 'dropdown'))
            ->where('used_in_product_listing = 1');

        return $this;
    }

    public function toOptionArray()
    {
        return $this->_toOptionArray('attribute_code', 'frontend_label');
    }

    public function toOptionHash()
    {
        return $this->_toOptionHash('attribute_code', 'frontend_label');
    }
}
