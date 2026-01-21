@echo off
echo ===========================================
echo      ZEROTYPE RELEASE BUILD SCRIPT
echo ===========================================
echo.
cd /d "%~dp0"

echo [0/2] Cleaning up previous builds...
taskkill /F /IM zerotype_engine.exe >nul 2>&1
taskkill /F /IM main.exe >nul 2>&1
if exist backend\dist rmdir /s /q backend\dist
if exist backend\build rmdir /s /q backend\build
if exist frontend\dist-electron rmdir /s /q frontend\dist-electron

echo [1/2] Building Python Backend...
cd backend
if exist venv\Scripts\activate (
    call venv\Scripts\activate
) else (
    echo Error: Python venv not found in backend/venv
    pause
    exit /b 1
)

echo Installing requirements...
pip install -r requirements.txt

echo Compiling executable...
python build_exe.py
if %errorlevel% neq 0 (
    echo Error: Backend compilation failed.
    pause
    exit /b %errorlevel%
)
echo Backend compiled successfully.
call deactivate
cd ..
echo.

echo [2/2] Building Electron Frontend & Installer...
cd frontend
echo Installing frontend dependencies...
call pnpm install

echo Building React/Vite app...
call pnpm run build
if %errorlevel% neq 0 (
    echo Error: Frontend build failed.
    pause
    exit /b %errorlevel%
)

echo Packaging with Electron Builder...
call npx electron-builder --win
if %errorlevel% neq 0 (
    echo Error: Electron packaging failed.
    pause
    exit /b %errorlevel%
)

cd ..
echo.
echo [3/3] Finalizing release...
if not exist releases mkdir releases
copy "frontend\dist-electron\Zerotype Setup *.exe" "releases\" /Y

echo.
echo ===========================================
echo      BUILD SUCCESSFUL!
echo ===========================================
echo Installer located in: frontend/dist-electron
pause
