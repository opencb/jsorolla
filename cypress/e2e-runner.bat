@echo off
setlocal EnableExtensions EnableDelayedExpansion

rem This script launches IVA e2e tests over one or more Opencga studies in Windows env
rem Params:
rem -u     Opencga username.
rem -s     Comma-separated list of studies. Please wrap the list in quotes in case of more that one study
rem -h     Prints command description
rem
rem If -u (username) and -s (studies) params are not provided, it prompts for Opencga username, password, and a comma-separated list of studies


:parse
IF "%~1"=="" GOTO endparse
IF "%~1"=="-u" SET opencgaUser=%~2
IF "%~1"=="-s" SET studies=%~2
IF "%~1"=="-h" call :help & goto :eof
SHIFT
GOTO parse
:endparse

if not defined opencgaUser (
rem set the username using a plain prompt
	SET /p opencgaUser=Enter your Opencga Username [ENTER]:
	if not defined opencgaUser (
		echo Username must be defined
		goto :eof
	)
)

rem Call the subroutine to get the password
call :getPassword opencgaPassword
if not defined opencgaPassword (
	echo Password must be defined
	goto :eof
)

if not defined studies (
rem set the username using a plain prompt
	SET /p studies="Enter the the FQN (comma-separated) of the studies you want to test [ENTER]:"
	if not defined studies (
		echo studies must be defined
		goto :eof
	)
)


rem echo %opencgaUser% - %opencgaPassword% - %studies%

rem Iterate over studies and
for %%a in ("%studies:,=" "%") do (
set tmp=%%~na
set study=!tmp::=!
echo STUDY: %%~a DIR: !study!
rem mkdir !study! && dir !study!
(if exist mochawesome-report rmdir /S/Q mochawesome-report)^
 && call npx cypress run --env username=%opencgaUser%,password=%opencgaPassword%,study=%%~a --config videosFolder="cypress/videos/!study!",screenshotsFolder="cypress/screenshots/!study!" --headless --spec "cypress/integration/*.js"^
 & call npx mochawesome-merge mochawesome-report/*.json -o mochawesome-report/cypress-combined-report.json^
 && call npx marge --reportFilename !study!.html --charts --timestamp _HH-MM_dd-mm-yyyy --reportPageTitle IVA_%%~a --reportTitle IVA__%%~a --reportDir report mochawesome-report/cypress-combined-report.json^
 && (if exist mochawesome-report rmdir /S/Q mochawesome-report)
)

rem End of the process
endlocal
exit /b


:help
setlocal EnableDelayedExpansion
set u="Usage: %~n0%~x0 [-u <USERNAME>] [-s <STUDIES>]"
echo(!~u!
echo Launches IVA e2e tests over one or more Opencga studies.
echo Options:
echo -u     Opencga username.
echo -s     Comma-separated list of studies. Please wrap the list in quotes in case of more that one study
echo -h     Prints command description
endlocal & exit /b 0


rem Subroutine to get the password
:getPassword returnVar
    setlocal enableextensions disabledelayedexpansion
    set "_password="

    rem We need a backspace to handle character removal
    for /f %%a in ('"prompt;$H&for %%b in (0) do rem"') do set "BS=%%a"

    rem Prompt the user
    set /p "=Enter your Opencga Password [ENTER]: " <nul

:keyLoop
    rem retrieve a keypress
    set "key="
    for /f "delims=" %%a in ('xcopy /l /w "%~f0" "%~f0" 2^>nul') do if not defined key set "key=%%a"
    set "key=%key:~-1%"

    rem handle the keypress
    rem     if No keypress (enter), then exit
    rem     if backspace, remove character from password and console
    rem     else add character to password and go ask for next one
    if defined key (
        if "%key%"=="%BS%" (
            if defined _password (
                set "_password=%_password:~0,-1%"
                setlocal enabledelayedexpansion & set /p "=!BS! !BS!"<nul & endlocal
            )
        ) else (
            set "_password=%_password%%key%"
            set /p "=*"<nul
        )
        goto :keyLoop
    )
    echo(
    rem return password to caller
    if defined _password ( set "exitCode=0" ) else ( set "exitCode=1" )
    endlocal & set "%~1=%_password%" & exit /b %exitCode%

