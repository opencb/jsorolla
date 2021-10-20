FROM httpd:2.4-alpine

## To run the docker use:
## docker build -f ./docker/iva-app/Dockerfile -t iva-httpd .
## docker run -dit --name iva -p 81:80 -v  [ABS_PATH]/iva/build/conf/:/usr/local/apache2/htdocs/iva/conf opencb/iva-app
## Then open:  http://localhost:81/iva

LABEL org.label-schema.vendor="OpenCB" \
      org.label-schema.name="iva" \
      org.label-schema.url="http://docs.opencb.org/display/iva" \
      org.label-schema.description="An open-source web app for interactive variant analysis" \
      maintainer="Antonio Altamura <antonioaltamura7@gmail.com>" \
      org.label-schema.schema-version="1.0"

## Create and change user
#RUN addgroup -S iva && adduser -S iva -G iva
#USER iva

## Allow to build different images by passing the path to the SITE
ARG     SITE=src/sites

## Copy files
#COPY    ./docker/iva-app/entrypoint.sh      /usr/local/bin
COPY    ./build/iva                         /usr/local/apache2/htdocs/iva
COPY    ./$SITE/iva/conf                    /usr/local/apache2/htdocs/iva/conf/
COPY    ./$SITE/iva/img                     /usr/local/apache2/htdocs/iva/img/

EXPOSE 80

#ENTRYPOINT ["entrypoint.sh", "httpd-foreground"]
ENTRYPOINT ["httpd-foreground"]
