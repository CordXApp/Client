## Self Hosting (Developers Only)

### Env Variables
Our environment variables play a vital role in the application and as such are needed/required for its operation (even in development)
to get started here you should rename the `temp.env` file to `.env` and fill in its necessary values.

| NAME              | TYPE                     | DESCRIPTION                                                                           |
|-------------------|--------------------------|---------------------------------------------------------------------------------------|
| TOKEN             | STRING                   | Discord Bot/App Token                                                                 |
| UR_API_KEY        | STRING                   | Uptime Robot API Key                                                                  |
| MYSQL_URI         | STRING                   | MySQL Database Connection URL                                                         |
| PUBLIC_KEY        | STRING                   | Instatus Public API Key                                                               |
| ENCRYPTION_KEY    | STRING                   | Private key used for the encryption/decryption process                                |
| GH_TOKEN          | STRING                   | Github API Token                                                                      |
| SPACES_KEY        | STRING                   | Bucket API Key                                                                        |
| SPACES_SECRET     | STRING                   | Bucket API Secret                                                                     |
| DEV_SECRET        | STRING                   | Discord Client Secret                                                                 |
| DEV_REDIRECT      | STRING                   | Discord Auth Redirect URI                                                             |
| PROXY_TOKEN       | STRING                   | CordX Proxy Token (used for our gateway proxy)                                        |

- The token should be a valid discord bot/application token.
- The proxy token should only ever be needed if you are updating our Upload API
- The encryption key is expected to be a 32 byte hex string.
- The uptime robot api key should not be needed in most cases.
- The public key should not be needed in most cases.
- The github api token should not be needed in most cases.

---

### Important Info
- **PLEASE DO NOT EVER MODIFY THE .gitignore FILE TO PUSH THE ENV FILE TO OUR REPOSITORY, THIS IS A HUGE SECURITY RIKS**