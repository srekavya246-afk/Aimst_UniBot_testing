@echo off
title AIMST UniBot Server
cd /d "%~dp0"
echo ===================================================
echo Starting AIMST UniBot Server...
echo ===================================================
node backend/server.js
pause
