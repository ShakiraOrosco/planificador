@echo off
title Planificador Kanban y Calendario
echo =======================================================
echo   Iniciando Planificador Kanban con Google Drive...
echo =======================================================
cd /d "%~dp0"
call npm.cmd run dev
pause
