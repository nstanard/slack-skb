resource "aws_dynamodb_table" "slack_skb_db" {
  name             = "slack-skb-db"
  hash_key         = "id"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  table_class = "STANDARD_INFREQUENT_ACCESS"

  attribute {
    name = "id"
    type = "S"
  }

  # attribute {
  #   name = "karma"
  #   type = "N"
  # }

  tags = {
    Name        = "slack-skb-table"
  }
}
