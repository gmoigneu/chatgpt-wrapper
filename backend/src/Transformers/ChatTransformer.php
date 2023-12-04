<?php

namespace App\Transformers;

use App\Entity\Chat;
use League\Fractal;
use League\Fractal\Resource\Item;

class ChatTransformer extends Fractal\TransformerAbstract
{
    protected array $availableIncludes = [
        'messages'
    ];

    public function transform(Chat $chat): array
    {
        return [
            'id'            => (int) $chat->getId(),
            'title'         => $chat->getTitle(),
            'created_at'    => $chat->getCreatedAt(),
            'links'   => [
                [
                    'rel' => 'self',
                    'uri' => '/chat/'.$chat->getId(),
                ]
            ],
        ];
    }

    /**
     * Include Messages
     *
     * @param Chat $chat
     * @return Item
     */
    public function includeMessages(Chat $chat): Fractal\Resource\Collection
    {
        return $this->collection($chat->getMessages(), new MessageTransformer);
    }
}