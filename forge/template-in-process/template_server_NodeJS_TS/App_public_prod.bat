:: 0. Init settings
@echo off
chcp 65001 >nul
cd /d %~dp0

set LOG=log_app_build.txt
echo Starting build... > %LOG%

:: 1.1 Compile client code into public
echo Building client...
cmd /c "npm run client:build:prod > log_client_build_prod.txt 2>&1"
:: Result checking
if %ERRORLEVEL% neq 0 (
    echo 0 - public:client:build > log_app_build.txt
    exit /b 1
)

:: 1.3 TypeScript → JavaScript compilation
if not exist dist mkdir dist
echo Compiling TypeScript...
cmd /c "npx tsc > log_server_tsc.txt 2>&1"
if %ERRORLEVEL% neq 0 (
    echo 0 - public:server:tsc > log_app_build.txt
    exit /b 1
)

:: 1.4 Compile server code in one file (index.js)

@REM ТУТ ПРОБЛЕМА В ИМЕНАХ server.js И index.js - НУЖНО ПОМЕНЯТЬ ИМЕНА ГРАМОТНО У ВСЕХ
echo Building server...
cmd /c "npx @vercel/ncc build dist/server.js -o dist --external dotenv --external bcrypt > log_server_build.txt 2>&1"
if %ERRORLEVEL% neq 0 (
    echo 0 - public:server:build > log_app_build.txt
    exit /b 1
)

:: 2.1 Minifying server code
echo Minifying server...
cmd /c "npx esbuild dist/index.js --format=esm --outfile=dist/index.min.js --keep-names --minify-syntax --minify-whitespace --minify-identifiers > log_server_minify.txt 2>&1"
if %ERRORLEVEL% neq 0 (
    echo 0 - public:server:minifying > log_app_build.txt
    exit /b 1
)

:: 2.2 Obfuscating server code
echo Obfuscating server...
cmd /c "npx javascript-obfuscator dist/index.min.js --output dist/server.js --self-defending true --compact true > log_server_obfuscate.txt 2>&1"
if %ERRORLEVEL% neq 0 (
    echo 0 - public:server:obfuscating > log_app_build.txt
    exit /b 1
)

:: 3.1 Deleting temp files
del /f /q dist\index.js 2>nul
del /f /q dist\index.min.js 2>nul

:: 3.2 Copying client build into dist
if exist dist\public rd /s /q dist\public
xcopy /E /I /Y public dist\public

:: 3.3 Очистка и копирование и sec/
:: 3.3 Cleansing and copying sec/
::if exist dist\sec rd /s /q dist\sec
::xcopy /E /I /Y sec dist\sec

:: 4. Final
echo 1 - public:success > log_app_build.txt 2>&1
timeout /t 5 /nobreak >nul