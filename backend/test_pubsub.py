from google.cloud import pubsub_v1
import os

def test_pubsub_emulator():
    # Ensure that it is using the emulator
    os.environ["PUBSUB_EMULATOR_HOST"] = "localhost:8085"
    os.environ["PUBSUB_PROJECT_ID"] = "local-project"

    publisher = pubsub_v1.PublisherClient()
    subscriber = pubsub_v1.SubscriberClient()

    project_id = os.getenv("PUBSUB_PROJECT_ID")
    topic_id = "test-topic"
    subscription_id = "test-subscription"

    topic_path = publisher.topic_path(project_id, topic_id)
    subscription_path = subscriber.subscription_path(project_id, subscription_id)

    # 1. Create a topic
    try:
        topic = publisher.create_topic(request={"name": topic_path})
        print(f"Created topic: {topic.name}")
    except Exception as e:
        print(f"Error creating topic (might already exist): {e}")

    # 2. Create a subscription
    try:
        subscription = subscriber.create_subscription(
            request={"name": subscription_path, "topic": topic_path}
        )
        print(f"Created subscription: {subscription.name}")
    except Exception as e:
        print(f"Error creating subscription (might already exist): {e}")

    # 3. Publish a message
    future = publisher.publish(topic_path, b"Hello, Pub/Sub Emulator!")
    message_id = future.result()
    print(f"Published message with ID: {message_id}")

    # 4. Pull the message to confirm it works
    response = subscriber.pull(
        request={"subscription": subscription_path, "max_messages": 1}
    )

    if not response.received_messages:
        print("No messages received.")
    else:
        for received_message in response.received_messages:
            print(f"Received: {received_message.message.data.decode('utf-8')}")
            subscriber.acknowledge(
                request={"subscription": subscription_path, "ack_ids": [received_message.ack_id]}
            )

if __name__ == "__main__":
    test_pubsub_emulator()
