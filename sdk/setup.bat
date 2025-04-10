@echo off
echo Setting up NetZap ZMap SDK...

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Please install Node.js first.
    echo Visit https://nodejs.org/ for installation instructions.
    exit /b 1
)

:: Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm is not installed. Please install npm first.
    echo It usually comes with Node.js installation.
    exit /b 1
)

:: Check if ZMap is installed (less critical on Windows as it might be in a different location)
where zmap >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo WARNING: ZMap command not found in PATH.
    echo You'll need to specify the correct ZMap executable path when using the SDK.
    echo Visit https://github.com/zmap/zmap for installation instructions.
    echo.
    echo Press any key to continue anyway...
    pause >nul
)

:: Install dependencies
echo Installing dependencies...
call npm install

:: Build the project
echo Building the SDK...
call npm run build

echo.
echo Setup completed successfully!
echo You can now use the NetZap ZMap SDK.
echo.
echo Try running an example:
echo npm run example:basic

pause 