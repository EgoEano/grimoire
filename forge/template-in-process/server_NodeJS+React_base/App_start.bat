@echo on
chcp 65001

cd /d %~dp0
REM npm run start > log_start.txt 2>&1
npm run start

pause