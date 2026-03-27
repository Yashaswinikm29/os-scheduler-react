package com.osscheduler;

import com.google.gson.*;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.*;
import java.util.*;

@WebServlet("/api/schedule")
public class SchedulerServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {

        res.setContentType("application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");

        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null)
                sb.append(line);
        }

        Gson gson = new Gson();
        JsonObject body = JsonParser.parseString(sb.toString()).getAsJsonObject();

        String algorithm = body.get("algorithm").getAsString();
        int quantum = body.has("quantum") ? body.get("quantum").getAsInt() : 2;
        JsonArray arr = body.getAsJsonArray("processes");

        List<Process> processes = new ArrayList<>();
        for (JsonElement el : arr) {
            JsonObject obj = el.getAsJsonObject();
            processes.add(new Process(
                    obj.get("pid").getAsInt(),
                    obj.get("arrivalTime").getAsInt(),
                    obj.get("burstTime").getAsInt(),
                    obj.has("priority") ? obj.get("priority").getAsInt() : 0));
        }

        ScheduleResult result;
        switch (algorithm.toLowerCase()) {
            case "sjf":
                result = Scheduler.sjf(processes);
                break;
            case "priority":
                result = Scheduler.priority(processes);
                break;
            case "rr":
                result = Scheduler.roundRobin(processes, quantum);
                break;
            case "srtf":
                result = Scheduler.srtf(processes);
                break;
            default:
                result = Scheduler.fcfs(processes);
        }

        // Build JSON response manually for clarity
        JsonObject response = new JsonObject();
        response.addProperty("algorithm", result.getAlgorithm());
        response.addProperty("avgWaitingTime", result.getAvgWaitingTime());
        response.addProperty("avgTurnaroundTime", result.getAvgTurnaroundTime());

        JsonArray procArray = new JsonArray();
        for (Process p : result.getProcesses()) {
            JsonObject po = new JsonObject();
            po.addProperty("pid", p.getPid());
            po.addProperty("arrivalTime", p.getArrivalTime());
            po.addProperty("burstTime", p.getBurstTime());
            po.addProperty("priority", p.getPriority());
            po.addProperty("completionTime", p.getCompletionTime());
            po.addProperty("turnaroundTime", p.getTurnaroundTime());
            po.addProperty("waitingTime", p.getWaitingTime());
            procArray.add(po);
        }
        response.add("processes", procArray);

        JsonArray ganttArray = new JsonArray();
        for (int[] slot : result.getGanttChart()) {
            JsonObject g = new JsonObject();
            g.addProperty("pid", slot[0]);
            g.addProperty("start", slot[1]);
            g.addProperty("end", slot[2]);
            ganttArray.add(g);
        }
        response.add("ganttChart", ganttArray);

        res.getWriter().write(gson.toJson(response));
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setStatus(200);
    }
}
