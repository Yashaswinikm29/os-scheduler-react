package com.osscheduler;

import org.junit.jupiter.api.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

public class SchedulerTest {

    private List<Process> getSampleProcesses() {
        List<Process> list = new ArrayList<>();
        list.add(new Process(1, 0, 5, 2));
        list.add(new Process(2, 1, 3, 1));
        list.add(new Process(3, 2, 8, 3));
        list.add(new Process(4, 3, 2, 4));
        return list;
    }

    // ── FCFS ─────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("FCFS: first process should complete at time = burst time")
    void testFCFS_FirstProcessCompletion() {
        List<Process> ps = getSampleProcesses();
        ScheduleResult result = Scheduler.fcfs(ps);
        Process first = result.getProcesses().get(0);
        assertEquals(5, first.getCompletionTime(), "P1 should complete at time 5");
    }

    @Test
    @DisplayName("FCFS: waiting time should be non-negative for all processes")
    void testFCFS_NonNegativeWaitingTime() {
        ScheduleResult result = Scheduler.fcfs(getSampleProcesses());
        for (Process p : result.getProcesses()) {
            assertTrue(p.getWaitingTime() >= 0,
                "Waiting time must be >= 0 for P" + p.getPid());
        }
    }

    @Test
    @DisplayName("FCFS: turnaround = completion - arrival for all processes")
    void testFCFS_TurnaroundFormula() {
        ScheduleResult result = Scheduler.fcfs(getSampleProcesses());
        for (Process p : result.getProcesses()) {
            assertEquals(p.getCompletionTime() - p.getArrivalTime(),
                p.getTurnaroundTime(), "TAT formula failed for P" + p.getPid());
        }
    }

    // ── SJF ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("SJF: shorter burst-time process runs before longer one")
    void testSJF_ShortestFirst() {
        List<Process> ps = new ArrayList<>();
        ps.add(new Process(1, 0, 10, 1));
        ps.add(new Process(2, 0, 3,  1));
        ScheduleResult result = Scheduler.sjf(ps);
        List<int[]> gantt = result.getGanttChart();
        assertEquals(2, gantt.get(0)[0], "P2 (shorter) should run first");
    }

    @Test
    @DisplayName("SJF: all processes must be scheduled")
    void testSJF_AllProcessesScheduled() {
        ScheduleResult result = Scheduler.sjf(getSampleProcesses());
        assertEquals(4, result.getProcesses().size());
        for (Process p : result.getProcesses()) {
            assertTrue(p.getCompletionTime() > 0);
        }
    }

    // ── Priority ─────────────────────────────────────────────────────────────
    @Test
    @DisplayName("Priority: highest priority (lowest number) runs first")
    void testPriority_HighestFirst() {
        List<Process> ps = new ArrayList<>();
        ps.add(new Process(1, 0, 5, 3));
        ps.add(new Process(2, 0, 4, 1));  // highest priority
        ScheduleResult result = Scheduler.priority(ps);
        assertEquals(2, result.getGanttChart().get(0)[0], "P2 (priority 1) should run first");
    }

    @Test
    @DisplayName("Priority: waiting time = turnaround - burst time")
    void testPriority_WaitingTimeFormula() {
        ScheduleResult result = Scheduler.priority(getSampleProcesses());
        for (Process p : result.getProcesses()) {
            assertEquals(p.getTurnaroundTime() - p.getBurstTime(),
                p.getWaitingTime(), "WT formula failed for P" + p.getPid());
        }
    }

    // ── Round Robin ──────────────────────────────────────────────────────────
    @Test
    @DisplayName("Round Robin: all processes complete")
    void testRR_AllComplete() {
        ScheduleResult result = Scheduler.roundRobin(getSampleProcesses(), 2);
        for (Process p : result.getProcesses()) {
            assertTrue(p.getCompletionTime() > 0, "P" + p.getPid() + " did not complete");
        }
    }

    @Test
    @DisplayName("Round Robin: no process waits longer than all others combined")
    void testRR_FairScheduling() {
        ScheduleResult result = Scheduler.roundRobin(getSampleProcesses(), 2);
        int totalBurst = getSampleProcesses().stream()
                .mapToInt(Process::getBurstTime).sum();
        for (Process p : result.getProcesses()) {
            assertTrue(p.getWaitingTime() < totalBurst,
                "P" + p.getPid() + " waited too long");
        }
    }

    // ── Average metrics ──────────────────────────────────────────────────────
    @Test
    @DisplayName("FCFS: average waiting time is positive")
    void testFCFS_AvgWaitingTimePositive() {
        ScheduleResult result = Scheduler.fcfs(getSampleProcesses());
        assertTrue(result.getAvgWaitingTime() >= 0);
    }

    @Test
    @DisplayName("SJF: average turnaround time is positive")
    void testSJF_AvgTurnaroundPositive() {
        ScheduleResult result = Scheduler.sjf(getSampleProcesses());
        assertTrue(result.getAvgTurnaroundTime() > 0);
    }
}
