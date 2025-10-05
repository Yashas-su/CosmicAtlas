#!/bin/bash

echo "Starting NASA Data Exploration Platform..."
echo

echo "Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install frontend dependencies"
    exit 1
fi

echo "Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install backend dependencies"
    exit 1
fi

echo
echo "Starting backend server..."
npm run dev &
BACKEND_PID=$!

echo
echo "Waiting for backend to start..."
sleep 3

echo "Starting frontend development server..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo
echo "NASA Data Exploration Platform is starting up!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
