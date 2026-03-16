package com.osscheduler;

import java.util.*;

public class Scheduler {

    // ─── FCFS ────────────────────────────────────────────────────────────────
    public static ScheduleResult fcfs(List<Process> input) {
        List<Process> processes = deepCopy(input);
        processes.sort(Comparator.comparingInt(Process::getArrivalTime));

        List<int[]> gantt = new ArrayList<>();
        int time = 0;

        for (Process p : processes) {
            if (time < p.getArrivalTime()) time = p.getArrivalTime();
            gantt.add(new int[]{p.getPid(), time, time + p.getBurstTime()});
            time += p.getBurstTime();
            p.setCompletionTime(time);
            p.computeMetrics();
        }
        return new ScheduleResult("FCFS", processes, gantt);
    }

    // ─── SJF (Non-Preemptive) ────────────────────────────────────────────────
    public static ScheduleResult sjf(List<Process> input) {
        List<Process> processes = deepCopy(input);
        List<Process> remaining = new ArrayList<>(processes);
        List<int[]> gantt = new ArrayList<>();
        int time = 0;
        int completed = 0;

        while (completed < processes.size()) {
            List<Process> ready = new ArrayList<>();
            for (Process p : remaining) {
                if (p.getArrivalTime() <= time) ready.add(p);
            }

            if (ready.isEmpty()) {
                time++;
                continue;
            }

            ready.sort(Comparator.comparingInt(Process::getBurstTime));
            Process p = ready.get(0);
            remaining.remove(p);

            gantt.add(new int[]{p.getPid(), time, time + p.getBurstTime()});
            time += p.getBurstTime();
            p.setCompletionTime(time);
            p.computeMetrics();
            completed++;
        }
        return new ScheduleResult("SJF", processes, gantt);
    }

    // ─── Priority (Non-Preemptive, lower number = higher priority) ──────────
    public static ScheduleResult priority(List<Process> input) {
        List<Process> processes = deepCopy(input);
        List<Process> remaining = new ArrayList<>(processes);
        List<int[]> gantt = new ArrayList<>();
        int time = 0;
        int completed = 0;

        while (completed < processes.size()) {
            List<Process> ready = new ArrayList<>();
            for (Process p : remaining) {
                if (p.getArrivalTime() <= time) ready.add(p);
            }

            if (ready.isEmpty()) {
                time++;
                continue;
            }

            ready.sort(Comparator.comparingInt(Process::getPriority));
            Process p = ready.get(0);
            remaining.remove(p);

            gantt.add(new int[]{p.getPid(), time, time + p.getBurstTime()});
            time += p.getBurstTime();
            p.setCompletionTime(time);
            p.computeMetrics();
            completed++;
        }
        return new ScheduleResult("Priority", processes, gantt);
    }

    // ─── Round Robin ─────────────────────────────────────────────────────────
    public static ScheduleResult roundRobin(List<Process> input, int quantum) {
        List<Process> processes = deepCopy(input);
        processes.sort(Comparator.comparingInt(Process::getArrivalTime));

        Queue<Process> queue = new LinkedList<>();
        List<int[]> gantt = new ArrayList<>();
        int time = 0;
        int idx = 0;   // index into sorted processes list

        // add processes that arrive at time 0
        while (idx < processes.size() && processes.get(idx).getArrivalTime() <= time) {
            queue.add(processes.get(idx++));
        }

        while (!queue.isEmpty()) {
            Process p = queue.poll();
            int execTime = Math.min(quantum, p.getRemainingTime());

            gantt.add(new int[]{p.getPid(), time, time + execTime});
            time += execTime;
            p.setRemainingTime(p.getRemainingTime() - execTime);

            // enqueue newly arrived processes
            while (idx < processes.size() && processes.get(idx).getArrivalTime() <= time) {
                queue.add(processes.get(idx++));
            }

            if (p.getRemainingTime() > 0) {
                queue.add(p);
            } else {
                p.setCompletionTime(time);
                p.computeMetrics();
            }
        }
        return new ScheduleResult("Round Robin (Q=" + quantum + ")", processes, gantt);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────
    private static List<Process> deepCopy(List<Process> original) {
        List<Process> copy = new ArrayList<>();
        for (Process p : original) {
            copy.add(new Process(p.getPid(), p.getArrivalTime(), p.getBurstTime(), p.getPriority()));
        }
        return copy;
    }
}
