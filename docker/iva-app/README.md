# How to update this docker

If you want to update the base image https://hub.docker.com/_/httpd , it is necesary repeat this steps

To customize the configuration of the httpd server, first obtain the upstream default configuration from the container:

```bash
docker run --rm httpd:2.4-bullseye cat /usr/local/apache2/conf/httpd.conf > ./docker/iva-app/custom-httpd.conf
```

And then change custom-httpd.conf 

```
Listen 8080
```


