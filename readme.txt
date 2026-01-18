# CPU Process Scheduling Simulator
## Operating Systems Project

A complete implementation of CPU scheduling algorithms with web-based visualization. This project demonstrates the working of FCFS, SJF, Round Robin, and Priority scheduling algorithms.

---

## 🎯 Project Overview

**Purpose:** Compare different CPU scheduling algorithms and visualize their performance metrics.

**Tech Stack:**
- **Core Algorithms:** C programming language
- **Backend API:** Python Flask
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Integration:** Python subprocess module

---

## 📂 Project Structure

```
OS-Scheduler-Project/
├── backend/
│   ├── process_scheduler.c    # C source code with all algorithms
│   ├── scheduler.exe           # Compiled C program (Windows)
│   ├── app.py                  # Flask backend API
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── index.html             # Main user interface
│   ├── styles.css             # Styling and layout
│   └── script.js              # Frontend logic and API calls
└── README.md                  # This file
```

---

## 🚀 Setup Instructions

### Prerequisites
- **GCC Compiler** (MinGW for Windows)
- **Python 3.8+**
- **pip** (Python package manager)
- Web browser (Chrome, Firefox, Edge)

### Step 1: Compile the C Program

Open Command Prompt in the `backend` folder and run:

```bash
cd backend
gcc process_scheduler.c -o scheduler.exe
```

**Verify compilation:**
```bash
dir scheduler.exe
```
You should see `scheduler.exe` listed.

### Step 2: Install Python Dependencies

Still in the `backend` folder:

```bash
pip install -r requirements.txt
```

This installs Flask and Flask-CORS.

### Step 3: Start the Flask Backend

```bash
python app.py
```

**Expected output:**
```
Scheduler found at: [path]\scheduler.exe
Starting Flask server...
Backend will run on: http://localhost:5000
```

**Keep this terminal open** - the backend must keep running.

### Step 4: Open the Frontend

1. Open a **new** File Explorer window
2. Navigate to the `frontend` folder
3. **Double-click** `index.html`
4. Your default browser will open the application

**Alternative:** Right-click `index.html` → Open with → Chrome/Firefox

---

## 📖 How to Use

### Basic Usage

1. **Enter number of processes** (1-10)
2. **Click "Generate Fields"** to create input rows
3. **Fill in process details:**
   - **Arrival Time:** When process enters the system
   - **Burst Time:** CPU time required
   - **Priority:** 1 = highest priority, higher numbers = lower priority
4. **Click "Run All Algorithms"**
5. **View results:**
   - Performance statistics for each algorithm
   - System recommendation
   - Complete program output

### Example Input

**Process 1:** Arrival=0, Burst=8, Priority=2  
**Process 2:** Arrival=1, Burst=4, Priority=1  
**Process 3:** Arrival=2, Burst=9, Priority=3

This will run all four algorithms and compare their performance.

---

## 🔧 Technical Details

### How It Works

1. **User Input:** Frontend collects process data via HTML form
2. **API Call:** JavaScript sends JSON data to Flask backend via POST request
3. **Data Formatting:** Flask formats input as stdin string for C program
4. **Execution:** Flask runs `scheduler.exe` using Python's subprocess module
5. **Output Capture:** Flask captures stdout from C program
6. **Parsing:** Flask parses output to extract statistics
7. **Response:** JSON data sent back to frontend
8. **Visualization:** JavaScript displays results in organized format

### Data Flow

```
Frontend (HTML/JS) 
    ↓ [HTTP POST]
Flask Backend (app.py)
    ↓ [subprocess.run()]
C Program (scheduler.exe)
    ↓ [stdout]
Flask Backend (parsing)
    ↓ [HTTP Response]
Frontend (display results)
```

### Algorithms Implemented

1. **FCFS (First Come First Serve)**
   - Non-preemptive
   - Executes in arrival order
   - Simple but can cause convoy effect

2. **SJF (Shortest Job First)**
   - Non-preemptive
   - Shortest burst time first
   - Minimizes average waiting time
   - Can cause starvation

3. **Round Robin**
   - Preemptive
   - Time quantum = 4 units
   - Fair time-sharing
   - Good for time-sharing systems

4. **Priority Scheduling**
   - Non-preemptive
   - Lower priority number = higher priority
   - Can cause starvation of low-priority processes

---

## 📊 Performance Metrics

The system calculates and displays:

- **Waiting Time:** Time spent in ready queue
- **Turnaround Time:** Total time from arrival to completion
- **Throughput:** Number of processes completed per unit time
- **Recommendation:** Best algorithm for given workload

---

## 🎓 Viva Preparation

### Key Points to Explain

**1. Why Flask?**
- Lightweight Python web framework
- Easy integration with C programs via subprocess
- Simple REST API creation
- Perfect for academic projects
- Cross-platform compatibility

**2. How is C integrated?**
- Flask uses Python's `subprocess` module
- Runs compiled C program (`scheduler.exe`)
- Passes input via stdin
- Captures output via stdout
- No code modification needed - C program runs as-is

**3. Operating Systems Concepts Demonstrated**
- **Process scheduling:** Core OS concept
- **Multiple scheduling algorithms:** Real OS uses these
- **Performance metrics:** Critical for OS evaluation
- **Time quantum:** Used in real time-sharing systems
- **Priority levels:** Real OS process priorities
- **Preemption vs non-preemption:** Key scheduling concept

**4. Why separate frontend and backend?**
- **Separation of concerns:** UI logic separate from algorithm logic
- **Modularity:** Can change frontend without touching C code
- **Reusability:** Same C program can be used in different interfaces
- **Testing:** Can test algorithms independently
- **Industry standard:** Mirrors real-world application architecture

**5. Advantages of this approach**
- **Real execution:** Not simulated, actual C program runs
- **Accurate results:** Direct output from algorithms
- **Educational:** Shows integration techniques
- **Extensible:** Easy to add more algorithms
- **Professional:** Follows web development best practices

### Common Viva Questions

**Q: Why not implement algorithms in JavaScript?**  
A: The C implementation demonstrates low-level OS concepts better and matches how actual OS schedulers work. Also required as part of OS curriculum.

**Q: How does Flask communicate with the C program?**  
A: Through Python's subprocess module, which spawns a new process to run the compiled executable and captures its input/output streams.

**Q: What happens if the C program crashes?**  
A: Flask's subprocess has timeout and error handling. Any errors are caught and displayed to the user with appropriate messages.

**Q: Can this handle multiple users?**  
A: Yes, Flask can handle concurrent requests. Each request spawns its own C process instance.

**Q: How would you deploy this?**  
A: For production: Use Gunicorn/uWSGI for Flask, nginx as reverse proxy, and host on cloud platforms like AWS or Heroku.

---

## 🐛 Troubleshooting

### Issue: "Backend server is not running"
**Solution:** Start Flask server first: `python app.py` in backend folder

### Issue: "scheduler.exe not found"
**Solution:** Compile C program: `gcc process_scheduler.c -o scheduler.exe`

### Issue: "CORS error" in browser console
**Solution:** Ensure Flask-CORS is installed: `pip install flask-cors`

### Issue: Port 5000 already in use
**Solution:** Change port in `app.py`: `app.run(debug=True, port=5001)`  
Also update `API_URL` in `script.js` to match new port

### Issue: Results not displaying
**Solution:** Check browser console (F12) for JavaScript errors  
Verify Flask terminal shows successful request processing

---

## 📝 Testing Checklist

Before viva demonstration:

- [ ] C program compiles without errors
- [ ] Flask server starts successfully
- [ ] Frontend opens in browser
- [ ] Can input process data
- [ ] All four algorithms run successfully
- [ ] Results display correctly
- [ ] Raw output is readable
- [ ] Recommendation appears
- [ ] Tested with different process counts (1, 3, 5, 10)
- [ ] Error handling works (invalid inputs)

---

## 🎯 Features Demonstrated

✅ Multiple scheduling algorithms  
✅ Real-time performance comparison  
✅ Interactive web interface  
✅ Backend-Frontend integration  
✅ RESTful API design  
✅ Algorithm recommendation system  
✅ Complete output logging  
✅ Error handling and validation  
✅ Responsive design  
✅ Professional UI/UX

---

## 📚 References

- Operating System Concepts by Silberschatz, Galvin, and Gagne
- Modern Operating Systems by Andrew S. Tanenbaum
- Flask Documentation: https://flask.palletsprojects.com/
- CPU Scheduling Algorithms: https://www.geeksforgeeks.org/cpu-scheduling-in-operating-systems/

---

## 👨‍🎓 Project Information

**Course:** Operating Systems  
**Topic:** CPU Process Scheduling Algorithms  
**Implementation:** C + Python Flask + HTML/CSS/JS  
**Date:** January 2026

---

## 📄 License

This project is for educational purposes as part of an Operating Systems course.

---

## 🤝 Contributing

This is an academic project. For improvements or suggestions:
1. Test thoroughly
2. Document changes
3. Ensure compatibility with existing C program
4. Maintain code simplicity for educational clarity

---

**End of Documentation**