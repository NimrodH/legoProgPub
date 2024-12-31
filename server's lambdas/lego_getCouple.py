import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.getenv('TABLE_NAME'))

def lambda_handler(event, context):
    query_params = event.get('queryStringParameters', {})
    key = query_params.get('userID')  # Assuming 'key' is a query parameter

    try:
        response = table.get_item(Key={'ID': key})
        item = response.get('Item', {})
        return {
            'statusCode': 200,
            'body': json.dumps(item)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Failed to fetch data', 'error': str(e)})
        }