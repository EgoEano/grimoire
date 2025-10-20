@echo on
chcp 65001

cd /d %~dp0
REM npm run dev2 > log_dev2.txt 2>&1
npm run dev2

pause