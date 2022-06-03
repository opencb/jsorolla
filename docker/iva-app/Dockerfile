FROM httpd:2.4-bullseye

## To run the docker use:
## docker build -f ./docker/iva-app/Dockerfile -t iva-httpd .
## docker run --name jsorolla -p 8888:80 opencb/iva-app
## Then open:  http://localhost:8888/iva o http://localhost:8888/api

LABEL org.label-schema.vendor="OpenCB" \
      org.label-schema.name="iva" \
      org.label-schema.url="http://docs.opencb.org/display/iva" \
      org.label-schema.description="An open-source web app for interactive variant analysis" \
      maintainer="Ignacio Medina <ignacio.medina@zettagenomics.com>" \
      org.label-schema.schema-version="1.0"

## Update and create iva user
RUN apt-get update && apt-get -y upgrade && \
    apt-get install -y vim jq && \
    rm -rf /var/lib/apt/lists/*

## Allow to build different images by passing the path to the SITE
ARG     SITE=src/sites

## Copy files
## IVA
COPY    ./build/iva                 /usr/local/apache2/htdocs/iva
COPY    ./${SITE}/iva/conf          /usr/local/apache2/htdocs/iva/conf/
COPY    ./${SITE}/iva/img           /usr/local/apache2/htdocs/iva/img/

RUN true

## API
COPY    ./build/api                 /usr/local/apache2/htdocs/api
COPY    ./${SITE}/api/conf          /usr/local/apache2/htdocs/api/conf/
COPY    ./${SITE}/api/img           /usr/local/apache2/htdocs/api/img/

## Genome Maps (Coming soon  :-) )
#COPY    ./build/genome-maps                 /usr/local/apache2/htdocs/genome-maps

ENTRYPOINT ["httpd-foreground"]
