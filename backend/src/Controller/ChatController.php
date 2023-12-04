<?php

namespace App\Controller;

use App\Entity\Chat;
use App\Transformers\ChatTransformer;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use League\Fractal\Manager;
use League\Fractal\Resource\Collection;
use League\Fractal\Resource\Item;
use League\Fractal\Serializer\DataArraySerializer;
use OpenAI;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Annotation\Route;

class ChatController extends AbstractController
{
    #[Route('/chat', name: 'chat.index', methods: ['GET'])]
    public function index(EntityManagerInterface $entityManager): JsonResponse
    {
        $chats = $entityManager->getRepository(Chat::class)->findAll();

        $manager = new Manager();
        $manager->setSerializer(new DataArraySerializer());
        $resources = new Collection($chats, new ChatTransformer());

        return new JsonResponse($manager->createData($resources)->toArray(), 200);
    }

    #[Route('/chat/{id}', name: 'chat.show', methods: ['GET'])]
    public function show(EntityManagerInterface $entityManager, $id)
    {
        $chat = $entityManager->getRepository(Chat::class)->find($id);

        if(!$chat) {
            return new JsonResponse(['message' => 'Chat not found'], 404);
        }

        $manager = new Manager();
        $manager->setSerializer(new DataArraySerializer());
        $resource = new Item($chat, new ChatTransformer());

        return new JsonResponse($manager->parseIncludes('messages')->createData($resource)->toArray(), 200);
    }

    #[Route('/chat', name: 'chat.store', methods: ['POST'])]
    public function store(EntityManagerInterface $entityManager): JsonResponse
    {
        $chat = new Chat();
        $chat->setCreatedAt(new DateTimeImmutable());
        $entityManager->persist($chat);
        $entityManager->flush();

        $chat->setTitle("Chat #".$chat->getId());
        $entityManager->flush();

        $manager = new Manager();
        $manager->setSerializer(new DataArraySerializer());
        $resource = new Item($chat, new ChatTransformer());

        return new JsonResponse($manager->createData($resource)->toArray(), 201);
    }

    #[Route('/chat', name: 'chat.put', methods: ['PUT'])]
    public function update(EntityManagerInterface $entityManager, $id): JsonResponse
    {

    }

    #[Route('/chat', name: 'chat.delete', methods: ['DELETE'])]
    public function delete(EntityManagerInterface $entityManager, $id): JsonResponse
    {

    }
}