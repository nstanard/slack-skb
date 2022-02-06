resource "aws_s3_bucket" "slack_skb_bucket" {
  bucket = "slack-skb-env-vars"
  acl    = "private"

  tags = {
    Name        = "Slack-SKB" # make variable later
  }
}

# Upload an object
resource "aws_s3_bucket_object" "env" {
  bucket = aws_s3_bucket.slack_skb_bucket.id
  key    = "en.env"
  acl    = "private"
  source = "../../../.env"
  etag = filemd5("../../../.env")
}
