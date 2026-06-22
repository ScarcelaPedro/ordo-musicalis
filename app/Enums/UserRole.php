<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Coordenador = 'coordenador';
    case Musico = 'musico';
}
