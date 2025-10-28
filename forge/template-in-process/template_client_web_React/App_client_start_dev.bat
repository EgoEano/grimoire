@echo on
chcp 65001

cd /d %~dp0
@REM npm run client:start:dev > log_client_start_dev.txt 2>&1
npm run client:start:dev

pause