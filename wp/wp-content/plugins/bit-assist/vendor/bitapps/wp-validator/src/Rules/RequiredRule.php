<?php
namespace BitApps\Assist\Deps\BitApps\WPValidator\Rules;

use BitApps\Assist\Deps\BitApps\WPValidator\Helpers;
use BitApps\Assist\Deps\BitApps\WPValidator\Rule;

class RequiredRule extends Rule
{
    use Helpers;

    private $message = 'The :attribute field is required';

    public function validate($value): bool
    {
        return !$this->isEmpty($value);
    }

    public function message()
    {
        return $this->message;
    }
}
