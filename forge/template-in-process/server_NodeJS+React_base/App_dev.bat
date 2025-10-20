@echo on
chcp 65001

cd /d %~dp0
npm run dev > log_dev.txt 2>&1
REM npm run dev

pause