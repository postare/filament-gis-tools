<?php

namespace Postare\GisTools\Commands;

use Illuminate\Console\Command;

class GisToolsCommand extends Command
{
    public $signature = 'gis-tools';

    public $description = 'My command';

    public function handle(): int
    {
        $this->comment('All done');

        return self::SUCCESS;
    }
}
