<?php
$installer = $this;
 
$installer->startSetup();
 
$this->addAttribute('customer_address', 'tax_number', array(
    'type' => 'text',
    'input' => 'text',
    'label' => 'Tax Code ',
    'global' => 1,
    'visible' => 1,
    'required' => 0,
    'user_defined' => 1,
    'visible_on_front' => 1
));
Mage::getSingleton('eav/config')
    ->getAttribute('customer_address', 'tax_number')
    ->setData('used_in_forms', array('customer_register_address','customer_address_edit','adminhtml_customer_address'))
    ->save();
	
$tablequote = $this->getTable('sales/quote_address');
	$installer->run("
	ALTER TABLE  $tablequote ADD  `tax_number` varchar(255) NOT NULL
	");
	 
	$tablequote = $this->getTable('sales/order_address');
	$installer->run("
	ALTER TABLE  $tablequote ADD  `tax_number` varchar(255) NOT NULL
	");
$installer->endSetup();
?>