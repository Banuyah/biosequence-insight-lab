# Quick start in VS Code (Windows)

## Backend terminal
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

## Frontend terminal (open a second terminal)
```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the frontend terminal. Both terminals must stay open.

## Test backend
```powershell
cd backend
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```
