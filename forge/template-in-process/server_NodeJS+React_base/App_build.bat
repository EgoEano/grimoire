@echo on
chcp 65001

cd /d %~dp0
npm run build > log_build.txt 2>&1

pause