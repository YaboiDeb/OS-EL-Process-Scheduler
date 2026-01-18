// Backend API URL
const API_URL = 'http://localhost:5000';

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    generateProcessInputs();
    checkBackendHealth();
});

/**
 * Check if Flask backend is running
 */
async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        
        if (!data.scheduler_exists) {
            showError('Warning: scheduler.exe not found in backend folder. Please compile your C program first.');
        }
    } catch (error) {
        showError('Backend server is not running. Please start Flask server first: python app.py');
    }
}

/**
 * Generate input fields for processes based on number entered
 */
function generateProcessInputs() {
    const numProcesses = parseInt(document.getElementById('numProcesses').value);
    const container = document.getElementById('processInputs');
    
    if (numProcesses < 1 || numProcesses > 10) {
        alert('Please enter a number between 1 and 10');
        return;
    }
    
    container.innerHTML = '';
    
    for (let i = 1; i <= numProcesses; i++) {
        const processDiv = document.createElement('div');
        processDiv.className = 'process-row';
        processDiv.innerHTML = `
            <h4>Process ${i}</h4>
            <div class="input-grid">
                <div class="input-group">
                    <label for="arrival${i}">Arrival Time:</label>
                    <input type="number" id="arrival${i}" min="0" value="${i - 1}" required>
                </div>
                <div class="input-group">
                    <label for="burst${i}">Burst Time:</label>
                    <input type="number" id="burst${i}" min="1" value="${Math.floor(Math.random() * 10) + 3}" required>
                </div>
                <div class="input-group">
                    <label for="priority${i}">Priority (1=High):</label>
                    <input type="number" id="priority${i}" min="1" value="${i}" required>
                </div>
            </div>
        `;
        container.appendChild(processDiv);
    }
}

/**
 * Collect process data from input fields
 */
function collectProcessData() {
    const numProcesses = parseInt(document.getElementById('numProcesses').value);
    const processes = [];
    
    for (let i = 1; i <= numProcesses; i++) {
        const arrival = parseInt(document.getElementById(`arrival${i}`).value);
        const burst = parseInt(document.getElementById(`burst${i}`).value);
        const priority = parseInt(document.getElementById(`priority${i}`).value);
        
        if (isNaN(arrival) || isNaN(burst) || isNaN(priority)) {
            throw new Error(`Invalid input for Process ${i}`);
        }
        
        if (burst < 1) {
            throw new Error(`Burst time for Process ${i} must be at least 1`);
        }
        
        processes.push({
            pid: i,
            arrival: arrival,
            burst: burst,
            priority: priority
        });
    }
    
    return processes;
}

/**
 * Run the scheduler by calling Flask backend
 */
async function runScheduler() {
    try {
        // Collect input data
        const processes = collectProcessData();
        
        // Show loading state
        showLoading();
        hideError();
        hideResults();
        
        // Call backend API
        const response = await fetch(`${API_URL}/schedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                processes: processes,
                algorithm: 'all'
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to run scheduler');
        }
        
        const data = await response.json();
        
        // Hide loading, show results
        hideLoading();
        displayResults(data);
        
    } catch (error) {
        hideLoading();
        showError(error.message);
        console.error('Error:', error);
    }
}

/**
 * Display results from backend
 */
function displayResults(data) {
    const { raw_output, parsed_results } = data;
    
    // Display raw output
    document.getElementById('outputText').textContent = raw_output;
    document.getElementById('rawOutput').style.display = 'block';
    
    // Display Gantt charts
    displayGanttCharts(parsed_results);
    
    // Display statistics
    displayStatistics(parsed_results);
    
    // Display recommendation
    if (parsed_results.recommendation) {
        document.getElementById('recommendation-text').textContent = parsed_results.recommendation;
        document.getElementById('recommendation').style.display = 'block';
    }
    
    document.getElementById('statistics').style.display = 'block';
}

/**
 * Display Gantt charts for all algorithms
 */
function displayGanttCharts(results) {
    // Show Gantt section
    document.getElementById('ganttSection').style.display = 'block';
    
    // Generate Gantt chart for each algorithm
    generateGanttChart('gantt-fcfs', results.fcfs);
    generateGanttChart('gantt-sjf', results.sjf);
    generateGanttChart('gantt-rr', results.round_robin);
    generateGanttChart('gantt-priority', results.priority);
}

/**
 * Generate a Gantt chart for a specific algorithm
 */
function generateGanttChart(containerId, algorithmData) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (!algorithmData || !algorithmData.processes || algorithmData.processes.length === 0) {
        container.innerHTML = '<p style="color: #999; padding: 20px;">No data available</p>';
        return;
    }
    
    const processes = algorithmData.processes;
    
    // Calculate timeline
    const maxTime = Math.max(...processes.map(p => p.completion));
    const minTime = Math.min(...processes.map(p => p.arrival));
    const timeRange = maxTime - minTime;
    
    // Create timeline with all process executions
    const timeline = createTimeline(processes);
    
    // Create Gantt chart HTML
    const ganttHTML = `
        <div class="gantt-timeline">
            <div class="gantt-label">Time →</div>
            <div class="gantt-bars" style="position: relative;">
                ${timeline.map(segment => {
                    const start = segment.start - minTime;
                    const duration = segment.end - segment.start;
                    const leftPercent = (start / timeRange) * 100;
                    const widthPercent = (duration / timeRange) * 100;
                    
                    const isIdle = segment.pid === 0;
                    const processClass = isIdle ? 'idle' : `p${segment.pid}`;
                    const label = isIdle ? 'Idle' : `P${segment.pid}`;
                    
                    return `
                        <div class="gantt-bar ${processClass}" 
                             style="position: absolute; left: ${leftPercent}%; width: ${widthPercent}%; height: 40px;">
                            ${label}
                            <div class="gantt-bar-tooltip">
                                ${isIdle ? 'CPU Idle' : `Process ${segment.pid}`}<br>
                                Start: ${segment.start} | End: ${segment.end}<br>
                                Duration: ${duration} units
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
        <div class="gantt-scale">
            ${generateTimeScale(minTime, maxTime)}
        </div>
        <div class="gantt-legend">
            ${processes.map(p => `
                <div class="gantt-legend-item">
                    <div class="gantt-legend-color p${p.pid}"></div>
                    <span>P${p.pid} (Burst: ${p.burst}, Arrival: ${p.arrival})</span>
                </div>
            `).join('')}
        </div>
    `;
    
    container.innerHTML = ganttHTML;
}

/**
 * Create timeline showing when each process executes
 */
function createTimeline(processes) {
    const timeline = [];
    let currentTime = 0;
    
    // Sort processes by start time
    const sorted = [...processes].sort((a, b) => a.start - b.start);
    
    sorted.forEach(process => {
        // Add idle time if there's a gap
        if (currentTime < process.start) {
            timeline.push({
                pid: 0,
                start: currentTime,
                end: process.start
            });
        }
        
        // Add process execution
        timeline.push({
            pid: process.pid,
            start: process.start,
            end: process.completion
        });
        
        currentTime = process.completion;
    });
    
    return timeline;
}

/**
 * Generate time scale markers
 */
function generateTimeScale(minTime, maxTime) {
    const markers = [];
    const step = Math.ceil((maxTime - minTime) / 10);
    
    for (let t = minTime; t <= maxTime; t += step) {
        markers.push(`<span>${t}</span>`);
    }
    
    // Always include the end time
    if (markers[markers.length - 1] !== `<span>${maxTime}</span>`) {
        markers.push(`<span>${maxTime}</span>`);
    }
    
    return markers.join('');
}

/**
 * Display algorithm statistics
 */
function displayStatistics(results) {
    // FCFS
    updateStatCard('fcfs', results.fcfs);
    
    // SJF
    updateStatCard('sjf', results.sjf);
    
    // Round Robin
    updateStatCard('rr', results.round_robin);
    
    // Priority
    updateStatCard('priority', results.priority);
}

/**
 * Update a single stat card
 */
function updateStatCard(algorithm, data) {
    if (data) {
        document.getElementById(`${algorithm}-wait`).textContent = 
            data.avg_waiting || 'N/A';
        document.getElementById(`${algorithm}-turn`).textContent = 
            data.avg_turnaround || 'N/A';
        document.getElementById(`${algorithm}-throughput`).textContent = 
            data.throughput || 'N/A';
    }
}

/**
 * Toggle raw output visibility
 */
function toggleRawOutput() {
    const outputText = document.getElementById('outputText');
    if (outputText.style.display === 'none') {
        outputText.style.display = 'block';
    } else {
        outputText.style.display = 'none';
    }
}

/**
 * UI Helper Functions
 */
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('runBtn').disabled = true;
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('runBtn').disabled = false;
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = '❌ Error: ' + message;
    errorDiv.style.display = 'block';
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

function hideResults() {
    document.getElementById('statistics').style.display = 'none';
    document.getElementById('rawOutput').style.display = 'none';
    document.getElementById('recommendation').style.display = 'none';
    document.getElementById('ganttSection').style.display = 'none';
}