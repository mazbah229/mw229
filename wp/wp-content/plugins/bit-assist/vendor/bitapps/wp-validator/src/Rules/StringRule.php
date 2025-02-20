<?php

namespace BitApps\Assist\Deps\BitApps\WPValidator\Rules;

use BitApps\Assist\Deps\BitApps\WPValidator\Rule;

class StringRule extends Rule
{
    protected $message = "The :attribute field should be string";

    public function validate($value): bool
    {
        return is_string($value);
    }

    public function message()
    {
        return $this->message;
    }
}
