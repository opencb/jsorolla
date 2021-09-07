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
#"re-opencgahadoop@100k_genomes_grch37_germline:RD37"
#"re-opencgahadoop@100k_genomes_grch38_germline:RD38"
#"re-opencgahadoop@100k_genomes_grch38_germline:CG38"
#"re-opencgahadoop@100k_genomes_grch38_somatic:CS38"
#study=re-opencgahadoop@100k_genomes_grch38_somatic:CS38

CYPRESS_username=$username CYPRESS_password=$password CYPRESS_study=$study "$@"
