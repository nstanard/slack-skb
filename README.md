# slack-skb
Simple Karma Bot



## Notes

https://www.quora.com/What-kind-of-lightweight-database-would-be-easiest-to-bundle-and-install-within-a-Node-js-NPM-module

> It seems like the best thing to do might be to bundle pre-compiled binaries for a database in the NPM module. SQLite is 2MB. 
> Then when the user installs the NPM module on their machine you don't have to download the binaries from the web. 
> With SQLite being portable and easy to install, it should be possible to write Node.js code to run the binaries and install SQLite locally if it is not already installed on Windows, Mac, and *nix.
