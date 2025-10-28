@echo on
chcp 65001

cd /d %~dp0
npm run client:build:prod > log_client_build_prod.txt 2>&1

pause