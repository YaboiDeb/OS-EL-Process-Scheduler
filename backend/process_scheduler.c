#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

#define MAX_PROCESSES 50
#define TIME_QUANTUM 4

// Process structure - holds all info about one process
typedef struct {
    int pid;              // Process ID
    int arrival_time;     // When process arrives
    int burst_time;       // Time needed to complete
    int remaining_time;   // Time left to complete
    int priority;         // Priority (lower number = higher priority)
    int completion_time;  // When process finishes
    int waiting_time;     // Time spent waiting
    int turnaround_time;  // Total time from arrival to completion
} Process;

// Function declarations
void input_processes(Process p[], int n);
void print_processes(Process p[], int n);
void fcfs(Process p[], int n);
void sjf(Process p[], int n);
void round_robin(Process p[], int n);
void priority_scheduling(Process p[], int n);
void print_results(Process p[], int n, char* algorithm_name);
void copy_processes(Process src[], Process dest[], int n);
void recommend_algorithm(Process p[], int n);

int main() {
    int n;
    Process original[MAX_PROCESSES];
    Process temp[MAX_PROCESSES];
    
    printf("===================================\n");
    printf("  PROCESS SCHEDULING SIMULATOR\n");
    printf("===================================\n\n");
    
    // Get number of processes
    printf("Enter number of processes (1-50): ");
    scanf("%d", &n);
    
    if (n <= 0 || n > MAX_PROCESSES) {
        printf("Invalid number! Please enter between 1 and 50.\n");
        return 1;
    }
    
    // Get process details from user
    input_processes(original, n);
    print_processes(original, n);
    
    // Recommend best algorithm based on workload
    recommend_algorithm(original, n);
    
    printf("\n===================================\n");
    printf("  SIMULATING ALL ALGORITHMS\n");
    printf("===================================\n");
    
    // Test FCFS
    copy_processes(original, temp, n);
    fcfs(temp, n);
    print_results(temp, n, "FCFS (First Come First Serve)");
    
    // Test SJF
    copy_processes(original, temp, n);
    sjf(temp, n);
    print_results(temp, n, "SJF (Shortest Job First)");
    
    // Test Round Robin
    copy_processes(original, temp, n);
    round_robin(temp, n);
    print_results(temp, n, "Round Robin");
    
    // Test Priority
    copy_processes(original, temp, n);
    priority_scheduling(temp, n);
    print_results(temp, n, "Priority Scheduling");
    
    return 0;
}

// Get process details from user
void input_processes(Process p[], int n) {
    printf("\nEnter details for each process:\n");
    printf("(Arrival Time, Burst Time, Priority)\n\n");
    
    for (int i = 0; i < n; i++) {
        p[i].pid = i + 1;
        printf("Process %d:\n", i + 1);
        printf("  Arrival Time: ");
        scanf("%d", &p[i].arrival_time);
        printf("  Burst Time: ");
        scanf("%d", &p[i].burst_time);
        printf("  Priority (1=highest): ");
        scanf("%d", &p[i].priority);
        printf("\n");
        
        p[i].remaining_time = p[i].burst_time;
    }
}

// Display all processes
void print_processes(Process p[], int n) {
    printf("\n%-5s | %-10s | %-10s | %-10s\n", 
           "PID", "Arrival", "Burst", "Priority");
    printf("-----------------------------------------------\n");
    for (int i = 0; i < n; i++) {
        printf("%-5d | %-10d | %-10d | %-10d\n",
               p[i].pid, p[i].arrival_time, p[i].burst_time, p[i].priority);
    }
}

// FCFS: First Come First Serve
void fcfs(Process p[], int n) {
    // Sort by arrival time
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (p[j].arrival_time > p[j + 1].arrival_time) {
                Process temp = p[j];
                p[j] = p[j + 1];
                p[j + 1] = temp;
            }
        }
    }
    
    int current_time = 0;
    
    for (int i = 0; i < n; i++) {
        // If CPU is idle, jump to next arrival
        if (current_time < p[i].arrival_time) {
            current_time = p[i].arrival_time;
        }
        
        // Process runs to completion
        current_time += p[i].burst_time;
        p[i].completion_time = current_time;
        p[i].turnaround_time = p[i].completion_time - p[i].arrival_time;
        p[i].waiting_time = p[i].turnaround_time - p[i].burst_time;
    }
}

// SJF: Shortest Job First (non-preemptive)
void sjf(Process p[], int n) {
    int current_time = 0;
    int completed = 0;
    bool is_completed[MAX_PROCESSES] = {false};
    
    while (completed != n) {
        int idx = -1;
        int min_burst = 99999;
        
        // Find shortest job that has arrived
        for (int i = 0; i < n; i++) {
            if (p[i].arrival_time <= current_time && !is_completed[i]) {
                if (p[i].burst_time < min_burst) {
                    min_burst = p[i].burst_time;
                    idx = i;
                }
            }
        }
        
        if (idx != -1) {
            // Execute this process
            current_time += p[idx].burst_time;
            p[idx].completion_time = current_time;
            p[idx].turnaround_time = p[idx].completion_time - p[idx].arrival_time;
            p[idx].waiting_time = p[idx].turnaround_time - p[idx].burst_time;
            is_completed[idx] = true;
            completed++;
        } else {
            // CPU is idle
            current_time++;
        }
    }
}

// Round Robin: Each process gets equal time slices
void round_robin(Process p[], int n) {
    int current_time = 0;
    int completed = 0;
    
    while (completed != n) {
        bool did_something = false;
        
        for (int i = 0; i < n; i++) {
            // Check if process has arrived and has remaining time
            if (p[i].arrival_time <= current_time && p[i].remaining_time > 0) {
                did_something = true;
                
                if (p[i].remaining_time > TIME_QUANTUM) {
                    // Run for time quantum
                    current_time += TIME_QUANTUM;
                    p[i].remaining_time -= TIME_QUANTUM;
                } else {
                    // Process finishes
                    current_time += p[i].remaining_time;
                    p[i].remaining_time = 0;
                    p[i].completion_time = current_time;
                    p[i].turnaround_time = p[i].completion_time - p[i].arrival_time;
                    p[i].waiting_time = p[i].turnaround_time - p[i].burst_time;
                    completed++;
                }
            }
        }
        
        if (!did_something) {
            current_time++;
        }
    }
}

// Priority Scheduling: Higher priority (lower number) runs first
void priority_scheduling(Process p[], int n) {
    int current_time = 0;
    int completed = 0;
    bool is_completed[MAX_PROCESSES] = {false};
    
    while (completed != n) {
        int idx = -1;
        int highest_priority = 99999;
        
        // Find highest priority process that has arrived
        for (int i = 0; i < n; i++) {
            if (p[i].arrival_time <= current_time && !is_completed[i]) {
                if (p[i].priority < highest_priority) {
                    highest_priority = p[i].priority;
                    idx = i;
                }
            }
        }
        
        if (idx != -1) {
            // Execute this process
            current_time += p[idx].burst_time;
            p[idx].completion_time = current_time;
            p[idx].turnaround_time = p[idx].completion_time - p[idx].arrival_time;
            p[idx].waiting_time = p[idx].turnaround_time - p[idx].burst_time;
            is_completed[idx] = true;
            completed++;
        } else {
            // CPU is idle
            current_time++;
        }
    }
}

// Print performance results
void print_results(Process p[], int n, char* algorithm_name) {
    float total_waiting = 0;
    float total_turnaround = 0;
    
    printf("\n--- %s ---\n", algorithm_name);
    printf("%-5s | %-15s | %-15s\n", "PID", "Waiting Time", "Turnaround Time");
    printf("-------------------------------------------\n");
    
    for (int i = 0; i < n; i++) {
        printf("%-5d | %-15d | %-15d\n", 
               p[i].pid, p[i].waiting_time, p[i].turnaround_time);
        total_waiting += p[i].waiting_time;
        total_turnaround += p[i].turnaround_time;
    }
    
    printf("\nAverage Waiting Time: %.2f\n", total_waiting / n);
    printf("Average Turnaround Time: %.2f\n", total_turnaround / n);
    printf("Throughput: %.2f processes/unit time\n", 
           (float)n / p[n-1].completion_time);
}

// Copy processes for testing different algorithms
void copy_processes(Process src[], Process dest[], int n) {
    for (int i = 0; i < n; i++) {
        dest[i] = src[i];
        dest[i].remaining_time = src[i].burst_time;
    }
}

// Recommend best algorithm based on workload
void recommend_algorithm(Process p[], int n) {
    int total_burst = 0;
    int short_jobs = 0;
    int long_jobs = 0;
    
    // Analyze workload
    for (int i = 0; i < n; i++) {
        total_burst += p[i].burst_time;
        if (p[i].burst_time < 10) {
            short_jobs++;
        } else {
            long_jobs++;
        }
    }
    
    float avg_burst = (float)total_burst / n;
    
    printf("\n===================================\n");
    printf("  WORKLOAD ANALYSIS\n");
    printf("===================================\n");
    printf("Average Burst Time: %.2f\n", avg_burst);
    printf("Short Jobs (< 10): %d\n", short_jobs);
    printf("Long Jobs (>= 10): %d\n", long_jobs);
    
    printf("\nRECOMMENDED ALGORITHM: ");
    
    if (short_jobs > long_jobs && avg_burst < 15) {
        printf("SJF - Many short jobs benefit from shortest job first\n");
    } else if (long_jobs > short_jobs * 2) {
        printf("Priority - Long jobs benefit from priority scheduling\n");
    } else {
        printf("Round Robin - Mixed workload benefits from fair time sharing\n");
    }
}