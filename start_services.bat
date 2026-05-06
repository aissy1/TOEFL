@echo off
echo Starting all services...

:: Terminal 1 — Laravel
start cmd /k "php artisan serve"

:: Terminal 2 — Queue Worker
start cmd /k "php artisan queue:work --tries=3"

:: Terminal 3 — Flask AES
start cmd /k "cd services\aes && venv\Scripts\activate && python app.py"

echo All services started!