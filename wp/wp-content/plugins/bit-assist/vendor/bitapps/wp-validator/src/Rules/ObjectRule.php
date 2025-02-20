<?php
namespace BitApps\Assist\Deps\BitApps\WPValidator\Rules;

use BitApps\Assist\Deps\BitApps\WPValidator\Rule;

class ObjectRule extends Rule
{
    private $message = "The :attribute must be object";

    public function validate($value): bool
    {
        return is_object($value);
    }

    public function message()
    {
        return $this->message;
    }
}
