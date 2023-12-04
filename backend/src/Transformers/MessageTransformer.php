<?php

namespace App\Transformers;

use App\Entity\Chat;
use App\Entity\Message;
use League\Fractal;

class MessageTransformer extends Fractal\TransformerAbstract
{
    public function transform(Message $message): array
    {
        return [
            'id'            => (int) $message->getId(),
            'content'       => $message->getContent(),
            'role'          => $message->getRole(),
            'created_at'    => $message->getCreatedAt(),
            'links'   => [
                [
                    'rel' => 'self',
                    'uri' => '/chat/'.$message->getChat()->getId().'/message/'.$message->getId(),
                ],
                [
                    'rel' => 'parent',
                    'uri' => '/chat/'.$message->getChat()->getId(),
                ]
            ],
        ];
    }
}