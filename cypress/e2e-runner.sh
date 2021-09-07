#!/bin/bash
# @file test_runner.sh
# @brief This script launches IVA e2e tests over one or more Opencga studies
# @description
#
# Options:
# -u     Opencga username.
# -s     Comma-separated list of studies.
# -h     Prints command description
#
# It takes Opencga username, password, and a comma-separated list of studies (either via params or prompt)

#declare -a studies=(
#  "re-opencgahadoop@100k_genomes_grch37_germline:RD37"
#  "re-opencgahadoop@100k_genomes_grch38_germline:RD38"
#  "re-opencgahadoop@100k_genomes_grch38_germline:CG38"
#  "re-opencgahadoop@100k_genomes_grch38_somatic:CS38"
#  )

function Help () {
    cat <<TEXT
 Usage: $0 [-u <USERNAME>] [-s <STUDIES>]
 Launches IVA e2e tests over one or more Opencga studies.
 Options:
 -u     Opencga username.
 -s     Comma-separated list of studies.
 -h     Prints command description
TEXT
}


while getopts :u:s:h opts; do
   case ${opts} in
      u)  username=${OPTARG} ;;
      s)  studies=${OPTARG} ;;
      h)  Help "$@"
          exit 0;;
      *) ;;
   esac
done

if test ! $username; then
  # if username not defined as opt
  echo -n "Enter your Opencga Username [ENTER]: "
  read username
fi

# set password
stty -echo
printf "Enter your Opencga Password [ENTER]: "
read password
stty echo

if test ! "$studies"; then
  # if studies not defined as opt (comma separated)
  echo -en "\nEnter the FQN (comma separated) of the studies you want to test (leave empty for default) [ENTER]: "
  read str_studies
  readarray -d , -t studies<<<"$str_studies"
fi

# iterate over studies and run the test defined in --spec
export CYPRESS_username=$username
export CYPRESS_password=$password
for study in "${studies[@]}"
do
  echo "$study"
  rm -rf mochawesome-report/ && \
  CYPRESS_study="$study" npx cypress run --config videosFolder="cypress/videos/$study",screenshotsFolder="cypress/screenshots/$study" --headless --spec 'cypress/integration/002-login.js';  \
  npx mochawesome-merge mochawesome-report/*.json -o mochawesome-report/cypress-combined-report.json && \
  npx marge --reportFilename "$study".html --charts --timestamp _HH-MM_dd-mm-yyyy --reportPageTitle "IVA $study" --reportTitle "IVA study: $study" --reportDir ./report mochawesome-report/cypress-combined-report.json && \
  rm -rf mochawesome-report/
done
spd-say 'end to end test completed'
