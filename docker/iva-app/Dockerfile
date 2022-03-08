FROM httpd:2.4-bullseye

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

## Update and create iva user
RUN apt-get update && apt-get -y upgrade && apt-get install -y vim jq && \
    rm -rf /var/lib/apt/lists/* && \
    adduser --disabled-password jsorolla

## Run Docker images as non root
USER jsorolla

## Allow to build different images by passing the path to the SITE
ARG     SITE=src/sites

## Copy files
COPY    --chown=jsorolla:jsorolla   ./build/iva                         /usr/local/apache2/htdocs/iva
COPY    --chown=jsorolla:jsorolla   ./$SITE/iva/conf                    /usr/local/apache2/htdocs/iva/conf/
COPY    --chown=jsorolla:jsorolla   ./$SITE/iva/img                     /usr/local/apache2/htdocs/iva/img/

#COPY    --chown=jsorolla:jsorolla   ./build/api                         /usr/local/apache2/htdocs/api
#COPY    ./build/genome-maps                 /usr/local/apache2/htdocs/genome-maps

#EXPOSE 80

ENTRYPOINT ["httpd-foreground"]
