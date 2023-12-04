<?php

namespace App\DataFixtures;

use App\Entity\Chat;
use App\Entity\Message;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create();

        for ($i = 1; $i <= 5; $i++) {
            $chat = new Chat();
            $chat->setTitle('chat #'.$i);
            $chat->setCreatedAt(new \DateTimeImmutable());
            $manager->persist($chat);

            for($j = 0; $j < 10; $j++) {
                $message = new Message();
                $message->setChat($chat);
                $message->setRole($j % 2 == 0? 'assistant' : 'user');
                $message->setContent($faker->text());
                $message->setCreatedAt(new \DateTimeImmutable());
                $manager->persist($message);
            }

            $manager->flush();
        }


    }
}
