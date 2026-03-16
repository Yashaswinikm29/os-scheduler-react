package com.osscheduler;

public class Process {
    private int pid;
    private int arrivalTime;
    private int burstTime;
    private int priority;

    // Computed fields
    private int completionTime;
    private int turnaroundTime;
    private int waitingTime;
    private int remainingTime;

    public Process(int pid, int arrivalTime, int burstTime, int priority) {
        this.pid = pid;
        this.arrivalTime = arrivalTime;
        this.burstTime = burstTime;
        this.priority = priority;
        this.remainingTime = burstTime;
    }

    // Getters and Setters
    public int getPid()                         { return pid; }
    public int getArrivalTime()                 { return arrivalTime; }
    public int getBurstTime()                   { return burstTime; }
    public int getPriority()                    { return priority; }
    public int getCompletionTime()              { return completionTime; }
    public int getTurnaroundTime()              { return turnaroundTime; }
    public int getWaitingTime()                 { return waitingTime; }
    public int getRemainingTime()               { return remainingTime; }

    public void setCompletionTime(int t)        { this.completionTime = t; }
    public void setTurnaroundTime(int t)        { this.turnaroundTime = t; }
    public void setWaitingTime(int t)           { this.waitingTime = t; }
    public void setRemainingTime(int t)         { this.remainingTime = t; }

    public void computeMetrics() {
        this.turnaroundTime = this.completionTime - this.arrivalTime;
        this.waitingTime    = this.turnaroundTime - this.burstTime;
    }

    @Override
    public String toString() {
        return String.format("P%d [AT=%d BT=%d P=%d CT=%d TAT=%d WT=%d]",
                pid, arrivalTime, burstTime, priority,
                completionTime, turnaroundTime, waitingTime);
    }
}
