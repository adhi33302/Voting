@echo off
echo ===========================================
echo 🚀 STARTING BLOCKCHAIN VOTING SYSTEM
echo ===========================================

echo.
echo [1/2] Starting Backend Server...
start cmd /k "title VOTING-BACKEND && cd backend && node server.js"

echo [2/2] Starting Voter Frontend...
start cmd /k "title VOTER-FRONTEND && npm run dev"

echo.
echo ✅ All systems are starting in separate windows.
echo - Backend: http://localhost:5000
echo - Voter App: Check terminal output
echo.
timeout /t 10

