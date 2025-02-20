<?php
namespace BitApps\Assist\Deps\BitApps\WPValidator\Rules;

use BitApps\Assist\Deps\BitApps\WPValidator\Rule;

class MacAddressRule extends Rule
{
    private $message = "The :attribute field must be a valid MAC address";

    public function validate($value): bool
    {
        return filter_var($value, FILTER_VALIDATE_MAC) !== false;
    }

    public function message()
    {
        return $this->message;
    }
}
