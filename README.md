# slack-skb
Simple Karma Bot

## Slack.com Setup Steps


# Environment Variables

Complete the slack.com setup steps and set the env vars. Create a .env file with the following variables:
```
SLACK_SIGNING_SECRET=<KEY_HERE>
SLACK_BOT_TOKEN=<KEY_HERE>
SLACK_APP_TOKEN=<KEY_HERE>
```

## Docs

 - https://slack.dev/bolt-js/concepts


## Learning Material

 - https://www.youtube.com/watch?v=rUIptoPXu_8


## Socket Mode

### AWS + Terraform + EC2

 - Terraform Managed ECS instance running the js-bolt app via docker
    - REQUIRED: AWS profile/account setup with an IAM user
    - REQUIRED: Generate the secret keys on the IAM user and put them in the ~/.aws/credentials file
    - REQUIRED: Set a ~/.aws/config file with the region
    - TODO: Run bolt app within docker image locally -> with env vars for slack keys
    - TODO: Run terraform commands againts the right AWS profile/account
    - TODO: Create an ec2/ecs instance that runs this docker file
    - TODO: Make the docker image run the bolt app

 - Terraform managed MongoDB instance that the js-bolt app can read/write to/from

### GCloud + Cloud Function

## HTTP Mode

### AWS + Terraform + Lambda

### GCloud + Compute Engine
