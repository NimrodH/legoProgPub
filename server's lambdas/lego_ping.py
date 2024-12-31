# called by route: ping
import json
import boto3
import os
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
dynamodb_client = boto3.client('dynamodb')
apigatewaymanagementapi = boto3.client('apigatewaymanagementapi', endpoint_url=os.getenv('API_GATEWAY_ENDPOINT'))


def lambda_handler(event, context):
    # Parse the incoming message
       # if we want to return a message to the user, we need explicitly to send a response not just return
    connection_id = event['requestContext']['connectionId']
    the_body = { "action" : "pong", "connection_id" : connection_id , "ansStatus" : "pong"}
    send2client(connection_id, the_body)
    return {
        'statusCode': 200,
        'body': json.dumps({'type': 'pong'})
    }

def send2client(connection_id, the_body):
    if connection_id:
        try:
            response = apigatewaymanagementapi.post_to_connection(
                ConnectionId=connection_id,
                Data=json.dumps(the_body)
            )
            return {'statusCode': 200, 'body': json.dumps({'message': 'Message sent successfully'})}
        except ClientError as error:
            print('Error sending message: %s', error)
            return {'statusCode': 500, 'body': json.dumps({'message': 'Failed to send message'})}

 
