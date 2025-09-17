import json, os, base64, boto3

table = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])

def _parse_body(event): 
    body = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        body = base64.b64decode(body).decode("utf-8")
    return json.loads(body)

def _resp(status, payload, with_cors=False):
    headers = {"Content-Type": "application/json"}
    if with_cors:  # only needed if you didn’t enable CORS at the Function URL
        headers.update({
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
        })
    return {"statusCode": status, "headers": headers, "body": json.dumps(payload)}

def lambda_handler(event, context):
    method = (event.get("requestContext", {}).get("http", {}) or {}).get("method", "POST")
    if method == "OPTIONS":
        return _resp(200, {"ok": True})

    try:
        body = _parse_body(event)
        action = body.get("action")

        user_id = str(body["userId"])
        start_auto = str(body.get("startAutoColor", "NO"))  # sort key is required

        if action == "initUser":
            # Overwrite/insert whole item
            item = {
                "ID": user_id,
                "startAutoColor": start_auto,
                "group": body.get("group"),
            }
            table.put_item(Item=item)
            return _resp(200, {"message": "initUser: item created/overwritten", "item": item})

        else:
            # Default branch: partial update (e.g., "updateItem")
            skip_keys = {"action", "userId", "startAutoColor"}
            updates = {k: v for k, v in body.items() if k not in skip_keys}

            if not updates:
                return _resp(400, {"message": "No attributes to update"})

            expr_names, expr_values, set_parts = {}, {}, []
            for i, (k, v) in enumerate(updates.items()):
                nk, nv = f"#k{i}", f":v{i}"
                expr_names[nk] = k
                expr_values[nv] = v
                set_parts.append(f"{nk} = {nv}")

            update_expr = "SET " + ", ".join(set_parts)

            resp = table.update_item(
                Key={"ID": user_id, "startAutoColor": start_auto},
                UpdateExpression=update_expr,
                ExpressionAttributeNames=expr_names,
                ExpressionAttributeValues=expr_values,
                ReturnValues="ALL_NEW"
            )
            return _resp(200, {"message": "updateItem: item updated", "updated": resp.get("Attributes")})

    except Exception as e:
        return _resp(500, {"message": "Failed to process", "error": str(e)})
