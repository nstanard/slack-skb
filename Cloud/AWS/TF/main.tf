variable "repo_url" {
   type = string
   description = "(optional) describe your variable"
}

module "slack-skb-ecs" {
   source = "./module"
   
   region  = "us-east-1"
   profile = "NealStanard"
   repo_url= "${var.repo_url}"
}
