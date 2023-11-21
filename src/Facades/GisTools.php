<?php

namespace Postare\GisTools\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @see \Postare\GisTools\GisTools
 */
class GisTools extends Facade
{
    protected static function getFacadeAccessor()
    {
        return \Postare\GisTools\GisTools::class;
    }
}
