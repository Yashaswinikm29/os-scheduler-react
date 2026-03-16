package com.osscheduler;

import java.util.List;

public class ScheduleResult {
    private List<Process> processes;
    private List<int[]> ganttChart;   // each int[] = {pid, startTime, endTime}
    private double avgWaitingTime;
    private double avgTurnaroundTime;
    private String algorithm;

    public ScheduleResult(String algorithm, List<Process> processes, List<int[]> ganttChart) {
        this.algorithm = algorithm;
        this.processes = processes;
        this.ganttChart = ganttChart;
        this.avgWaitingTime    = processes.stream().mapToInt(Process::getWaitingTime).average().orElse(0);
        this.avgTurnaroundTime = processes.stream().mapToInt(Process::getTurnaroundTime).average().orElse(0);
    }

    public List<Process>  getProcesses()          { return processes; }
    public List<int[]>    getGanttChart()          { return ganttChart; }
    public double         getAvgWaitingTime()      { return avgWaitingTime; }
    public double         getAvgTurnaroundTime()   { return avgTurnaroundTime; }
    public String         getAlgorithm()           { return algorithm; }
}
