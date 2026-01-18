from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import os

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin requests from frontend

# Path to your compiled C program
SCHEDULER_PATH = os.path.join(os.path.dirname(__file__), 'scheduler.exe')

@app.route('/schedule', methods=['POST'])
def schedule_processes():
    """
    Endpoint to run the scheduling algorithm.
    Accepts JSON with process data and algorithm choice.
    Returns the output from the C program.
    """
    try:
        data = request.json
        processes = data.get('processes', [])
        algorithm = data.get('algorithm', 'all')
        
        if not processes:
            return jsonify({'error': 'No processes provided'}), 400
        
        # Prepare input for C program
        # Format: number of processes, then for each process: arrival, burst, priority
        input_lines = [str(len(processes))]
        
        for proc in processes:
            input_lines.append(str(proc['arrival']))
            input_lines.append(str(proc['burst']))
            input_lines.append(str(proc['priority']))
        
        # Join with newlines to simulate user input
        stdin_input = '\n'.join(input_lines) + '\n'
        
        # Execute the C program
        result = subprocess.run(
            [SCHEDULER_PATH],
            input=stdin_input,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode != 0:
            return jsonify({
                'error': 'Scheduler execution failed',
                'stderr': result.stderr
            }), 500
        
        # Parse the output
        output = result.stdout
        parsed_results = parse_scheduler_output(output)
        
        return jsonify({
            'success': True,
            'raw_output': output,
            'parsed_results': parsed_results
        })
        
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Scheduler execution timeout'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def parse_scheduler_output(output):
    """
    Parse the C program output to extract structured data.
    This function extracts algorithm results, averages, and throughput.
    """
    results = {
        'fcfs': {},
        'sjf': {},
        'round_robin': {},
        'priority': {},
        'recommendation': ''
    }
    
    lines = output.split('\n')
    current_algorithm = None
    
    for i, line in enumerate(lines):
        # Detect algorithm sections
        if 'FCFS' in line:
            current_algorithm = 'fcfs'
        elif 'SJF' in line:
            current_algorithm = 'sjf'
        elif 'Round Robin' in line:
            current_algorithm = 'round_robin'
        elif 'Priority Scheduling' in line:
            current_algorithm = 'priority'
        
        # Extract averages
        if 'Average Waiting Time:' in line:
            if current_algorithm:
                avg_wait = line.split(':')[1].strip()
                results[current_algorithm]['avg_waiting'] = avg_wait
        
        if 'Average Turnaround Time:' in line:
            if current_algorithm:
                avg_turn = line.split(':')[1].strip()
                results[current_algorithm]['avg_turnaround'] = avg_turn
        
        if 'Throughput:' in line:
            if current_algorithm:
                throughput = line.split(':')[1].strip()
                results[current_algorithm]['throughput'] = throughput
        
        # Extract recommendation
        if 'RECOMMENDED ALGORITHM:' in line:
            if i + 1 < len(lines):
                results['recommendation'] = lines[i + 1].strip()
    
    return results


@app.route('/health', methods=['GET'])
def health_check():
    """Check if the backend is running and scheduler.exe exists"""
    scheduler_exists = os.path.exists(SCHEDULER_PATH)
    return jsonify({
        'status': 'running',
        'scheduler_path': SCHEDULER_PATH,
        'scheduler_exists': scheduler_exists
    })


if __name__ == '__main__':
    # Check if scheduler.exe exists
    if not os.path.exists(SCHEDULER_PATH):
        print(f"WARNING: scheduler.exe not found at {SCHEDULER_PATH}")
        print("Please compile your C program first:")
        print("  gcc process_scheduler.c -o scheduler.exe")
    else:
        print(f"Scheduler found at: {SCHEDULER_PATH}")
    
    print("\nStarting Flask server...")
    print("Backend will run on: http://localhost:5000")
    print("Make sure to open frontend/index.html in your browser\n")
    
    app.run(debug=True, port=5000)