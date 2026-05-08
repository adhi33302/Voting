@echo off
echo Starting Blockchain Voting System...
start cmd /k "cd backend && node server.js"
start cmd /k "npm run dev"
echo Backend and Frontend or starting in separate windows.
echo If you get a PowerShell error, try running: cmd /c npm run dev
timeout /t 5
