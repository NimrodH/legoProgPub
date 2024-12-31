#called by route: $Disconnect

import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')
dynamodb_client = boto3.client('dynamodb')

def lambda_handler(event, context):
    connection_id = event['requestContext']['connectionId']
    #table_name = os.getenv('TABLE_NAME')

    print('disconnecting  - we dont remove the record')

    return {
        'statusCode': 200,
        'body': 'Disconnected.'
    }