<?php

class TM_FireCheckout_Block_Address_Validator extends Mage_Core_Block_Template
{
    /**
     * Get relevant path to template
     *
     * @return string
     */
    public function getTemplate()
    {
        if (!$this->_template) {
            $this->_template = 'tm/firecheckout/address/validator.phtml';
        }
        return $this->_template;
    }

    public function getTitle($type)
    {
        if ('billing' === $type) {
            return $this->__('Billing Address');
        } else {
            return $this->__('Shipping Address');
        }
    }

    /**
     * @param  array  $address USPS returned address
     *                         Address1 - is a suite number[optional]
     *                         Address2 - is a street address
     * @param  string $type
     * @return string
     */
    public function renderVerifiedAddressFields(array $address, $type = 'billing')
    {
        $nameToId = array(
            'Address1' => 'street2',
            'Address2' => 'street1',
            'City'     => 'city',
            'State'    => 'region_id',
            'Zip5'     => 'postcode'
        );

        $output = '';
        foreach ($address as $key => $value) {
            if (!isset($nameToId[$key])) {
                continue;
            }
            if ('State' === $key) {
                $value = Mage::getModel('directory/region')
                    ->loadByCode($value, 'US')
                    ->getId();
            }
            $output .= '<input class="input-verified" type="hidden" '
                . 'name="' . $type . ':' . $nameToId[$key] . '" '
                . 'value="' . $value . '" />';
        }
        return $output;
    }

    public function renderVerifiedAddressesJson()
    {
        $nameToId = array(
            'Address1' => 'street2',
            'Address2' => 'street1',
            'City'     => 'city',
            'State'    => 'region_id',
            'Zip5'     => 'postcode'
        );

        $validator = $this->getValidator();
        $addresses = $validator->getAddresses();
        $json = array();

        foreach ($addresses as $type => $address) {
            $verifiedAddresses = $validator->getVerifiedAddresses($type);
            $verifiedAddress = current($verifiedAddresses);
            foreach ($verifiedAddress as $key => $value) {
                if (!isset($nameToId[$key])) {
                    continue;
                }
                if ('State' === $key) {
                    $value = Mage::getModel('directory/region')
                        ->loadByCode($value, 'US')
                        ->getId();
                }
                $json[$type][$type.':'.$nameToId[$key]] = $value;
            }
        }

        return json_encode($json);
    }

    /*
     * Check if ZipCode autocorrection is allowed
     * Allowed when:
     *  - respective config enabled
     *  - address correct except zip-code
     */
    public function isAdressesAutocorrectionAllowed()
    {
        if (!Mage::getStoreConfigFlag('firecheckout/address_verification/smart_zip_correction')) {
            return false;
        }

        $autocorrectionAllowed = true;

        $validator = $this->getValidator();
        $addresses = $validator->getAddresses();

        $mapping = array(
            'Address1' => 'street',
            'Address2' => 'street',
            'City'     => 'city',
            'State'    => 'region_id',
            'Zip5'     => 'postcode'
        );

        foreach ($addresses as $id => $address) {
            // $this->_isVerified[$id] = 0;

            foreach ($validator->getVerifiedAddresses($id) as $verifiedAddress) {

                if (isset($verifiedAddress['error'])) {
                    $autocorrectionAllowed = false;
                    break;
                }

                foreach ($verifiedAddress as $name => $value) {
                    if (!isset($mapping[$name])) {
                        continue;
                    }

                    if ('Address1' === $name) {
                        $originalValue = $address[$mapping[$name]][1];
                    } elseif ('Address2' === $name) {
                        $originalValue = $address[$mapping[$name]][0];
                    } elseif ('State' === $name) {
                        // load region_code to compare it with usps returned value
                        $originalValue = Mage::getModel('directory/region')
                            ->load($address[$mapping[$name]])
                            ->getCode();
                    } elseif ('Zip5' === $name) {
                        $originalValue = $address[$mapping[$name]];
                        $value = substr($value, 0, strlen($originalValue));
                    } else {
                        $originalValue = $address[$mapping[$name]];
                    }

                    if (0 !== strcasecmp($value, $originalValue)) {
                        $autocorrectionAllowed = false;
                        break;
                    }
                }

                if (!$autocorrectionAllowed) {
                    break;
                }
            }
        }

        return $autocorrectionAllowed;
    }
}
