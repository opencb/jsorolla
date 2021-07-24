# NOT USED AT THE MOMENT

# this is not safe as if a test fails .CYPRESS_study file won't be deleted, and in case in the following run of tests the user doesn't define the study the report will end up having inconsistent name
if [[ -f .CYPRESS_study ]];then
    value=$(<.CYPRESS_study)
    echo "exists VALUE: $value"
    .rm .CYPRESS_study
else
    echo "doesn't exist"
fi

marge --reportDir ./report mochawesome-report/cypress-combined-report.json --reportFilename report.html
