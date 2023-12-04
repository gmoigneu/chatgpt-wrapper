<?php

namespace App\Controller;

use App\Entity\Chat;
use App\Entity\Message;
use Doctrine\ORM\EntityManagerInterface;
use OpenAI;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Annotation\Route;

class MessageController extends AbstractController
{
    #[Route('/chat/{id}/message', name: 'message.create', methods: ['POST'])]
    public function create(EntityManagerInterface $entityManager, $id): Response
    {

        $request = Request::createFromGlobals();
        $body = json_decode($request->getContent());

        $chat = $entityManager->getRepository(Chat::class)->find($id);

        if(!$chat) {
            return new JsonResponse(['message' => 'Chat not found'], 404);
        }

        $message = new Message();
        $message->setChat($chat);
        $message->setRole('user');
        $message->setContent($body->content);
        $message->setCreatedAt(new \DateTimeImmutable());
        $entityManager->persist($message);
        $entityManager->flush();

        $client = OpenAI::client($this->getParameter('app.openai_key'));

        $stream = $client->chat()->createStreamed([
            'model' => 'gpt-3.5-turbo-1106',
            'messages' => [
                ['role' => 'user', 'content' => $body->content],
            ],
        ]);

        $response = new StreamedResponse(function () use ($stream, &$answer, $entityManager): void {
            $i = 0;
            $text = "";

            foreach($stream as $response){
                $text .= $response->choices[0]->delta->content;

                $i++;

                echo "event: chunk\n";
                echo "data: {\"id\":" . $answer->getId() . ", \"index\": " . $i . ", \"chunk\": " . json_encode($response->choices[0]->delta->content) . "}\n\n";

                ob_flush();
                flush();

                // Break the loop if the client aborted the connection (closed the page)
                if (connection_aborted()) {
                    break;
                }
            }

            $answer->setContent($text);
            $entityManager->flush();
        });

        $response->headers->set('Content-Type', 'text/event-stream');
        $response->headers->set('X-Accel-Buffering', 'no');

        $answer = new Message();
        $answer->setChat($chat);
        $answer->setRole('assistant');
        $answer->setContent("");
        $answer->setCreatedAt(new \DateTimeImmutable());
        $entityManager->persist($answer);
        $entityManager->flush();

        return $response->send();
    }
}