#!/bin/bash

echo -n "Enter your Opencga Username [ENTER]: "
read username
stty -echo
printf "Enter your Opencga Password [ENTER]: "
read password
stty echo
echo -en "\nEnter the FQN of the Study you want to test (leave empty for default) [ENTER]: "
read study

# echo $study > CYPRESS_study

CYPRESS_username=$username CYPRESS_password=$password CYPRESS_study=$study "$@"
