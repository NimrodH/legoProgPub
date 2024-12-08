import json

def lambda_handler(event, context):
    # Parse the incoming message
    body = json.loads(event['body'])
    
    # Check if the message is a ping
    if body.get('action') == 'ping':
        # Respond with a pong message
        return {
            'statusCode': 200,
            'body': json.dumps({'type': 'pong'})
        }
    

    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Unknown message received'})
    }