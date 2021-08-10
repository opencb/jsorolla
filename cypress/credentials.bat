@echo off
    setlocal enableextensions disabledelayedexpansion

rem set the username using a plain prompt
	SET /p CYPRESS_username=Enter your Opencga Username [ENTER]:
rem Call the subroutine to get the password
    call :getPassword CYPRESS_password
rem set the study using a plain prompt
	SET /p CYPRESS_study=Enter the FQN of the Study you want to test (leave empty for default) [ENTER]:

rem Echo what the function returns
    if defined CYPRESS_password (
        SET CYPRESS_password=%CYPRESS_password%
		rem it launches whatever is passed to the script as param
		%*
    ) else (
        echo Password must be defined
    )

rem End of the process
    endlocal
    exit /b


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
