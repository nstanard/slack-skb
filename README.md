# slack-skb
Simple Karma Bot

## Slack.com Setup Steps

 - Create a new slack app using the following manifest:
 ```
 display_information:
  name: Simple Karma Bot
  description: Keeping track of team collaboration and thanks.
  background_color: "#000000"
features:
  bot_user:
    display_name: Simple Karma Bot
    always_online: true
oauth_config:
  scopes:
    bot:
      - channels:history
      - chat:write
      - chat:write.customize
      - groups:history
      - users:read
settings:
  event_subscriptions:
    bot_events:
      - message.channels
      - message.groups
  interactivity:
    is_enabled: true
  org_deploy_enabled: false
  socket_mode_enabled: true
  token_rotation_enabled: false
 ```

 - Create an app level token with `connections:write` 

## Environment Variables

Create a file called `.env` with the following variables:
```
SLACK_SIGNING_SECRET=<KEY_HERE>
SLACK_BOT_TOKEN=<KEY_HERE>
SLACK_APP_TOKEN=<KEY_HERE>
```

_You can find these secret values in the [slack api app settings](https://api.slack.com/apps/)_

### Docs

 - https://slack.dev/bolt-js/concepts

 - https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html
 - https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html
 - https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#putItem-propertyc
 - https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/dynamodb_table


### Learning Material

 - https://www.youtube.com/watch?v=rUIptoPXu_8
