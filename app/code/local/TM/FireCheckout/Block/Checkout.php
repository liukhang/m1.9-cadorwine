<?php

class TM_FireCheckout_Block_Checkout extends Mage_Checkout_Block_Onepage_Abstract
{
    protected function _prepareLayout()
    {
        $head = $this->getLayout()->getBlock('head');
        if (!$head) {
            return $this;
        }

        $design = Mage::getDesign();
        $customFiles = array(
            'skin_css' => array(
                'tm/firecheckout/css/custom.css'
            ),
            'skin_js' => array(
                'tm/firecheckout/js/custom.js'
            )
        );
        foreach ($customFiles as $type => $files) {
            foreach ($files as $file) {
                $fileUrl = $design->getSkinUrl($file);

                // detect path to the file including package and theme
                preg_match('/\/skin\/frontend\/(.+)/', $fileUrl, $matches);
                if (empty($matches[1])) {
                    continue;
                }

                // check is file is actually exists
                $baseDir = Mage::getBaseDir();
                $absolutePath = $baseDir . '/skin/frontend/' . $matches[1];
                if (is_readable($absolutePath)) {
                    $head->addItem($type, $file, "");
                }
            }
        }
    }
}
