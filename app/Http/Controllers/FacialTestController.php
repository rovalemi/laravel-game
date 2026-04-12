<?php

namespace App\Http\Controllers;

use App\Services\FacialService;

class FacialTestController extends Controller
{
    public function status(FacialService $facial)
    {
        return $facial->status();
    }
}
