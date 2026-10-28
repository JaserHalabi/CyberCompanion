@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title CyberCompanion build
echo [%date% %time%] START > build.log
set "NODEDIR="
where node >nul 2>&1 && for /f "delims=" %%i in ('where node') do if not defined NODEDIR set "NODEDIR=%%~dpi"
if not defined NODEDIR for %%d in ("%ProgramFiles%\nodejs" "%ProgramFiles(x86)%\nodejs" "%LOCALAPPDATA%\Programs\nodejs" "%APPDATA%\nvm" "%NVM_SYMLINK%" "%LOCALAPPDATA%\fnm_multishells" "%USERPROFILE%\scoop\apps\nodejs\current" "%LOCALAPPDATA%\Volta\bin" "C:\nodejs") do if not defined NODEDIR if exist "%%~d\node.exe" set "NODEDIR=%%~d\"
if not defined NODEDIR for /d %%d in ("%APPDATA%\nvm\v*") do if exist "%%d\node.exe" set "NODEDIR=%%d\"
if not defined NODEDIR for /f "delims=" %%i in ('dir /s /b "%USERPROFILE%\node.exe" 2^>nul') do if not defined NODEDIR set "NODEDIR=%%~dpi"
if not defined NODEDIR for /f "delims=" %%i in ('dir /s /b "%ProgramFiles%\node.exe" 2^>nul') do if not defined NODEDIR set "NODEDIR=%%~dpi"
if not defined NODEDIR (
  echo Node.js not found - installing LTS via winget... >> build.log
  echo Installing Node.js LTS ^(approve the Windows prompt if it appears^)...
  winget install -e --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements >> build.log 2>&1
  for %%d in ("%ProgramFiles%\nodejs" "%ProgramFiles(x86)%\nodejs" "%LOCALAPPDATA%\Programs\nodejs") do if not defined NODEDIR if exist "%%~d\node.exe" set "NODEDIR=%%~d\"
)
if not defined NODEDIR (
  echo Node.js still not found after install attempt. >> build.log
  goto fail
)
echo Using Node at: !NODEDIR! >> build.log
set "PATH=!NODEDIR!;%PATH%"
call npm install >> build.log 2>&1
if errorlevel 1 goto fail
call npm run dist >> build.log 2>&1
if errorlevel 1 goto fail
echo [%date% %time%] BUILD-OK >> build.log
echo Done. The installer is in the dist folder.
timeout /t 15
exit /b 0
:fail
echo [%date% %time%] BUILD-FAILED >> build.log
echo Build failed - see build.log
pause
