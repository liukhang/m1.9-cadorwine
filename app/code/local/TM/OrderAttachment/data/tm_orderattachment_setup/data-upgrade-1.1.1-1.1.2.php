<?php

$installer = $this;
$connection = $installer->getConnection();

// old magento versions check
$resourceModel = (string)Mage::getConfig()->getNode()->global->models->admin->resourceModel;
$entityConfig  = Mage::getSingleton('core/resource')->getEntity($resourceModel, 'permission_block');

if (!$entityConfig ||
    !$connection->isTableExists($installer->getTable('admin/permission_block'))) {

    return;
}

// magento 1.9.2.2 compatibility: whitelist blocks in table 'permission_block'
$connection->insertMultiple(
    $installer->getTable('admin/permission_block'),
    array(
        array('block_name' => 'orderattachment/view', 'is_allowed' => 1)
    )
);
