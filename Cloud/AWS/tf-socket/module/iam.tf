resource "aws_iam_role" "ecs_role" {
  name = "ecs_role_slack_skb"

  inline_policy {
    name = "my_inline_policy"

    policy = jsonencode({
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "s3:GetObject"
          ],
          "Resource": [
            "${aws_s3_bucket.slack_skb_bucket.arn}/en.env"
          ]
        },
        {
          "Effect": "Allow",
          "Action": [
            "s3:GetBucketLocation"
          ],
          "Resource": [
            "${aws_s3_bucket.slack_skb_bucket.arn}"
          ]
        },
        {
            "Effect": "Allow",
            "Action": "dynamodb:*",
            "Resource": "${aws_dynamodb_table.slack_skb_db.arn}:table/${aws_dynamodb_table.slack_skb_db.id}"
        }
      ]
    })
  }

  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
POLICY
}

resource "aws_iam_role_policy_attachment" "ecs_policy_attachment" {
  role = "${aws_iam_role.ecs_role.name}"

  // This policy adds logging + ecr permissions
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
