# Development

## How to Publish?

```sh
$ npm config set @arcloud:registry https://gitlab.ar.local/api/v4/packages/npm/
$ npm config set -- '//gitlab.ar.local/api/v4/packages/npm/:_authToken' "$GITLAB_ACCESS_TOKEN"
$ npm config set -- '//gitlab.ar.local/api/v4/projects/333/packages/npm/:_authToken' "$GITLAB_ACCESS_TOKEN"     
$ npm config set strict-ssl false
$ npm publish  
```