@echo on
chcp 65001

cd /d %~dp0
echo Building client...
cmd /c "npm run client:build:dev > log_client_build_dev.txt 2>&1"
:: Проверяем код завершения
if %ERRORLEVEL% neq 0 (
    echo 0 - public:client:build > log_app_build.txt
    exit /b 1
)