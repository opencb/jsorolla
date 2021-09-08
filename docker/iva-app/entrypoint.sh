#!/bin/bash

#echo "total args:" $#
#echo "first:" $1
#echo "second:" $2
#sed -i 's/host:".*"/host: "val" /g' /usr/local/apache2/htdocs/iva/conf/conf.js

# launch command (httpd-foreground)
cmd=$1
shift

for i in "${@}"; do
   case $i in
      --host=*)
         echo host ${i##--host=}
         echo "opencga.host = ${i##--host=};" >> /usr/local/apache2/htdocs/iva/conf/config.js
         shift 2
         ;;
      -*|--*)
        echo "Fatal error. Unknown option $i. "
        exit
        ;;
   esac
done

exec "$cmd"
