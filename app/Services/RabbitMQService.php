<?php

namespace App\Services;

use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class RabbitMQService
{
    public static function publish(string $queue, array $data)
    {
        $connection = new AMQPStreamConnection(
            'rabbitmq',
            5672,
            'admin',
            'admin'
        );

        $channel = $connection->channel();

        $channel->queue_declare($queue, false, true, false, false);

        $msg = new AMQPMessage(json_encode($data));

        $channel->basic_publish($msg, '', $queue);

        $channel->close();
        $connection->close();
    }
}
