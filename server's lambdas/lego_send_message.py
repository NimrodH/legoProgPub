import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.getenv('CONNECTIONS_TABLE'))

def lambda_handler(event, context):
    print("Event:", event)
    body = json.loads(event['body'])

    user_id = body['userId']
    start_auto_color = body['startAutoColor']
    seconds_offered = body['secondsOffered']
    part1_time = body['part1Time']
    print("before try")
    try:
        print("before update_table_with_seconds_offered")
        update_table_with_seconds_offered(user_id, start_auto_color, seconds_offered, part1_time)
        print("after update_table_with_seconds_offered")
        my_connection_info = get_my_pair_info(user_id, start_auto_color)
        print("after my_connection_info")
        pair_info = get_pair_info(my_connection_info['myPair'], my_connection_info['pairAutoColor'])
        print("before if not pair_info")
        if not pair_info['pairSecondsOffered']:
            return respond_with_message('pair is still playing', 'wait')
        print("after if not pair_info")
        do_deal = calculate_deal(start_auto_color, seconds_offered, pair_info['pairSecondsOffered'])
        print("before update_deal_done")
        update_deal_done(user_id, start_auto_color, do_deal)
        print("after update_deal_done")
        #if pair_info['pairLive'] and pair_info['pairSecondsOffered']: ################
        if pair_info['pairSecondsOffered']:
            print("in if pairSecondsOffered")
            update_deal_done(my_connection_info['myPair'], my_connection_info['pairAutoColor'], do_deal)

        response_body = create_response_body(do_deal, pair_info['pairSecondsOffered'], seconds_offered)
        print("after create_response_body")
        #send_message_to_clients(my_connection_info['myConnectionId'], pair_info['pairConnectionId'], pair_info['pairLive'], response_body)#############
        send_message_to_clients(my_connection_info['myConnectionId'], pair_info['pairConnectionId'], False, response_body)
        print("after send_message_to_clients")
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Message sent successfully'})
        }
    except Exception as error:
        print('Exception Error:', error)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Failed to process request'})
        }

def update_table_with_seconds_offered(user_id, start_auto_color, seconds_offered, part1_time):
    params = {
        'TableName': os.getenv('CONNECTIONS_TABLE'),
        'Key': {'ID': user_id, 'startAutoColor': start_auto_color},
        'UpdateExpression': 'set secondsOffered = :seconds, part1Time = :part1Time',
        'ExpressionAttributeValues': {':seconds': seconds_offered, ':part1Time': part1_time},
        'ReturnValues': 'ALL_NEW',
    }
    print("update_table_with_seconds_offered1")
    table.update_item(**params)
    print("update_table_with_seconds_offered2")

def get_my_pair_info(user_id, start_auto_color):
    params = {
        'TableName': os.getenv('CONNECTIONS_TABLE'),
        'Key': {'ID': user_id, 'startAutoColor': start_auto_color},
    }
    response = table.get_item(**params)
    if 'Item' not in response:
        raise Exception('Item not found')

    my_connection_id = response['Item']['connectionId']
    my_pair = response['Item']['myPairId']
    pair_auto_color = 'NO' if start_auto_color == 'YES' else 'YES'
    return {'myConnectionId': my_connection_id, 'myPair': my_pair, 'pairAutoColor': pair_auto_color}

def get_pair_info(my_pair, pair_auto_color):
    params = {
        'TableName': os.getenv('CONNECTIONS_TABLE'),
        'Key': {'ID': my_pair, 'startAutoColor': pair_auto_color},
        'ConsistentRead': True
    }
    response = table.get_item(**params)
    print("response", response)
    #todo: if not such record other not started
    #    if no secondsOffered in response other not finish yet (and maybe not connected any more?)
    if 'Item' not in response:
        raise Exception('Item_pair not found')

    pair_connection_id = response['Item']['connectionId']
    pair_seconds_offered = response['Item']['secondsOffered']
    pair_live = True #is_connection_live(pair_connection_id) ###########
    if not pair_live:
        raise Exception('pair is not connected anymore')

    return {'pairConnectionId': pair_connection_id, 'pairSecondsOffered': pair_seconds_offered, 'pairLive': pair_live}

def calculate_deal(start_auto_color, seconds_offered, pair_seconds_offered):
    if start_auto_color == 'YES':
        return int(seconds_offered) <= int(pair_seconds_offered)
    else:
        return int(seconds_offered) >= int(pair_seconds_offered)

def update_deal_done(user_id, start_auto_color, do_deal):
    params = {
        'TableName': os.getenv('CONNECTIONS_TABLE'),
        'Key': {'ID': user_id, 'startAutoColor': start_auto_color},
        'UpdateExpression': 'set dealDone = :deal',
        'ExpressionAttributeValues': {':deal': do_deal},
        'ReturnValues': 'ALL_NEW',
    }
    table.update_item(**params)

def create_response_body(do_deal, pair_seconds_offered, my_seconds_offered):
    return {
        'message': 'deal results are ' + str(do_deal),
        'ansStatus': 'continue',
        'isdealDone': do_deal,
        'pairSecondsOffered': pair_seconds_offered,
        'mySecondsOffered': my_seconds_offered
    }

def send_message_to_clients(my_connection_id, pair_connection_id, pair_live, response_body):##############
    apigatewaymanagementapi = boto3.client('apigatewaymanagementapi', endpoint_url=os.getenv('API_GATEWAY_ENDPOINT'))
    print("apigatewaymanagementapi", apigatewaymanagementapi)
    print("response_body", response_body)
    print("my_connection_id", my_connection_id)
    if my_connection_id:
        print("in my_connection_id: ", my_connection_id )
        apigatewaymanagementapi.post_to_connection(
            ConnectionId=my_connection_id,
            Data=json.dumps(response_body)
        )
    if pair_live and pair_connection_id:
        print("in pair_connection_id")
        apigatewaymanagementapi.post_to_connection(
            ConnectionId=pair_connection_id,
            Data=json.dumps(response_body)
        )

def send_to_one_client(client_connection_id, response_body, ):
    apigatewaymanagementapi = boto3.client('apigatewaymanagementapi', endpoint_url=os.getenv('API_GATEWAY_ENDPOINT'))
    print("in send_to_one_client: ", client_connection_id )
    apigatewaymanagementapi.post_to_connection(
        ConnectionId=client_connection_id,
        Data=json.dumps(response_body)
    )


def respond_with_message(message, status):
    return {
        'statusCode': 200,
        'body': json.dumps({'message': message, 'ansStatus': status}),
    }

################
def is_connection_live(connection_id):
    apigatewaymanagementapi = boto3.client('apigatewaymanagementapi', endpoint_url=os.getenv('API_GATEWAY_ENDPOINT'))

    try:
        # Attempt to send a ping message to the connection
        apigatewaymanagementapi.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps({ 'type': 'ping' })  # Sending a simple "ping" message
        )

        # If no error, the connection is live
        return True
    except apigatewaymanagementapi.exceptions.GoneException:
        # 410 Gone indicates the connection is no longer present
        print(f'Connection {connection_id} is no longer live. (server ERROR will be seen on client and its not a problem ).')
        return False
    except Exception as err:
        # Handle other potential errors
        print(f'Failed to send ping to connection {connection_id}:', err)
        raise err